import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import Layout from "@/components/Layout";
import { mockProducts } from "@/lib/mock-products";
import { categories } from "@/lib/mock-data";
import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";

const Index = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "All";
  const [activeCategory, setActiveCategory] = useState(categoryParam);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-lg"
          >
            <Badge className="mb-4 bg-secondary text-secondary-foreground">🌍 Global Marketplace</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-background leading-tight mb-4">
              One Market.<br />
              <span className="text-secondary">Endless Choices.</span>
            </h1>
            <p className="text-background/80 text-lg mb-6 font-body">
              Discover verified products from trusted sellers worldwide. Quality guaranteed, delivered to your door.
            </p>
            <div className="flex gap-3">
              <Button size="lg" asChild>
                <a href="#products">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-background text-background bg-background/20 hover:bg-background/30" asChild>
                <Link to="/login">Join Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b bg-card">
        <div className="container py-6 flex flex-wrap justify-center gap-8 md:gap-16 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" /> Verified Sellers
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-5 w-5 text-secondary" /> Quality Guaranteed
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-5 w-5 text-primary" /> Reliable Delivery
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">
            {searchQuery ? `Results for "${searchQuery}"` : "Featured Products"}
          </h2>
          <span className="text-sm text-muted-foreground">{filteredProducts.length} products</span>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No products found.</p>
            <Button variant="outline" className="mt-4" onClick={() => setActiveCategory("All")}>
              Clear Filters
            </Button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
