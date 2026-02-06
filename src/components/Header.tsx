import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronDown, Menu, ShoppingCart, User, Heart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { categories } from "@/data/mockData";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center gap-4 h-14 px-4">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-1">
            <div className="text-xl font-bold tracking-tight">
              <span className="text-accent">market</span>
              <span>place</span>
            </div>
          </Link>

          {/* Deliver To */}
          <button className="hidden md:flex items-center gap-1 text-sm hover:outline hover:outline-1 hover:outline-primary-foreground/50 rounded px-2 py-1 -ml-2">
            <MapPin className="w-4 h-4 text-primary-foreground/70" />
            <div className="text-left">
              <div className="text-[10px] text-primary-foreground/70">Deliver to</div>
              <div className="font-semibold text-xs">New York 10001</div>
            </div>
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl">
            <div className="search-bar flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground bg-secondary border-r border-border hover:bg-muted">
                    All
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem>All Departments</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat.id}>{cat.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                type="search"
                placeholder="Search products, brands, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-foreground"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-accent hover:bg-accent/90 text-accent-foreground h-10 px-4"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex flex-col items-start px-2 py-1 hover:outline hover:outline-1 hover:outline-primary-foreground/50 rounded">
                  <span className="text-[10px] text-primary-foreground/70">Hello, Sign in</span>
                  <span className="text-xs font-semibold flex items-center gap-0.5">
                    Account & Lists <ChevronDown className="w-3 h-3" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-4 text-center border-b border-border">
                  <Button asChild className="w-full btn-cta mb-2">
                    <Link to="/auth/signin">Sign In</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    New customer? <Link to="/auth/signup" className="text-info hover:underline">Start here</Link>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                  <div>
                    <p className="font-semibold text-sm mb-1">Your Lists</p>
                    <DropdownMenuItem asChild>
                      <Link to="/lists" className="text-xs">Create a List</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/lists/wishlist" className="text-xs">Wish List</Link>
                    </DropdownMenuItem>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">Your Account</p>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="text-xs">Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="text-xs">Orders</Link>
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Orders */}
            <Link
              to="/orders"
              className="hidden md:flex flex-col items-start px-2 py-1 hover:outline hover:outline-1 hover:outline-primary-foreground/50 rounded"
            >
              <span className="text-[10px] text-primary-foreground/70">Returns</span>
              <span className="text-xs font-semibold">& Orders</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-primary-foreground/50 rounded"
            >
              <div className="relative">
                <ShoppingCart className="w-7 h-7" />
                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount > 99 ? "99+" : itemCount}</span>
                )}
              </div>
              <span className="hidden sm:block text-xs font-semibold">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <nav className="bg-primary/90 text-primary-foreground border-t border-primary-foreground/10">
        <div className="container flex items-center gap-0 h-10 px-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
            className="flex items-center gap-1 nav-item font-semibold"
          >
            <Menu className="w-4 h-4" />
            All
          </button>
          
          {categories.slice(0, 7).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="nav-item whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          
          <Link to="/deals" className="nav-item whitespace-nowrap text-deal-foreground font-semibold">
            Today's Deals
          </Link>
          
          <Link to="/sell" className="nav-item whitespace-nowrap">
            Sell
          </Link>
        </div>
      </nav>

      {/* Mega Menu */}
      {isMegaMenuOpen && (
        <div
          className="mega-menu animate-fade-in"
          onMouseLeave={() => setIsMegaMenuOpen(false)}
        >
          <div className="container py-6">
            <div className="grid grid-cols-5 gap-8">
              {/* Category List */}
              <div className="col-span-1 border-r border-border pr-4">
                <h3 className="font-semibold text-sm mb-3">Shop by Department</h3>
                <ul className="space-y-1">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left text-sm py-1.5 px-2 rounded hover:bg-muted transition-colors ${
                          selectedCategory.id === cat.id
                            ? "bg-muted font-medium"
                            : ""
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subcategories */}
              <div className="col-span-4 grid grid-cols-4 gap-6">
                {selectedCategory.subcategories?.map((sub) => (
                  <div key={sub.id}>
                    <Link
                      to={`/category/${selectedCategory.slug}/${sub.slug}`}
                      className="font-semibold text-sm hover:text-primary hover:underline"
                      onClick={() => setIsMegaMenuOpen(false)}
                    >
                      {sub.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
