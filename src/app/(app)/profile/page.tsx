"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";
import { User, MapPin, Edit3, Save, X } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setCity(profile.city ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        city: city.trim() || null,
        bio: bio.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Couldn't save your profile. Please try again.");
    } else {
      toast.success("Profile updated.");
      await refreshProfile();
      setIsEditing(false);
    }

    setIsSaving(false);
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setCity(profile.city ?? "");
      setBio(profile.bio ?? "");
    }
    setIsEditing(false);
  };

  const inputClass =
    "w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-gold/50 transition-colors text-sm";

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="label-caps mb-1">Your</p>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Profile
          </h1>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-gold text-sm hover:text-gold-light transition-colors"
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-muted text-sm hover:text-foreground transition-colors"
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1 text-gold text-sm hover:text-gold-light transition-colors"
            >
              <Save size={14} />
              <span>{isSaving ? "Saving…" : "Save"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Avatar / header section */}
      <div className="bg-card border border-border rounded-xl p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
            {profile?.avatar_emoji ? (
              <span className="text-2xl">{profile.avatar_emoji}</span>
            ) : (
              <User className="w-8 h-8 text-gold" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">
              {profile?.display_name || profile?.name || "Anonymous"}
            </h2>
            <div className="flex items-center gap-3 text-sm text-muted mt-0.5">
              {profile?.gender && (
                <span className="capitalize">{profile.gender}</span>
              )}
              {profile?.age && <span>{profile.age} years</span>}
              {profile?.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {profile.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <label className="label-caps block mb-2">Display Name</label>
          {isEditing ? (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className={inputClass}
            />
          ) : (
            <p className="text-foreground text-sm">
              {profile?.display_name || "—"}
            </p>
          )}
        </div>

        <div>
          <label className="label-caps block mb-2">City</label>
          {isEditing ? (
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Melbourne"
              className={inputClass}
            />
          ) : (
            <p className="text-foreground text-sm">{profile?.city || "—"}</p>
          )}
        </div>

        <div>
          <label className="label-caps block mb-2">Bio</label>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a little about yourself…"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          ) : (
            <p className="text-foreground text-sm">{profile?.bio || "—"}</p>
          )}
        </div>

        <div>
          <label className="label-caps block mb-2">Gender</label>
          <p className="text-foreground text-sm capitalize">
            {profile?.gender || "—"}
          </p>
        </div>

        {profile?.token_balance !== undefined && (
          <div>
            <label className="label-caps block mb-2">Token Balance</label>
            <p className="text-gold font-medium">{profile.token_balance}</p>
          </div>
        )}
      </div>

      {/* Verification status */}
      <div className="bg-card border border-border rounded-xl p-6 mt-4">
        <p className="label-caps mb-3">Verification</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                profile?.verified ? "bg-green-500" : "bg-border"
              }`}
            />
            <span className="text-muted">ID Verified</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                profile?.verified_phone ? "bg-green-500" : "bg-border"
              }`}
            />
            <span className="text-muted">Phone Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
