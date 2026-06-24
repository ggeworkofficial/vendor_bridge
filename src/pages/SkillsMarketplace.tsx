import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Briefcase, Star, Clock, DollarSign, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/api/service.api";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const SkillsMarketplace = () => {
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [pricingType, setPricingType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => getServices(),
  });

  const services = servicesData?.data?.data ?? [];

  const filteredServices = services
    .filter((service: any) => {
      const matchesSearch = service.title.toLowerCase().includes(search.toLowerCase()) ||
                           service.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || service.category === category;
      const matchesPricing = pricingType === "all" || service.pricing_type === pricingType;
      return matchesSearch && matchesCategory && matchesPricing && service.status === "active";
    })
    .sort((a: any, b: any) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "orders") return b.orders - a.orders;
      return 0;
    });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "creative", label: "Creative" },
    { value: "technical", label: "Technical" },
    { value: "marketing", label: "Marketing" },
    { value: "professional", label: "Professional" },
    { value: "local", label: "Local Services" },
  ];

  const pricingTypes = [
    { value: "all", label: "All Pricing" },
    { value: "hourly", label: "Hourly" },
    { value: "project", label: "Project-based" },
    { value: "package", label: "Package" },
  ];

  const sortOptions = [
    { value: "rating", label: "Top Rated" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "orders", label: "Most Orders" },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">Skills Marketplace</h1>
              <p className="text-muted-foreground">Find skilled professionals for your projects</p>
            </div>
            {user?.role === "service_provider" && (
              <Button onClick={() => navigate("/skills/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Service
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={pricingType} onValueChange={setPricingType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pricingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
            Loading services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No services found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service: any) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/skills/${service.id}`)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="capitalize">{service.category}</Badge>
                    <Badge variant="secondary" className="capitalize">{service.pricing_type}</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{service.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({service.review_count})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{service.orders}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{service.delivery_time} days</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">{service.revisions} revisions</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-xl font-bold">${service.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        {service.pricing_type === "hourly" ? "/hr" : service.pricing_type === "project" ? "/project" : "/package"}
                      </span>
                    </div>
                    <Button size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA for non-service-providers */}
        {!user || user.role !== "service_provider" ? (
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Have Skills to Offer?</h3>
              <p className="text-muted-foreground mb-4">Join our marketplace and start earning by offering your services.</p>
              <Button onClick={() => navigate("/skills/register")}>
                <Briefcase className="h-4 w-4 mr-2" />
                Become a Service Provider
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </Layout>
  );
};

export default SkillsMarketplace;
