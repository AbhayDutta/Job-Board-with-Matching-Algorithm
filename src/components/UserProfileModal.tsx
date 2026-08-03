"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "@/app/actions/user";
import { toast } from "sonner";
import { User, Camera, Upload, Check, Loader2, Sparkles, Award, Briefcase, GraduationCap, FileText } from "lucide-react";

interface UserProfileModalProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
    role?: string;
    plan?: string | null;
  };
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
];

export default function UserProfileModal({ user }: UserProfileModalProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || user.email.split("@")[0]);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || AVATAR_PRESETS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { // eslint-disable-line @typescript-eslint/no-explicit-any
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgradePlan = async () => {
    setPaymentLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK.");
        setPaymentLoading(false);
        return;
      }

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "RECRUITER_PLAN" }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        toast.error(orderData.error || "Failed to create payment order.");
        setPaymentLoading(false);
        return;
      }

      const options: any = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Fitboard",
        description: "Recruiter Plan Upgrade — ₹1,999/mo",
        handler: async function (response: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
          try {
            const verifyPayload = {
              ...response,
              razorpay_order_id: response.razorpay_order_id || orderData.orderId,
            };
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verifyPayload),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success("🎉 Payment verified! Recruiter Pro plan active.");
              router.refresh();
            } else {
              toast.error(verifyData.error || "Payment verification failed.");
            }
          } catch (e) {
            console.error(e);
            toast.error("Error verifying payment.");
          } finally {
            setPaymentLoading(false);
          }
        },
        theme: { color: "#8cfa3c" },
      };

      if (orderData.orderId && !orderData.orderId.startsWith("order_test_")) {
        options.order_id = orderData.orderId;
      }

      const razorpay = new (window as any).Razorpay(options); // eslint-disable-line @typescript-eslint/no-explicit-any
      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to launch Razorpay checkout.");
      setPaymentLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
          toast.success("Image uploaded! Preview updated.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await updateUserProfile({ name, avatarUrl });
      if (res.success) {
        toast.success("Profile PFP & details updated!");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <button
          type="button"
          className="flex items-center gap-2 p-1.5 rounded-full border border-border/80 bg-card hover:border-foreground/40 transition-all cursor-pointer select-none group"
          title="Account Profile & PFP Settings"
        >
          <img
            src={avatarUrl}
            alt={name}
            className="h-7 w-7 rounded-full object-cover border border-border shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
            }}
          />
          <span className="text-xs font-semibold text-foreground max-w-[120px] truncate hidden sm:inline-block font-sans">
            {name}
          </span>
        </button>
      } />

      <DialogContent className="sm:max-w-lg p-6 bg-card border border-border rounded-2xl shadow-match-glow max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <DialogTitle className="font-serif text-2xl font-normal text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-accent" /> Profile & Visual PFP Editor
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Unstop/Indeed style candidate & employer profile configuration.
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-0.5">
                {user.plan === "RECRUITER" ? "⚡ Recruiter Pro" : `Verified ${user.role}`}
              </span>
              {user.role === "EMPLOYER" && user.plan !== "RECRUITER" && (
                <button
                  type="button"
                  disabled={paymentLoading}
                  onClick={handleUpgradePlan}
                  className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-2.5 py-0.5 text-[9.5px] font-black font-mono uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Upgrading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 fill-black" /> Upgrade Pro
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 mt-3">
          {/* Avatar Upload Header */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border/60 bg-secondary/20">
            <div className="relative group shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="h-20 w-20 rounded-full object-cover border-2 border-foreground/40 shadow-md transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
                }}
              />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono font-bold">
                <Camera className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h4 className="font-semibold text-sm text-foreground font-sans">{name}</h4>
              <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  size="xs"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full text-[10.5px] font-bold uppercase tracking-wider font-mono bg-foreground text-background hover:bg-accent hover:text-black cursor-pointer"
                >
                  <Upload className="h-3 w-3 mr-1" /> Upload Image File
                </Button>
              </div>
            </div>
          </div>

          {/* Preset Avatar Pickers */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Or Choose Preset Avatar PFP
            </label>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`relative h-11 w-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                    avatarUrl === preset
                      ? "border-foreground scale-110 shadow-md ring-2 ring-accent"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={preset} alt={`Avatar ${idx}`} className="h-full w-full object-cover" />
                  {avatarUrl === preset && (
                    <span className="absolute inset-0 bg-foreground/40 flex items-center justify-center text-background">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Avatar URL */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Custom Avatar URL
            </label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="h-10 text-xs bg-background border-border rounded-xl font-mono"
            />
          </div>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Full Display Name
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="h-10 text-sm bg-background border-border rounded-xl font-sans"
            />
            {name.trim().length < 2 && (
              <p className="text-[11px] font-medium text-destructive font-sans mt-1">
                Display name must be at least 2 characters.
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
            <DialogClose render={<Button type="button" variant="outline" className="rounded-full text-xs" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-foreground text-background font-bold text-xs px-5 hover:bg-accent hover:text-black cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Saving...
                </>
              ) : (
                "Save Profile & PFP"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
