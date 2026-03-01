import { Category } from "@/types/product";

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    subcategories: [
      { id: "phones", name: "Cell Phones", slug: "phones" },
      { id: "computers", name: "Computers", slug: "computers" },
      { id: "tvs", name: "TVs & Home Theater", slug: "tvs" },
      { id: "audio", name: "Headphones & Audio", slug: "audio" },
      { id: "cameras", name: "Cameras & Photo", slug: "cameras" },
      { id: "wearables", name: "Wearables", slug: "wearables" },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    subcategories: [
      { id: "mens", name: "Men's Clothing", slug: "mens" },
      { id: "womens", name: "Women's Clothing", slug: "womens" },
      { id: "shoes", name: "Shoes", slug: "shoes" },
      { id: "accessories", name: "Accessories", slug: "accessories" },
      { id: "jewelry", name: "Jewelry", slug: "jewelry" },
    ],
  },
  {
    id: "home",
    name: "Home & Kitchen",
    slug: "home",
    subcategories: [
      { id: "furniture", name: "Furniture", slug: "furniture" },
      { id: "bedding", name: "Bedding", slug: "bedding" },
      { id: "kitchen", name: "Kitchen & Dining", slug: "kitchen" },
      { id: "appliances", name: "Appliances", slug: "appliances" },
      { id: "decor", name: "Home Decor", slug: "decor" },
    ],
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    slug: "sports",
    subcategories: [
      { id: "fitness", name: "Fitness", slug: "fitness" },
      { id: "outdoor", name: "Outdoor Recreation", slug: "outdoor" },
      { id: "cycling", name: "Cycling", slug: "cycling" },
      { id: "camping", name: "Camping & Hiking", slug: "camping" },
    ],
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    slug: "beauty",
    subcategories: [
      { id: "skincare", name: "Skincare", slug: "skincare" },
      { id: "makeup", name: "Makeup", slug: "makeup" },
      { id: "haircare", name: "Hair Care", slug: "haircare" },
      { id: "fragrance", name: "Fragrance", slug: "fragrance" },
    ],
  },
  {
    id: "toys",
    name: "Toys & Games",
    slug: "toys",
    subcategories: [
      { id: "action", name: "Action Figures", slug: "action" },
      { id: "dolls", name: "Dolls", slug: "dolls" },
      { id: "puzzles", name: "Puzzles", slug: "puzzles" },
      { id: "board-games", name: "Board Games", slug: "board-games" },
    ],
  },
  {
    id: "books",
    name: "Books",
    slug: "books",
    subcategories: [
      { id: "fiction", name: "Fiction", slug: "fiction" },
      { id: "nonfiction", name: "Non-Fiction", slug: "nonfiction" },
      { id: "children", name: "Children's Books", slug: "children" },
      { id: "textbooks", name: "Textbooks", slug: "textbooks" },
    ],
  },
  {
    id: "grocery",
    name: "Grocery",
    slug: "grocery",
    subcategories: [
      { id: "snacks", name: "Snacks", slug: "snacks" },
      { id: "beverages", name: "Beverages", slug: "beverages" },
      { id: "organic", name: "Organic", slug: "organic" },
      { id: "pantry", name: "Pantry Staples", slug: "pantry" },
    ],
  },
];
