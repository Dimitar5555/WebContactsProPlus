DIAG_DIR := docs/diagrams
PNG_DIR  := $(DIAG_DIR)/png
SVG_DIR  := $(DIAG_DIR)/svg

TEX := $(wildcard $(DIAG_DIR)/*.tex)
PDF := $(TEX:.tex=.pdf)
PNG := $(patsubst $(DIAG_DIR)/%.tex,$(PNG_DIR)/%.png,$(TEX))
SVG := $(patsubst $(DIAG_DIR)/%.tex,$(SVG_DIR)/%.svg,$(TEX))

LATEX      ?= pdflatex
LATEXFLAGS := -interaction=nonstopmode -halt-on-error
DPI        ?= 300

.PHONY: all diagrams png svg clean distclean help

all: png svg
diagrams: $(PDF)
png: $(PNG)
svg: $(SVG)

$(DIAG_DIR)/%.pdf: $(DIAG_DIR)/%.tex
	cd $(DIAG_DIR) && $(LATEX) $(LATEXFLAGS) $(notdir $<) >/dev/null

$(PNG_DIR)/%.png: $(DIAG_DIR)/%.pdf | $(PNG_DIR)
	pdftoppm -png -r $(DPI) -singlefile $< $(PNG_DIR)/$*

$(SVG_DIR)/%.svg: $(DIAG_DIR)/%.pdf | $(SVG_DIR)
	dvisvgm --pdf --output=$@ $<

$(PNG_DIR) $(SVG_DIR):
	mkdir -p $@

clean:
	rm -f $(DIAG_DIR)/*.aux $(DIAG_DIR)/*.log $(DIAG_DIR)/*.out \
	      $(DIAG_DIR)/*.fls $(DIAG_DIR)/*.fdb_latexmk $(DIAG_DIR)/*.synctex.gz

distclean: clean
	rm -f $(PDF)
	rm -rf $(PNG_DIR) $(SVG_DIR)

help:
	@echo "make            — build PNGs + SVGs for every TikZ source in $(DIAG_DIR)"
	@echo "make diagrams   — build PDFs only"
	@echo "make png        — build PNGs only (override DPI=600 for higher resolution)"
	@echo "make svg        — build SVGs only"
	@echo "make clean      — remove LaTeX aux files"
	@echo "make distclean  — also remove PDFs + png/ + svg/"
