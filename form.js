// Renders each Wix form on the page from its schema: <div class="wix-form" data-form-id="…">.
import { createFormStore, FORM_ERROR, otherValue } from "/js/wix/form-store.js";

var OTHER = "__other__";
var AUTO = { CONTACTS_EMAIL: "email", CONTACTS_PHONE: "tel", CONTACTS_FIRST_NAME: "given-name", CONTACTS_LAST_NAME: "family-name", CONTACTS_COMPANY: "organization" };
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function inputType(c) { return c === "email" ? "email" : c === "phone" ? "tel" : "text"; }

function fieldHtml(f, uid) {
  var id = uid + "-" + f.target, req = f.required ? ' <span class="req" aria-hidden="true">*</span>' : "";
  var common = ' id="' + id + '" name="' + esc(f.target) + '"' + (f.required ? " required" : "") + ' aria-describedby="' + id + '-err"';
  var auto = AUTO[f.identifier] ? ' autocomplete="' + AUTO[f.identifier] + '"' : "";
  var html = "";
  if (f.control === "radio") {
    html += '<fieldset class="field" data-target="' + esc(f.target) + '"><legend>' + esc(f.label) + req + "</legend>";
    (f.choices || []).forEach(function (c, i) {
      html += '<label class="choice"><input type="radio" name="' + esc(f.target) + '" value="' + esc(c.value) + '"' + (i === 0 ? ' id="' + id + '"' : "") + "> " + esc(c.label) + "</label>";
    });
    return html + '<p class="error" id="' + id + '-err" role="alert" hidden></p></fieldset>';
  }
  html += '<div class="field" data-target="' + esc(f.target) + '"><label for="' + id + '">' + esc(f.label) + req + "</label>";
  if (f.control === "textarea") {
    html += "<textarea" + common + (f.validation && f.validation.maxLength ? ' maxlength="' + f.validation.maxLength + '"' : "") + "></textarea>";
  } else if (f.control === "select") {
    html += "<select" + common + '><option value="">Choose one</option>';
    (f.choices || []).forEach(function (c) { html += '<option value="' + esc(c.value) + '">' + esc(c.label) + "</option>"; });
    if (f.otherOption) html += '<option value="' + OTHER + '">' + esc(f.otherOption.label || "Other") + "</option>";
    html += "</select>";
    if (f.otherOption) html += '<input class="other" type="text" data-other="' + esc(f.target) + '" aria-label="' + esc(f.label) + ': other" hidden>';
  } else {
    html += '<input type="' + inputType(f.control) + '"' + common + auto + ">";
  }
  if (f.description) html += '<p class="small">' + esc(f.description) + "</p>";
  return html + '<p class="error" id="' + id + '-err" role="alert" hidden></p></div>';
}

function mount(root, n) {
  var store = createFormStore({ formId: root.dataset.formId });
  var uid = "f" + n, built = "", formEl = null;
  root.innerHTML = '<p class="small">Loading the form…</p>';

  function build(s) {
    var html = '<form novalidate><p class="small"><span class="req">*</span> Required</p>';
    s.form.fields.forEach(function (f) { html += fieldHtml(f, uid); });
    html += '<p class="error" data-form-error role="alert" hidden></p>';
    html += '<button class="button" type="submit">' + esc(s.form.submitText || "Send") + "</button></form>";
    root.innerHTML = html;
    formEl = root.querySelector("form");
    formEl.addEventListener("input", onInput);
    formEl.addEventListener("change", onInput);
    formEl.addEventListener("focusout", function (e) { if (e.target.name) store.validate(e.target.name); });
    formEl.addEventListener("submit", function (e) { store.submit(e); });
  }
  function onInput(e) {
    var t = e.target, s = store.getState();
    if (t.dataset.other) {
      var of = s.form.fields.find(function (f) { return f.target === t.dataset.other; });
      store.setValue(of.target, otherValue(of, t.value));
      return;
    }
    if (!t.name) return;
    var f = s.form.fields.find(function (x) { return x.target === t.name; });
    if (!f) return;
    if (f.control === "select" && f.otherOption) {
      var box = formEl.querySelector('[data-other="' + f.target + '"]');
      box.hidden = t.value !== OTHER;
      store.setValue(f.target, t.value === OTHER ? otherValue(f, box.value) : t.value);
      if (t.value === OTHER) box.focus();
      return;
    }
    store.setValue(f.target, t.value);
  }
  function render(s) {
    if (s.outcome) {
      if (!root.dataset.sent) { root.dataset.sent = "1"; document.dispatchEvent(new CustomEvent("vhg:form-sent", { detail: { formId: root.dataset.formId } })); }
      if (s.outcome.url) { location.href = s.outcome.url; return; }
      var msg = s.outcome.message || "Thank you. We got it.";
      root.innerHTML = '<div class="thanks" role="status" tabindex="-1">' + msg.split("\n").map(esc).join("<br>") + "</div>";
      root.firstChild.focus();
      built = "done";
      return;
    }
    if (!s.form) {
      if (s.errors[FORM_ERROR]) root.innerHTML = '<p class="error" role="alert">This form could not load. Please call or email us instead.</p>';
      return;
    }
    if (s.closed) { root.innerHTML = "<p>" + esc(s.form.disabledMessage || "This form is not taking submissions right now. Please call or email us.") + "</p>"; return; }
    var sig = s.form.fields.map(function (f) { return f.target + (f.required ? "!" : ""); }).join("|");
    if (sig !== built) { build(s); built = sig; }
    s.form.fields.forEach(function (f) {
      var wrap = formEl.querySelector('[data-target="' + f.target + '"]');
      if (!wrap) return;
      var err = s.errors[f.target], p = wrap.querySelector(".error");
      p.textContent = err || "";
      p.hidden = !err;
      wrap.querySelectorAll("input,select,textarea").forEach(function (c) {
        if (c.dataset.other) return;
        if (err) c.setAttribute("aria-invalid", "true"); else c.removeAttribute("aria-invalid");
      });
    });
    var fe = formEl.querySelector("[data-form-error]");
    fe.textContent = s.errors[FORM_ERROR] || "";
    fe.hidden = !s.errors[FORM_ERROR];
    var btn = formEl.querySelector("button[type=submit]");
    btn.disabled = s.loading;
    btn.setAttribute("aria-busy", s.loading ? "true" : "false");
  }
  store.subscribe(render);
  render(store.getState());
  store.start();
}
document.querySelectorAll(".wix-form[data-form-id]").forEach(mount);