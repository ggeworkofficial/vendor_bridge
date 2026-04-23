import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { useState } from "react";

const Header = () => {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="VendorBridge" className="h-9 w-9" width={36} height={36} />
          <span className="font-display text-xl font-bold hidden sm:inline">
            Vendor<span className="text-primary">Bridge</span>
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 bg-muted/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Products</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/orders">Orders</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/contact">Contact</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">Admin</Link>
          </Button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/login">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-secondary text-secondary-foreground">
                  {itemCount}
                </Badge>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-2 animate-fade-in">
          <form onSubmit={handleSearch}>
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <Link to="/" className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>Products</Link>
          <Link to="/orders" className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>Orders</Link>
          <Link to="/contact" className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>Contact</Link>
          <Link to="/admin" className="block py-2 font-medium" onClick={() => setMobileOpen(false)}>Admin</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
