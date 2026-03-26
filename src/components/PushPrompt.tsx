'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';

/**
 * Shows a prompt to enable push notifications.
 * Appears after the user has been in the app for 10 seconds,
 * only if they haven't already subscribed or dismissed.
 */
export function PushPrompt() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if not logged in, no service worker support, or already dismissed
    if (!user) return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (Notification.permission !== 'default') return;

    // Show after 10 seconds
    const timer = setTimeout(() => {
      setShow(true);
    }, 10_000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Subscribe to push
        const supabase = createClient();
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // Get VAPID key from app_config
        const { data: config } = await supabase
          .from('app_config')
          .select('value_json')
          .eq('key', 'vapid_public_key')
          .single();

        if (config?.value_json && user) {
          const publicKey = config.value_json as string;
          const keyArray = urlBase64ToUint8Array(publicKey);

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: keyArray.buffer as ArrayBuffer,
          });

          const json = subscription.toJSON();
          if (json.endpoint && json.keys?.p256dh && json.keys?.auth) {
            await supabase.from('push_subscriptions').upsert(
              {
                user_id: user.id,
                endpoint: json.endpoint,
                p256dh: json.keys.p256dh,
                auth: json.keys.auth,
              },
              { onConflict: 'user_id' }
            );
          }
        }
      }
    } catch {
      // Silent fail
    }
    setShow(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[60] max-w-sm mx-auto animate-in fade-in slide-in-from-top-2">
      <div className="bg-card border border-gold/20 rounded-xl p-4 shadow-lg shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-4 h-4 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium">
              Never miss a Drop
            </p>
            <p className="text-xs text-muted mt-1">
              Get notified when your next Drop starts or when you get a mutual Spark.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleEnable}
                className="ghost-pill text-xs px-3 py-1.5"
              >
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-muted hover:text-foreground transition-colors px-2"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
