# Instructions for Claude sessions working in this repo

This repo is the source for https://davidhummels.github.io, David Hummels's faculty site. It is a Quarto website. Every push to `main` triggers `.github/workflows/publish.yml`, which renders the site and deploys it to GitHub Pages.

## Hard rules

- **Never write anything to the user's local hard drive.** Work only in a cloud clone of this repo, then push.
- Only touch the folder for your own project or tool, plus the shared files listed under "Registering a new project or tool."
- Do not change `_quarto.yml` (except to add a menu entry), `styles.scss`, `index.qmd`, `research/`, `teaching/`, or `.github/` unless the user asks you to.
- No confidential, restricted, or student-level data. The repo is public. Commit only aggregated, publishable data.
- Keep data files small. Pre-aggregate them to the level the tool needs. Files must stay well under 50 MB each (GitHub's hard limit is 100 MB).

## Where things go

```
substack/<project-slug>/              one folder per Substack project
  index.qmd                           project landing page
  data/                               CSVs shared by that project's tools
  <tool-slug>/index.qmd               one folder per interactive tool
teaching/econ432/<tool-slug>/         classroom simulations
research/papers/                      PDFs of papers
```

The existing project is `substack/completion-efficiency/`. Tools for the IPEDS completion-efficiency and AP/transfer-credit work go in `substack/completion-efficiency/<tool-slug>/`.

Use short, lowercase, hyphenated slugs, for example `state-trends` or `institution-explorer`. A tool's URL will be `https://davidhummels.github.io/substack/<project-slug>/<tool-slug>/`, and that URL gets linked from Substack, so don't rename a slug once it's published.

## How to build an interactive tool

- Write the tool as a Quarto page (`index.qmd`) using `{ojs}` (Observable JS) cells. These run in the reader's browser, so there's no server and no R or Python at build time.
- Load data with `FileAttachment("../data/file.csv").csv({typed: true})`, using a path relative to the page. Chart with Observable `Plot` and add controls with `Inputs`. Both are built in.
- Add `//| echo: false` to cells so readers see the tool, not the code.
- Start each page with a title, a one-paragraph plain-language explanation, a note on the data source and years, and a link back to the Substack post it supports.
- Use the site's primary color `#1f4e79`.
- If a tool truly needs a library that OJS can't handle, a self-contained HTML/JS file in the tool folder is acceptable. Ask the user first.

## Registering a new project or tool

1. **New tool:** add a link to it under "Interactive tools" on its project's `index.qmd`.
2. **New project:** create `substack/<project-slug>/index.qmd`, add a card for it on `substack/index.qmd` (copy the existing card's markup), and add a menu entry under the Substack menu in `_quarto.yml`.

## Test, commit, push

```bash
pip install --break-system-packages quarto-cli   # once per session
quarto render                                    # must finish with no errors
git fetch origin main && git rebase origin/main  # other sessions may have pushed
git add <your files> && git commit -m "Add <tool>"
git push origin HEAD:main
```

Then confirm the deploy succeeded. The command below should print `completed success`:

```bash
gh api "repos/Davidhummels/davidhummels.github.io/actions/runs?per_page=1" \
  --jq '.workflow_runs[0] | "\(.status) \(.conclusion)"'
```

Do not commit `_site/` or `.quarto/`; both are already in `.gitignore`. If a push is rejected, fetch and rebase again. Never force-push.
