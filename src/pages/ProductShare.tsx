import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Share2, Copy, Check, Loader2, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getInventory } from "@/api/inventory.api";
import { createResellerShare } from "@/api/reseller.api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/features/auth/auth.store";

const ProductShare = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuth((state) => state.user);

  const [caption, setCaption] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => getInventory(),
    enabled: !!productId,
  });

  const product = inventoryData?.data?.data?.find((p: any) => p.id === productId);

  const mutation = useMutation({
    mutationFn: (data: any) => createResellerShare(data),
    onSuccess: (response) => {
      setGeneratedLink(response.data.generated_link);
      toast({ title: "Share Link Generated", description: "Your share link has been created." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate share link.", variant: "destructive" });
    },
  });

  const handleGenerateLink = () => {
    if (!user || !productId) {
      toast({ title: "Error", description: "Missing required information.", variant: "destructive" });
      return;
    }

    mutation.mutate({
      reseller_id: user.id,
      product_id: productId,
      caption: caption || null,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast({ title: "Link Copied", description: "Share link copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Please login to share products.</div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 mx-auto animate-spin mb-2" />
          Loading product...
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center text-muted-foreground">Product not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          ← Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Share Product</h1>
          <p className="text-muted-foreground">Create a shareable link with your custom caption</p>
        </div>

        {/* Product Preview */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <img
                src={product.images[0]?.image_url || ""}
                alt={product.name}
                className="w-24 h-24 rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <p className="text-lg font-bold mt-2">${product.price.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Caption Editor */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Caption Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="caption">Custom Caption</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a catchy caption for your audience..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{caption.length}/500 characters</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Caption Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Keep it short and engaging</li>
                  <li>Highlight key product benefits</li>
                  <li>Include relevant hashtags</li>
                  <li>Add a call-to-action</li>
                </ul>
              </div>

              <Button
                onClick={handleGenerateLink}
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Share2 className="h-4 w-4 mr-2" /> Generate Share Link</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Link */}
        {generatedLink && (
          <Card>
            <CardHeader>
              <CardTitle>Your Share Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant={copied ? "default" : "outline"}
                  >
                    {copied ? (
                      <><Check className="h-4 w-4 mr-1" /> Copied</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-1" /> Copy</>
                    )}
                  </Button>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Preview:</h4>
                  <div className="border rounded-lg p-4 bg-white">
                    <img
                      src={product.images[0]?.image_url || ""}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-3"
                    />
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">${product.price.toFixed(2)}</p>
                    {caption && <p className="text-sm italic">"{caption}"</p>}
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      via VendorBridge
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">Next Steps:</h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                    <li>Copy the share link above</li>
                    <li>Share it on your social media platforms</li>
                    <li>Use your custom caption for better engagement</li>
                    <li>Track clicks and conversions in your dashboard</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ProductShare;
