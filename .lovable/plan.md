

## Plan: Flag Pelin Products & Azhin Art as Handmade

Update existing product rows in the database where `brand` is "Pelin Products" or "Azhin Art" to set `is_handmade = true` and `is_artisan_brand = true`.

### Action
Run a single UPDATE statement via the data insert tool:
```sql
UPDATE public.products
SET is_handmade = true, is_artisan_brand = true
WHERE brand IN ('Pelin Products', 'Azhin Art');
```

No code or schema changes needed — the columns and badge UI already exist.

