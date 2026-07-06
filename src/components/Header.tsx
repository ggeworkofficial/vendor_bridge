import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { useAuth } from "@/features/auth/auth.store";
import { api } from "@/api/client";
import { logout as logoutFun } from "@/api/auth.api";
import { ModeToggle } from "@/components/mode-toggle";
import { useInventoryStore } from "@/features/inventory/inventory.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Header = () => {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuth((state) => state.user);
  const { logout } = useAuth();
  const inventory = useInventoryStore((state) => state.inventory);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    setLogoutDialogOpen(false);
    try {
      await logoutFun();
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/");
    }
  };

  const suggestions = search.trim()
    ? inventory
        .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={logo}
            alt="VendorBridge"
            className="h-9 w-9"
            width={36}
            height={36}
          />
          <span className="font-display text-xl font-bold hidden sm:inline">
            Vendor<span className="text-primary">Bridge</span>
          </span>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md relative"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Search products..."
              className="pl-10 bg-muted/50"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(`/product/${product.id}`);
                      setSearch("");
                      setShowSuggestions(false);
                    }}
                  >
                    {product.name}
                  </div>
                ))}
                <div
                  className="px-4 py-2 hover:bg-muted cursor-pointer text-sm text-primary border-t"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSearch({
                      preventDefault: () => {},
                    } as React.FormEvent);
                    setShowSuggestions(false);
                  }}
                >
                  See all results for "{search}"
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Products</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/skills/marketplace">Skills</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/bulk/orders">Bulk Orders</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/orders">Orders</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/contact">Contact</Link>
          </Button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Applications
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.role !== "seller" && (
                  <DropdownMenuItem asChild>
                    <Link to="/seller/application">Apply Seller</Link>
                  </DropdownMenuItem>
                )}
                {user.role !== "reseller" && (
                  <DropdownMenuItem asChild>
                    <Link to="/reseller/apply">Apply Reseller</Link>
                  </DropdownMenuItem>
                )}
                {user.role !== "service_provider" && (
                  <DropdownMenuItem asChild>
                    <Link to="/skills/register">Become Provider</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {user?.role === "seller" && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/seller/dashboard">Seller Dashboard</Link>
              </Button>
            </>
          )}
          {user?.role === "reseller" && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/reseller/dashboard">Reseller Dashboard</Link>
              </Button>
            </>
          )}
          {user?.role === "service_provider" && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/skills/projects">My Projects</Link>
              </Button>
            </>
          )}
          {user?.role === "admin" && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          {/* Cart — comes BEFORE profile */}
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

          {/* Profile — LAST in the row */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                    {(
                      user.name ||
                      user.full_name ||
                      user.display_name ||
                      user.email ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLogoutDialogOpen(true)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
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
          <Link
            to="/"
            className="block py-2 font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/skills/marketplace"
            className="block py-2 font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Skills
          </Link>
          <Link
            to="/bulk/orders"
            className="block py-2 font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Bulk Orders
          </Link>
          <Link
            to="/orders"
            className="block py-2 font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Orders
          </Link>
          <Link
            to="/contact"
            className="block py-2 font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </Link>
          {user && user.role !== "seller" && (
            <Link
              to="/seller/application"
              className="block py-2 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Apply Seller
            </Link>
          )}
          {user && user.role !== "reseller" && (
            <Link
              to="/reseller/apply"
              className="block py-2 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Apply Reseller
            </Link>
          )}
          {user && user.role !== "service_provider" && (
            <Link
              to="/skills/register"
              className="block py-2 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Become Provider
            </Link>
          )}
          {user?.role === "seller" && (
            <Link
              to="/seller/dashboard"
              className="block py-2 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Seller Dashboard
            </Link>
          )}
          {user?.role === "reseller" && (
            <Link
              to="/reseller/dashboard"
              className="block py-2 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Reseller Dashboard
            </Link>
          )}
          {user?.role === "service_provider" && (
            <Link
              to="/skills/projects"
              className="block py-2 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              My Projects
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="block py-2 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Admin
            </Link>
          )}
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
