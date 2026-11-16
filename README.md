# Naman Aggarwal — portfolio

A small, custom Hugo site: Lora prose, Inter navigation, warm ivory and rust. No theme modules, frontend build pipeline, third-party font requests, analytics, or database.

## Preview

Use Hugo 0.126.3 (the version pinned in CI).

```sh
hugo server --buildDrafts --destination public-preview --bind 127.0.0.1
```

Open http://localhost:1313. The DDIA bookshelf entry is a draft and appears only when `--buildDrafts` is enabled. The local server uses `noindex`. Draft labels are hidden in the interface; `draft: true` still excludes entries from production. Keep preview and production output folders separate.

```sh
hugo --minify --destination public
python3 tests/check_site.py public
hugo --buildDrafts --destination public-preview
python3 tests/check_site.py public-preview --preview
```

Use a clean destination if switching a folder from a draft build to production: Hugo does not automatically remove old draft files. CI always starts with a fresh checkout.

## Content

- `content/post/`: original tutorials; existing `/post/.../` URLs are retained.
- `content/project/`: original projects; existing `/project/.../` URLs are retained.
- `content/reading/`: bookshelf entries with optional brief notes.
- `content/about.md`: current biography.
- `content/authors/admin/_index.md`: current and previous experience, plus education.
- `static/uploads/resume.pdf`: existing résumé, preserved unchanged.

Images and downloads stay with their original page bundles. The only changes to tutorial bodies remove obsolete presentation attributes. The legacy `toc` shortcode is intentionally empty: the shared article layout provides one collapsible contents menu.

## Add to the bookshelf

```sh
hugo new reading/example.md
```

Set `reading_kind` to `book`, `paper`, or `article`; fill in the title, `source_author`, `source_url`, and optional short `description`. Use `status` for Reading, Finished, or To read, and `weight` to order the shelf. Keep `draft: true` until ready to publish.

Leave the Markdown body empty for a source-only entry, or add a few sentences or bullets. The body appears in a small expandable **Brief notes** section directly beneath the entry. Entries have no separate article pages; keep `_build.render: never` and `_build.list: local`. Longer ideas and essays belong in `content/post/` under Writing.

DDIA remains as one book on the local shelf. The chapter pages and Redis Notes entry have been removed from the site. The original workspace note files are untouched. The checks guard against the removed pages reappearing; update the DDIA draft expectation when you decide to publish its shelf entry.

## Design and behaviour

Typography and responsive layouts are in `assets/css/editorial.css`. Fonts are self-hosted as WOFF2 with their OFL licenses in `static/fonts/`. JavaScript only adds code-copy buttons, image enlargement, and accessible table scrolling. Content and source links remain usable without it.

Existing article text has been preserved rather than technically rewritten. The historical résumé has not been updated. The biography and current Oracle role include details supplied by Naman, with the role dated June 2025–Present.

## Browser checks (optional)

Install `playwright-core` outside the repository and point `NODE_PATH` at that installation, then run `node tests/browser.cjs` with the local Hugo preview running. The script uses an isolated headless Chrome instance, checks desktop/mobile overflow, links/assets, fonts, the bookshelf, contents, code copying and image enlargement, and writes screenshots into ignored `artifacts/`. Set `CHROME_PATH` if Chrome is installed somewhere other than the default macOS path.

## Deployment

Temporarily, GitHub Pages serves the locally built `docs/` directory on `main`. In the repository's **Settings → Pages**, set **Source: Deploy from a branch**, **Branch: main**, and **Folder: /docs**.

After changing content or layouts, rebuild and validate before committing both the source changes and generated output:

```sh
hugo --minify --cleanDestinationDir --destination docs
python3 tests/check_site.py docs
```

Use Hugo 0.126.3. Production builds exclude drafts; never use `--buildDrafts` with the tracked `docs/` directory. `static/.nojekyll` is copied into the output so Pages serves the generated site without Jekyll processing. `--cleanDestinationDir` removes obsolete generated files.

The custom build-and-deploy workflow is manual-only during this arrangement. GitHub's own Pages deployment workflow still runs for branch publishing, so this does not guarantee a bypass of an account-level Actions lock.

To restore automatic deployment after the lock is resolved, switch Pages' source back to **GitHub Actions** and restore the `push` (branch `main`) and `pull_request` triggers in `.github/workflows/publish.yaml`. The tracked `docs/` output can then be removed. No changes are deployed by running the local preview.
