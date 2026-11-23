(function(){var b=document.querySelector(".menu"),n=document.getElementById("mainnav");if(!b||!n)return;b.addEventListener("click",function(){var o=b.getAttribute("aria-expanded")==="true";b.setAttribute("aria-expanded",o?"false":"true");n.classList.toggle("open",!o);});})();
// Visit counter (GoatCounter): page views only, no cookies. Paths carry the site name so this site's pages stay apart from the other sites on the same counter.
(function(){if(window.vhgCountLoaded)return;window.vhgCountLoaded=true;var h=location.hostname.replace(/^www\./,'');window.goatcounter={path:function(p){return '/'+h+p.replace(/\?.*$/,'');}};var s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.setAttribute('data-goatcounter','https://vhg-guide.goatcounter.com/count');document.head.appendChild(s);})();
// Google Ad Grants measurement. Inert until GOOGLE_TAG holds the Google tag ID (G-… for Google Analytics, or AW-… for Google Ads).
// Counts the actions the grant optimizes for: a sent form (referral, volunteer, partner, contact), a tap to call or email,
// a click to give through PayPal, and a click into the Resource Guide. Each is a Google event; mark them as key events or conversions in Google.
(function(){
  var GOOGLE_TAG = "";
  if (!GOOGLE_TAG || window.vhgTagLoaded) return;
  window.vhgTagLoaded = true;
  var s = document.createElement("script"); s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GOOGLE_TAG);
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_TAG);
  function send(name, params){ window.gtag("event", name, params || {}); }
  var page = location.pathname.replace(/^\/$/, "/index.html");
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href");
    if (/^tel:/i.test(h)) { if (!/^tel:(911|988)$/.test(h)) send("contact_call", { page: page }); }
    else if (/^mailto:/i.test(h)) send("contact_email", { page: page });
    else if (/paypal\.com\/donate/i.test(h)) {
      var m = /[?&]amount=(\d+)/.exec(h);
      send("donate_click", m ? { page: page, value: Number(m[1]), currency: "USD" } : { page: page });
    }
    else if (/^https:\/\/guide\.vethomeguard\.org\//i.test(h)) send("guide_open", { page: page, link_url: h });
  });
  document.addEventListener("vhg:form-sent", function(e){
    send("generate_lead", { page: page, form_id: e.detail && e.detail.formId });
  });
})();
