import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card mt-auto">
    <div className="container py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <div>
        <h3 className="font-display font-bold text-lg mb-3">VendorBridge</h3>
        <p className="text-sm text-muted-foreground">One market. Endless choices.</p>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-3">Shop</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <Link to="/" className="block hover:text-foreground transition-colors">All Products</Link>
          <Link to="/?category=Fashion" className="block hover:text-foreground transition-colors">Fashion</Link>
          <Link to="/?category=Electronics" className="block hover:text-foreground transition-colors">Electronics</Link>
        </div>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-3">Support</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <Link to="/orders" className="block hover:text-foreground transition-colors">Track Order</Link>
          <span className="block">Contact Us</span>
          <span className="block">Returns & Refunds</span>
        </div>
      </div>
      <div>
        <h4 className="font-display font-semibold mb-3">Company</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <span className="block">About Us</span>
          <span className="block">Become a Contributor</span>
          <span className="block">Privacy Policy</span>
        </div>
      </div>
    </div>
    <div className="border-t">
      <div className="container py-4 text-center text-sm text-muted-foreground">
        © 2026 VendorBridge. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
