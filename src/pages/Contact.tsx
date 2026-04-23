import { motion } from "framer-motion";
import { Phone, ExternalLink, MessageCircle, Users, Send, Heart } from "lucide-react";
import Layout from "@/components/Layout";
import { mockSocialLinks, mockContactPhones } from "@/lib/contact-data";

const platformIcons: Record<string, string> = {
  telegram: "✈️",
  facebook: "📘",
  instagram: "📸",
  tiktok: "🎵",
  whatsapp: "💬",
  twitter: "🐦",
  youtube: "🎬",
};

const Contact = () => {
  const followLinks = mockSocialLinks.filter((l) => l.type === "follow");
  const messageLinks = mockSocialLinks.filter((l) => l.type === "message");

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-display font-bold mb-2">Get in Touch</h1>
          <p className="text-muted-foreground text-lg mb-10">
            Connect with us through any of the channels below — we're here for you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Follow Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold text-xl">Follow Us</h2>
            </div>
            <p className="text-sm text-muted-foreground">Stay updated — join our channels, groups, and pages.</p>
            <div className="space-y-3">
              {followLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-accent transition-colors group"
                >
                  <span className="text-2xl">{platformIcons[link.icon] || "🔗"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.platform}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Message Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-secondary" />
              <h2 className="font-display font-semibold text-xl">Message Us</h2>
            </div>
            <p className="text-sm text-muted-foreground">Need help or have questions? Reach out directly — we respond fast.</p>
            <div className="space-y-3">
              {messageLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-accent transition-colors group"
                >
                  <span className="text-2xl">{platformIcons[link.icon] || "🔗"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.platform}</p>
                  </div>
                  <Send className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Call Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border rounded-xl p-6 space-y-4 md:col-span-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="font-display font-semibold text-xl">Call Us</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {mockContactPhones.map((phone) => (
                <a
                  key={phone.id}
                  href={`tel:${phone.number.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-accent transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{phone.label}</p>
                    <p className="text-muted-foreground text-sm">{phone.number}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center mt-12 text-muted-foreground text-sm flex items-center justify-center gap-1"
        >
        VendorBridge Team
        </motion.div>
      </div>
    </Layout>
  );
};

export default Contact;
