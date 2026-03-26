"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import {
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  FileText,
  Lock,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const settingsLinks = [
  {
    href: "/safety",
    label: "Safety Centre",
    icon: Shield,
    description: "Safety resources and guidelines",
  },
  {
    href: "/privacy",
    label: "Privacy Policy",
    icon: Lock,
    description: "How we handle your data",
  },
  {
    href: "/terms",
    label: "Terms of Service",
    icon: FileText,
    description: "Our terms and conditions",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { profile } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.push("/login");
  };

  return (
    <div className="px-4 pt-6 pb-8">
      <div className="mb-6">
        <p className="label-caps mb-1">App</p>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Settings
        </h1>
      </div>

      {/* Account section */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border mb-4">
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-foreground text-sm font-medium">
              {profile?.display_name || profile?.name || "Your Account"}
            </p>
            <p className="text-muted text-xs">
              {profile?.subscription_tier || "Free"} plan
            </p>
          </div>
        </div>
      </div>

      {/* Links */}
      <p className="label-caps mb-3">Legal & Safety</p>
      <div className="bg-card border border-border rounded-xl divide-y divide-border mb-4">
        {settingsLinks.map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="p-4 flex items-center gap-3 hover:bg-surface/50 transition-colors"
          >
            <Icon size={18} className="text-muted flex-shrink-0" />
            <div className="flex-1">
              <p className="text-foreground text-sm">{label}</p>
              <p className="text-muted text-xs">{description}</p>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:border-red-500/30 transition-colors"
      >
        <LogOut size={18} className="text-red-400" />
        <span className="text-red-400 text-sm">Sign Out</span>
      </button>

      {/* App version */}
      <p className="text-center text-muted/40 text-xs mt-8">
        Verity v1.0.0 · Phase 1
      </p>
    </div>
  );
}
