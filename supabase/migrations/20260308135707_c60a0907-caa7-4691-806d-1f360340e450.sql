UPDATE products
SET images = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem::text LIKE '%images.unsplash.com%w=800%'
      THEN replace(elem::text, 'w=800', 'w=400')::jsonb
      ELSE elem
    END
  )
  FROM jsonb_array_elements(images) AS elem
)
WHERE images::text LIKE '%images.unsplash.com%w=800%';