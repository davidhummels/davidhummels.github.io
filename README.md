# davidhummels.github.io

Source for https://davidhummels.github.io, built with [Quarto](https://quarto.org) and published by GitHub Actions on every push to `main`.

## Layout

```
index.qmd                         landing page (Teaching / Research / Substack)
teaching/                         course pages and simulations (Econ 432)
research/                         papers; PDFs in research/papers/
substack/                         hub for Substack companion projects
  completion-efficiency/          one folder per project
    data/                         CSVs used by that project's tools
_quarto.yml                       site settings and navigation menu
styles.scss                       site styling
.github/workflows/publish.yml     build and deploy
```

## Adding a Substack project

1. Create `substack/<project-slug>/index.qmd`.
2. Add a card for it on `substack/index.qmd`.
3. Add it to the Substack menu in `_quarto.yml`.

Interactive tools use Observable JS (`{ojs}` cells), which run in the reader's browser, so no server is needed.
