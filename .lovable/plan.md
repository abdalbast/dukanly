

## Polish Brand Page Story Presentation

The current brand story section dumps the description and entire story into two plain `<p>` tags centered on the page. For Azhin Art especially, with its multi-paragraph narrative, this creates a wall of text. The fix: restructure the story data and rendering to create a magazine-style layout.

### Changes

**`src/pages/BrandPage.tsx`** — restructure story section rendering:

1. **Split story into paragraphs** — render each `\n\n`-delimited paragraph separately with proper spacing instead of one blob.

2. **Pull-quote treatment** — detect the final quote line (`"Try everything…"`) and render it as a large, styled blockquote with italic text, decorative border-left, and increased font size.

3. **Two-column layout for longer stories** — for brands with stories longer than 200 chars, use a left-aligned layout with:
   - Left column: section heading + description (intro)
   - Right column: the full story paragraphs
   - On mobile: stacks vertically

4. **Feature cards** — move features into their own visually separated section with a subtle background change, keeping the existing hover-lift cards but adding a thin top-border accent line to each card.

5. **Separator flourish** — add a decorative separator (thin line + brand icon) between story and features sections.

### Visual Result
- Story reads naturally with paragraph breaks and breathing room
- Final quote stands out as a styled blockquote
- Two-column layout on desktop feels editorial/magazine-like
- Features section gets its own visual weight with accent borders

### Files
- **`src/pages/BrandPage.tsx`** — restructure story rendering, add pull-quote, two-column layout

