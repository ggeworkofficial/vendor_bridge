import { Order } from "./types";

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    items: [
      {
        product: {
          id: "1",
          name: "Handcrafted Leather Bag",
          description: "Premium quality handcrafted leather bag from artisan workshops. Perfect for everyday use with durable stitching and elegant design.",
          price: 89.99,
          qualityLabel: "high",
          verified: true,
          images: ["/assets/products/leather-bag.jpg"],
          category: "Fashion",
          location: "Marrakech, Morocco",
          lastUpdated: "2026-04-08",
          rating: 4.8,
          reviewCount: 124,
        },
        quantity: 1,
      },
    ],
    status: "out_for_delivery",
    paymentStatus: "paid",
    total: 89.99,
    address: "123 Market St, San Francisco, CA",
    createdAt: "2026-04-05",
    estimatedDelivery: "2026-04-12",
  },
  {
    id: "ORD-002",
    items: [
      {
        product: {
          id: "2",
          name: "Organic Spice Collection",
          description: "Curated set of 12 organic spices sourced directly from local farmers. Includes turmeric, saffron, cumin, and more.",
          price: 34.5,
          qualityLabel: "high",
          verified: true,
          images: ["/assets/products/spice-collection.jpg"],
          category: "Food & Beverages",
          location: "Kerala, India",
          lastUpdated: "2026-04-07",
          rating: 4.9,
          reviewCount: 89,
        },
        quantity: 2,
      },
      {
        product: {
          id: "4",
          name: "Woven Bamboo Basket",
          description: "Eco-friendly bamboo basket woven by skilled artisans. Multi-purpose storage solution with natural charm.",
          price: 28.0,
          qualityLabel: "medium",
          verified: true,
          images: ["/assets/products/bamboo-basket.jpg"],
          category: "Home & Living",
          location: "Bali, Indonesia",
          lastUpdated: "2026-04-06",
          rating: 4.5,
          reviewCount: 43,
        },
        quantity: 1,
      },
    ],
    status: "confirmed",
    paymentStatus: "unpaid",
    total: 97.0,
    address: "456 Oak Ave, Portland, OR",
    createdAt: "2026-04-08",
    estimatedDelivery: "2026-04-15",
  },
];

export const categories = [
  "All",
  "Fashion",
  "Food & Beverages",
  "Home & Living",
  "Electronics",
  "Health & Beauty",
  "Crafts",
];

