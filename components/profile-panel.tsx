"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2, Pencil, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProfilePanelProps = {
  email: string;
  initialName?: string;
  initialShippingAddress?: string;
};

export function ProfilePanel({
  email,
  initialName = "",
  initialShippingAddress = "",
}: ProfilePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [shippingAddress, setShippingAddress] = useState(initialShippingAddress);
  const [savedName, setSavedName] = useState(initialName);
  const [savedShippingAddress, setSavedShippingAddress] = useState(initialShippingAddress);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const close = () => {
    setName(savedName);
    setShippingAddress(savedShippingAddress);
    setError(null);
    setSuccess(false);
    setIsEditing(false);
    setIsOpen(false);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      setError(authError?.message ?? "You must be signed in to update your profile.");
      setIsSaving(false);
      return;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update({
        full_name: name.trim(),
        shipping_address: shippingAddress.trim(),
      })
      .eq("email", authData.user.email ?? email)
      .select("full_name, shipping_address")
      .maybeSingle();

    if (updateError) {
      setError(updateError.message);
    } else if (!updatedProfile) {
      setError(
        "No matching profile could be updated. Check that this email exists in users and that its RLS policy allows updates.",
      );
    } else {
      setSavedName(name.trim());
      setSavedShippingAddress(shippingAddress.trim());
      setName(name.trim());
      setShippingAddress(shippingAddress.trim());
      setSuccess(true);
      setIsEditing(false);
      router.refresh();
    }

    setIsSaving(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="max-w-48 rounded-full px-3 shadow-none hover:bg-black/5"
      >
        <UserRound className="size-4" />
        <span className="truncate">{savedName.trim() || "Profile"}</span>
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
            className="w-full max-w-md rounded-3xl bg-[#f7f4ed] p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d94719]">
                  Your account
                </p>
                <h2 id="profile-title" className="text-3xl font-semibold tracking-[-0.03em]">
                  Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close profile"
                className="flex size-9 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={save} className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="profile-name">Display name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Add your name"
                  disabled={!isEditing || isSaving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-email">Email address</Label>
                <Input id="profile-email" value={email} disabled />
                <p className="text-xs text-black/45">Your sign-in email cannot be changed here.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="profile-shipping-address">Shipping address</Label>
                <Input
                  id="profile-shipping-address"
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  placeholder="Add your shipping address"
                  disabled={!isEditing || isSaving}
                />
              </div>

              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              {success && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><Check className="size-4" /> Profile updated</p>}

              {isEditing ? (
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 rounded-xl bg-transparent shadow-none"
                    disabled={isSaving}
                    onClick={() => {
                      setName(savedName);
                      setShippingAddress(savedShippingAddress);
                      setError(null);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-11 flex-1 rounded-xl bg-[#f15a29] text-white shadow-none hover:bg-[#d94719]" disabled={isSaving}>
                    {isSaving ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : "Save changes"}
                  </Button>
                </div>
              ) : (
                <Button type="button" onClick={() => { setSuccess(false); setIsEditing(true); }} className="h-11 w-full rounded-xl bg-[#191914] text-white shadow-none hover:bg-black">
                  <Pencil className="size-4" /> Edit profile
                </Button>
              )}
            </form>
          </section>
        </div>
      )}
    </>
  );
}
