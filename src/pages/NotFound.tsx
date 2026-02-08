import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-8xl font-bold text-muted-foreground/30 mb-4">404</div>
          <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="btn-cta">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/search">
                <Search className="w-4 h-4 mr-2" />
                Search Products
              </Link>
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Here are some helpful links:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/" className="text-info hover:underline">Home</Link>
              <Link to="/deals" className="text-info hover:underline">Today's Deals</Link>
              <Link to="/orders" className="text-info hover:underline">Your Orders</Link>
              <Link to="/account" className="text-info hover:underline">Your Account</Link>
              <Link to="/help" className="text-info hover:underline">Help Center</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
