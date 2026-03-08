

## Plan: Add Product Images to Seed Data

### Approach
Update the 12 existing products in the database with real product images from Unsplash (free, no-auth CDN URLs). Also update `seed.sql` so future seeds include images.

### Image Mapping

| Product | Image Source |
|---------|------------|
| Sony WH-1000XM5 Headphones | Unsplash headphones photo |
| Apple MacBook Air M2 | Unsplash laptop photo |
| Instant Pot Duo Plus | Unsplash pressure cooker photo |
| Levi's 501 Jeans | Unsplash jeans photo |
| Dyson V15 Vacuum | Unsplash vacuum photo |
| LEGO Millennium Falcon | Unsplash LEGO photo |
| Kindle Paperwhite | Unsplash e-reader photo |
| Nike Air Max 270 | Unsplash sneakers photo |
| CeraVe Moisturizer | Unsplash skincare photo |
| Yeti Rambler Tumbler | Unsplash tumbler photo |
| Samsung Galaxy S24 Ultra | Unsplash smartphone photo |
| Psychology of Money | Unsplash book photo |

### Changes

1. **Database data update** — Use the insert tool to `UPDATE products SET images = '[...]'` for each product with 1-2 Unsplash image URLs
2. **seed.sql** — Add `images` column to the seed INSERT so future environments also get images
3. **Also update**: `category`, `brand`, `stock` columns in seed products which are currently NULL (data is in `metadata` jsonb instead of the proper columns)

### Technical Notes
- Unsplash URLs use the format `https://images.unsplash.com/photo-{id}?w=800&q=80` — free, no API key needed, CDN-backed
- The `images` column is `jsonb DEFAULT '[]'` so we store as a JSON array of strings
- No schema changes needed — just data updates

