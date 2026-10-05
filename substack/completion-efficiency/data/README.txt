Completion Efficiency web data (preview, 2026-10-05)

Small aggregated CSVs read by the pages in substack/completion-efficiency/<tool>/.
Written by code/53_web_export.py in davidhummels/clauderesearch
(completion_efficiency/Oct26_substack), which copies output/web/data_v5/ here.
Do not edit by hand; rerun the export.

Rules: timing adjustment from the single source (code/timing.py: each institution's own
entering vs graduating classes, benchmark G = 1); state results are public systems only
(public universities + community colleges, large online universities excluded);
aggregates are ratios of sums (credit-hour weighted). Institution files (inst/<ST>.csv)
carry only published IPEDS aggregates and ratios. ap_rules/<ST>.csv: College Board AP
credit-policy search, 2026. manifest.json lists every file with its size and build time.
