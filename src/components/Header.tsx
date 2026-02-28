import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronDown, Menu, ShoppingCart, User, Heart, Package, Globe } from "lucide-react";
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
import { useLanguage } from "@/i18n/LanguageContext";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { t, language, setLanguage } = useLanguage();

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
            <div className="text-left rtl:text-right">
              <div className="text-[10px] text-primary-foreground/70">{t("header.deliverTo")}</div>
              <div className="font-semibold text-xs">{t("header.location")}</div>
            </div>
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl">
            <div className="search-bar flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground bg-secondary border-r border-border hover:bg-muted">
                    {t("common.all")}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem>{t("header.allDepartments")}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat.id}>{cat.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                type="search"
                placeholder={t("header.searchPlaceholder")}
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
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2 py-1 hover:outline hover:outline-1 hover:outline-primary-foreground/50 rounded">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-semibold">{language === "ckb" ? "کوردی" : "EN"}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-muted" : ""}>
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ckb")} className={language === "ckb" ? "bg-muted" : ""}>
                  🇮🇶 کوردی (سۆرانی)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex flex-col items-start px-2 py-1 hover:outline hover:outline-1 hover:outline-primary-foreground/50 rounded">
                  <span className="text-[10px] text-primary-foreground/70">{t("header.helloSignIn")}</span>
                  <span className="text-xs font-semibold flex items-center gap-0.5">
                    {t("header.accountAndLists")} <ChevronDown className="w-3 h-3" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-4 text-center border-b border-border">
                  <Button asChild className="w-full btn-cta mb-2">
                    <Link to="/auth/signin">{t("header.signIn")}</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t("header.newCustomer")} <Link to="/auth/signup" className="text-info hover:underline">{t("header.startHere")}</Link>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                  <div>
                    <p className="font-semibold text-sm mb-1">{t("header.yourLists")}</p>
                    <DropdownMenuItem asChild>
                      <Link to="/lists" className="text-xs">{t("header.createList")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/lists/wishlist" className="text-xs">{t("header.wishList")}</Link>
                    </DropdownMenuItem>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{t("header.yourAccount")}</p>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="text-xs">{t("header.account")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="text-xs">{t("header.orders")}</Link>
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
              <span className="text-[10px] text-primary-foreground/70">{t("header.returns")}</span>
              <span className="text-xs font-semibold">{t("header.andOrders")}</span>
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
              <span className="hidden sm:block text-xs font-semibold">{t("header.cart")}</span>
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
            {t("common.all")}
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
            {t("header.todaysDeals")}
          </Link>
          
          <Link to="/seller" className="nav-item whitespace-nowrap">
            {t("header.sellerCentral")}
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
              <div className="col-span-1 border-r border-border rtl:border-r-0 rtl:border-l rtl:border-border pr-4 rtl:pr-0 rtl:pl-4">
                <h3 className="font-semibold text-sm mb-3">{t("header.shopByDepartment")}</h3>
                <ul className="space-y-1">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left rtl:text-right text-sm py-1.5 px-2 rounded hover:bg-muted transition-colors ${
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
