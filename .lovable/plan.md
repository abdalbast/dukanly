

## Plan: Restore Previous Slides 2 & 3, Keep Current Slides 1 & 4

**Problem**: The last edit regenerated all 4 hero slides. The user prefers the **previous** versions of slides 2 and 3, but wants to keep the **current** slides 1 and 4.

**Action**: Copy `slide-2.jpg` and `slide-3.webp` from the previous commit (`d5e4fe19` — the one you're currently viewing in the preview) back into `src/assets/hero/`. No code changes needed.

### Files to restore from previous build
1. `src/assets/hero/slide-2.jpg` — revert to previous version
2. `src/assets/hero/slide-3.webp` — revert to previous version

### Files to keep as-is (no changes)
- `src/assets/hero/slide-1.jpg` + `public/hero/slide-1.jpg` — current version stays
- `src/assets/hero/slide-4.jpg` — current version stays

### Approach
Use the cross-project asset tools to read slides 2 and 3 from the previous commit and write them back to the current project.

