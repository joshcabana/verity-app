"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

const pledgePoints = [
  "I will treat every person I meet with respect and kindness.",
  "I will not engage in any form of harassment, bullying, or hate speech.",
  "I understand that Verity uses AI moderation to keep everyone safe, and I consent to this.",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { user, refreshProfile } = useAuth();

  const isOver18 = useMemo(() => {
    if (!day || !month || !year) return false;
    const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  }, [day, month, year]);

  const handleAgeGate = () => {
    if (!day || !month || !year) {
      toast.error("Please enter your date of birth.");
      return;
    }
    if (!isOver18) {
      toast.error("You must be 18 or older to use Verity.");
      return;
    }
    setStep(2);
  };

  const handleComplete = async () => {
    if (!pledgeAccepted) {
      toast.error("Please accept the safety pledge to continue.");
      return;
    }
    if (!user) return;

    setIsSubmitting(true);

    const dob = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    const { error: trustError } = await supabase.from("user_trust").upsert(
      {
        user_id: user.id,
        safety_pledge_accepted: true,
        age_verified: true,
        onboarding_step: 3,
        onboarding_complete: true,
      },
      { onConflict: "user_id" }
    );

    if (trustError) {
      toast.error("Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Update profile with date of birth
    await supabase
      .from("profiles")
      .update({ date_of_birth: dob })
      .eq("id", user.id);

    await refreshProfile();
    toast.success("Welcome to Verity!");
    router.push("/drops");
  };

  const selectClass =
    "bg-surface border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-gold/50 transition-colors text-sm appearance-none";

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1
              className="font-serif text-2xl font-semibold gold-gradient-text"
              style={{ letterSpacing: "0.15em" }}
            >
              {step === 1 ? "Age Verification" : "Safety Pledge"}
            </h1>
            <p className="mt-2 text-muted text-sm">
              Step {step} of 2
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-border rounded-full h-1">
            <div
              className="bg-gold h-1 rounded-full transition-all duration-500"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          {step === 1 ? (
            /* Age Gate */
            <div className="space-y-6">
              <p className="text-muted text-sm text-center">
                You must be 18 or older to use Verity. Please enter your date of
                birth.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label-caps block mb-2">Day</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className={`${selectClass} w-full`}
                  >
                    <option value="">–</option>
                    {days.map((d) => (
                      <option key={d} value={String(d)}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-caps block mb-2">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className={`${selectClass} w-full`}
                  >
                    <option value="">–</option>
                    {months.map((m, i) => (
                      <option key={m} value={String(i + 1)}>
                        {m.slice(0, 3)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-caps block mb-2">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={`${selectClass} w-full`}
                  >
                    <option value="">–</option>
                    {years.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleAgeGate}
                className="ghost-pill w-full"
              >
                Continue
              </button>
            </div>
          ) : (
            /* Safety Pledge */
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-gold" />
                </div>
              </div>

              <p className="text-muted text-sm text-center">
                Verity is a safe space for genuine connection. Please read and
                accept our safety pledge.
              </p>

              <ul className="space-y-3">
                {pledgePoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-foreground/80"
                  >
                    <span className="text-gold mt-0.5 flex-shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pledgeAccepted}
                  onChange={(e) => setPledgeAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-gold"
                />
                <span className="text-sm text-muted">
                  I have read and agree to the safety pledge, and I confirm I am
                  18 years or older.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="ghost-pill flex-1 !border-border !text-muted hover:!text-foreground"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!pledgeAccepted || isSubmitting}
                  className="ghost-pill flex-1"
                >
                  {isSubmitting ? "Saving…" : "Continue"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
