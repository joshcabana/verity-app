'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Copy, Share2, Gift, Users, Check } from 'lucide-react';
import Link from 'next/link';

export default function InvitePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  const generateInvite = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-friend-invite', {
        body: { user_id: user.id },
      });
      if (error) throw error;
      if (data?.invite_url) {
        setInviteUrl(data.invite_url);
      } else if (data?.code) {
        setInviteUrl(`https://app.getverity.com.au/login?ref=${data.code}`);
      }
    } catch {
      toast.error('Failed to generate invite link');
    } finally {
      setLoading(false);
    }
  };

  // Fetch referral count
  useState(() => {
    if (!user) return;
    supabase
      .from('referral_invites')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', user.id)
      .eq('status', 'accepted')
      .then(({ count }) => setReferralCount(count ?? 0));
  });

  const copyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareLink = async () => {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Verity',
          text: 'Anonymous video dating — see their vibe, not their face. We both get bonus tokens.',
          url: inviteUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-8">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <Gift className="w-6 h-6 text-gold" />
          </div>
          <h1 className="font-serif text-2xl text-foreground">Invite a friend</h1>
          <p className="text-muted text-sm">
            You both get <span className="text-gold font-medium">5 bonus tokens</span> when
            they join their first Drop.
          </p>
        </div>

        {/* Generate / Share */}
        {!inviteUrl ? (
          <button
            onClick={generateInvite}
            disabled={loading}
            className="ghost-pill w-full py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Generate invite link
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            {/* Link display */}
            <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
              <p className="text-sm text-foreground truncate flex-1 font-mono">
                {inviteUrl}
              </p>
              <button
                onClick={copyLink}
                className="shrink-0 text-gold hover:text-gold-light transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={copyLink} className="ghost-pill py-3 flex items-center justify-center gap-2 text-sm">
                <Copy className="w-4 h-4" />
                Copy link
              </button>
              <button onClick={shareLink} className="ghost-pill py-3 flex items-center justify-center gap-2 text-sm">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        )}

        {/* Referral stats */}
        <div className="border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-base text-foreground">Your referrals</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="font-serif text-2xl gold-gradient-text">{referralCount}</p>
              <p className="text-muted text-xs">Friends joined</p>
            </div>
            <div>
              <p className="font-serif text-2xl gold-gradient-text">{referralCount * 5}</p>
              <p className="text-muted text-xs">Tokens earned</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-3 text-sm text-muted">
          <p className="label-caps text-gold">HOW REFERRALS WORK</p>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Share your unique link with a friend</li>
            <li>They sign up and join their first Drop</li>
            <li>You both get 5 bonus tokens instantly</li>
          </ol>
        </div>

        <Link href="/drops" className="block text-center text-gold text-sm hover:text-gold-light transition-colors">
          ← Back to Drops
        </Link>
      </div>
    </div>
  );
}
