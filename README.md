# vethomeguard.org

The Veteran Home Guardians website: home, Our Story, Refer a Veteran, Volunteer, Partner, Sponsor, Donate and Contact.

This repository is the master copy of the site. The site is hosted on Wix as a headless site
("Veteran Home Guardians (new", site id `a28108ab-792b-4000-82c5-d5a44f671b2c`), which serves exactly the files here. Make changes here, then publish.

Copied from Wix on November 20, 2026, byte for byte. Before that the pages lived only in Wix.

## What lives elsewhere

This site links to the guides and finders rather than copying them, so nothing is kept twice:

- The Veteran Resource Guide: `travisvought-byte/vhg-veteran-resident-guide` (guide.vethomeguard.org).
- The Ohio Bingo Finder and FindBingo.org: built in the guide repository (findbingo.org, findbingo.org/ohio).
- The cannabis guides: `travisvought-byte/ohio-cannabis-directory` (the-reefer.com) and `travisvought-byte/OhioWeed` (ohioweed.org).
- Bingo halls and partnership: `travisvought-byte/ohiobingo` (ohiobingo.org).

## Files

- The pages are plain HTML at the top level, with `site.css` and small scripts beside them.
- `js/wix/` is the Wix forms client, as Wix's headless kit installs it. `js/wix/config.js` holds this
  site's Wix client id. The forms on the pages send their entries to Wix Forms through it.
- Wix serves its own `robots.txt` and `/sitemap.xml` in place of the files here. Keep them anyway.

## Publishing to Wix

Merging to `main` does not change the live site by itself.

- **Through Claude's Wix connection.** The changed files are sent, and the live copies are read back and
  compared with this repository.
- **From GitHub.** `.github/workflows/publish.yml`, run by hand from the Actions tab, runs
  `scripts/publish_wix.py` (the same script as the Ohiomom repository). **check** compares the live site
  with this repository and changes nothing. **publish** sends the files, reads the site back and compares
  again; it never deletes a live file and only publishes from `main`. It needs the repository secrets
  `WIX_API_KEY` and `WIX_ACCOUNT_ID`; until they are added it says so and does nothing.
- **From a shell.** `WIX_TOKEN=$(npx @wix/cli@latest token) python3 scripts/publish_wix.py --check`, then
  `--publish`, after `npx @wix/cli@latest login`.
