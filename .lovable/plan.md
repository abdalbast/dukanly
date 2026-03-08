

## Plan: Test Search Bar End-to-End

### What I'll Test

1. **Navigate to homepage** at desktop resolution (1280x720)
2. **Type a product search query** into the search bar (e.g., "soap")
3. **Submit the search** by clicking the search button
4. **Verify the results page**:
   - URL navigates to `/search?q=soap`
   - Page title shows "Results for soap"
   - Product grid displays matching products
   - Filters sidebar is visible (desktop)
   - Sort dropdown is functional

### Search Implementation Details

**Frontend Flow**:
- `Header.tsx` (lines 42-47): Form submission triggers `navigate(\`/search?q=${encodeURIComponent(searchQuery)}\`)`
- `SearchResultsPage.tsx` (line 20): Extracts query from URL params
- `useSearchProducts` hook: Performs case-insensitive ILIKE search on `title`, `brand`, `category` fields in the products table

**Expected Behavior**:
- Search should work with any text query
- Empty queries show all products
- Filters (Prime, Deals, Handmade, Artisan, Rating, Brand) can be applied
- Sort options: Relevance, Price (Low/High), Rating, Newest
- Grid/List view toggle available

### Testing Approach

Use browser automation to:
1. `navigate_to_sandbox` with desktop viewport
2. `observe` the search bar
3. `act` to fill in search query
4. `act` to submit form
5. `screenshot` and verify results page loaded correctly

### Potential Issues to Check

- Search results count displays correctly
- Products match the search query
- No console errors during navigation
- Filters and sorting work as expected
