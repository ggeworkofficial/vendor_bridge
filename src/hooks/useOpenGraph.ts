import { useEffect } from "react";

interface OpenGraphMeta {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

export const useOpenGraph = ({ title, description, image, url, type = "website", siteName = "VendorBridge" }: OpenGraphMeta) => {
  useEffect(() => {
    // Set or update meta tags
    const setMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("property", property);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const setTitle = (content: string) => {
      document.title = content;
    };

    // Set page title
    setTitle(title);

    // Set Open Graph meta tags
    setMetaTag("og:title", title);
    setMetaTag("og:description", description);
    setMetaTag("og:type", type);
    setMetaTag("og:site_name", siteName);

    if (image) {
      setMetaTag("og:image", image);
      setMetaTag("og:image:alt", title);
    }

    if (url) {
      setMetaTag("og:url", url);
    }

    // Set Twitter Card meta tags
    setMetaTag("twitter:card", image ? "summary_large_image" : "summary");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (image) {
      setMetaTag("twitter:image", image);
    }

    // Cleanup function to remove meta tags when component unmounts
    return () => {
      const metaTags = document.querySelectorAll('meta[property^="og:"], meta[property^="twitter:"]');
      metaTags.forEach((tag) => tag.remove());
    };
  }, [title, description, image, url, type, siteName]);
};

// Utility function to generate OG image URL (placeholder - backend should implement this)
export const generateOGImageUrl = (productId: string, caption?: string): string => {
  // This is a placeholder - the backend should implement dynamic OG image generation
  // The backend endpoint would be something like: /api/og-image/:productId?caption=...
  return `${window.location.origin}/api/og-image/${productId}${caption ? `?caption=${encodeURIComponent(caption)}` : ""}`;
};
