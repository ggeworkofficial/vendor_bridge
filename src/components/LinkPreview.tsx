import { useState, useEffect } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LinkPreviewProps {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  caption?: string;
}

const LinkPreview = ({ url, title = "", description = "", imageUrl = "", price, caption }: LinkPreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setImageLoaded(false);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [url, imageUrl]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setLoading(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setLoading(false);
  };

  return (
    <Card className="overflow-hidden max-w-md">
      <CardContent className="p-0">
        {loading && (
          <div className="aspect-video bg-muted flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && imageUrl ? (
          <div className="relative aspect-video bg-muted">
            {imageLoaded ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              {price && (
                <div className="text-white font-bold text-lg">${price.toFixed(2)}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-muted flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        <div className="p-4 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-primary rounded-full" />
            <span className="text-xs text-muted-foreground">VendorBridge</span>
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{title || "Product Title"}</h3>
          {price && <p className="text-sm font-bold text-primary mb-1">${price.toFixed(2)}</p>}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {description || "Product description goes here..."}
          </p>
          {caption && (
            <p className="text-xs italic text-muted-foreground line-clamp-2">"{caption}"</p>
          )}
          <p className="text-xs text-muted-foreground mt-2 truncate">{url}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkPreview;
