// Contact & social media data (admin-controlled in a real app via DB)
export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  type: "follow" | "message";
  icon: string;
}

export interface ContactPhone {
  id: string;
  label: string;
  number: string;
}

export interface PaymentAccount {
  id: string;
  type: "bank" | "telebirr" | "cbe_birr" | "mpesa" | "other";
  label: string;
  accountName: string;
  accountNumber: string;
  details?: string;
}

// Mock data – in production these come from DB
export const mockSocialLinks: SocialLink[] = [
  { id: "s1", platform: "Telegram", label: "Join our Telegram Channel", url: "https://t.me/vendorbridge", type: "follow", icon: "telegram" },
  { id: "s2", platform: "Facebook", label: "Follow us on Facebook", url: "https://facebook.com/vendorbridge", type: "follow", icon: "facebook" },
  { id: "s3", platform: "Instagram", label: "Follow us on Instagram", url: "https://instagram.com/vendorbridge", type: "follow", icon: "instagram" },
  { id: "s4", platform: "TikTok", label: "Follow us on TikTok", url: "https://tiktok.com/@vendorbridge", type: "follow", icon: "tiktok" },
  { id: "s5", platform: "Telegram", label: "Chat with us on Telegram", url: "https://t.me/vendorbridge_support", type: "message", icon: "telegram" },
  { id: "s6", platform: "WhatsApp", label: "Message us on WhatsApp", url: "https://wa.me/251911000000", type: "message", icon: "whatsapp" },
];

export const mockContactPhones: ContactPhone[] = [
  { id: "p1", label: "Main Office", number: "+251 911 000 000" },
  { id: "p2", label: "Customer Support", number: "+251 922 111 111" },
  { id: "p3", label: "Sales", number: "+251 933 222 222" },
];

export const mockPaymentAccounts: PaymentAccount[] = [
  { id: "pa1", type: "bank", label: "Commercial Bank of Ethiopia (CBE)", accountName: "VendorBridge PLC", accountNumber: "1000012345678", details: "Branch: Bole" },
  { id: "pa2", type: "bank", label: "Awash Bank", accountName: "VendorBridge PLC", accountNumber: "0142001234567", details: "Branch: Mexico" },
  { id: "pa3", type: "telebirr", label: "Telebirr", accountName: "VendorBridge", accountNumber: "0911000000" },
  { id: "pa4", type: "cbe_birr", label: "CBE Birr", accountName: "VendorBridge", accountNumber: "0911000000" },
];
