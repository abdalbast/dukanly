import { Category } from "@/types/product";
import electronicsImg from "@/assets/categories/electronics.jpg";
import fashionImg from "@/assets/categories/fashion.jpg";
import homeImg from "@/assets/categories/home.jpg";
import sportsImg from "@/assets/categories/sports.jpg";
import beautyImg from "@/assets/categories/beauty.jpg";
import toysImg from "@/assets/categories/toys.jpg";
import booksImg from "@/assets/categories/books.jpg";
import groceryImg from "@/assets/categories/grocery.jpg";

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    image: electronicsImg,
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
    image: fashionImg,
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
    image: homeImg,
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
    image: sportsImg,
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
    image: beautyImg,
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
    image: toysImg,
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
    image: booksImg,
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
    image: groceryImg,
    subcategories: [
      { id: "snacks", name: "Snacks", slug: "snacks" },
      { id: "beverages", name: "Beverages", slug: "beverages" },
      { id: "organic", name: "Organic", slug: "organic" },
      { id: "pantry", name: "Pantry Staples", slug: "pantry" },
    ],
  },
];
