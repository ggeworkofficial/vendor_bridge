import { Facebook, Instagram, Twitter, MessageCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialShareButtonsProps {
  url: string;
  title?: string;
  description?: string;
  className?: string;
}

const SocialShareButtons = ({ url, title = "", description = "", className = "" }: SocialShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    instagram: `instagram://share?text=${encodedTitle}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === "instagram") {
      window.open(shareLinks["instagram"], "_blank");
    } else {
      window.open(shareLinks[platform], "_blank", "width=600,height=400");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare("facebook")}
        className="hover:bg-blue-500 hover:text-white hover:border-blue-500"
        title="Share on Facebook"
      >
        <Facebook className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare("twitter")}
        className="hover:bg-blue-400 hover:text-white hover:border-blue-400"
        title="Share on Twitter/X"
      >
        <Twitter className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare("instagram")}
        className="hover:bg-pink-500 hover:text-white hover:border-pink-500"
        title="Share on Instagram"
      >
        <Instagram className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare("whatsapp")}
        className="hover:bg-green-500 hover:text-white hover:border-green-500"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={copyLink}
        className="hover:bg-gray-500 hover:text-white hover:border-gray-500"
        title="Copy Link"
      >
        <Link2 className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default SocialShareButtons;
