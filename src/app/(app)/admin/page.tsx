'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Shield,
  Users,
  Phone,
  Coins,
  AlertTriangle,
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reason: string;
  status: string | null;
  created_at: string | null;
}

interface PlatformStats {
  total_users: number;
  total_calls: number;
  total_sparks: number;
  active_today: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    total_users: 0,
    total_calls: 0,
    total_sparks: 0,
    active_today: 0,
  });
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check admin role
  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === 'admin' || data?.role === 'moderator');
      });
  }, [user, supabase]);

  // Load data
  useEffect(() => {
    if (!isAdmin) return;

    const loadData = async () => {
      setLoading(true);

      // Stats
      const [usersRes, callsRes, sparksRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('calls').select('*', { count: 'exact', head: true }),
        supabase.from('sparks').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        total_users: usersRes.count ?? 0,
        total_calls: callsRes.count ?? 0,
        total_sparks: sparksRes.count ?? 0,
        active_today: 0,
      });

      // Reports
      const { data: reportData } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (reportData) {
        setReports(reportData as unknown as Report[]);
      }

      setLoading(false);
    };

    loadData();
  }, [isAdmin, supabase]);

  const handleReportAction = async (reportId: string, action: 'resolved' | 'dismissed') => {
    const { error } = await supabase
      .from('reports')
      .update({ status: action })
      .eq('id', reportId);

    if (error) {
      toast.error('Failed to update report');
    } else {
      toast.success(`Report ${action}`);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: action } : r))
      );
    }
  };

  // Access denied
  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-muted mx-auto" />
          <p className="text-muted">Admin access required.</p>
        </div>
      </div>
    );
  }

  if (isAdmin === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === 'pending');

  return (
    <div className="min-h-screen pb-24 px-5 pt-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-gold" />
          <h1 className="font-serif text-2xl text-foreground">Admin</h1>
          {pendingReports.length > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingReports.length} pending
            </span>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Users', value: stats.total_users, icon: Users },
            { label: 'Calls', value: stats.total_calls, icon: Phone },
            { label: 'Sparks', value: stats.total_sparks, icon: Coins },
            { label: 'Reports', value: pendingReports.length, icon: AlertTriangle },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="border border-border rounded-xl p-4 text-center"
            >
              <Icon className="w-4 h-4 text-gold mx-auto mb-2" />
              <p className="font-serif text-xl text-foreground">{value}</p>
              <p className="text-muted text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Reports */}
        <div className="space-y-4">
          <h2 className="font-serif text-lg text-foreground">Recent Reports</h2>

          {reports.length === 0 ? (
            <div className="border border-border rounded-xl p-8 text-center">
              <Check className="w-8 h-8 text-green-500/50 mx-auto mb-3" />
              <p className="text-muted text-sm">No reports. All clear.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedReport(
                        expandedReport === report.id ? null : report.id
                      )
                    }
                    className="w-full p-4 flex items-center gap-3 text-left"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        report.status === 'pending'
                          ? 'bg-amber-500'
                          : report.status === 'resolved'
                          ? 'bg-green-500'
                          : 'bg-muted'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {report.reason || 'No reason given'}
                      </p>
                      <p className="text-xs text-muted">
                        {report.created_at ? formatDistanceToNow(new Date(report.created_at), {
                          addSuffix: true,
                        }) : 'Unknown'}
                        {' · '}
                        <span className="capitalize">{report.status ?? 'unknown'}</span>
                      </p>
                    </div>
                    {expandedReport === report.id ? (
                      <ChevronUp className="w-4 h-4 text-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted" />
                    )}
                  </button>

                  {expandedReport === report.id && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-muted">Reporter</p>
                          <p className="text-foreground font-mono text-[10px] truncate">
                            {report.reporter_id}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted">Reported</p>
                          <p className="text-foreground font-mono text-[10px] truncate">
                            {report.reported_user_id}
                          </p>
                        </div>
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReportAction(report.id, 'resolved')}
                            className="flex-1 ghost-pill py-2 text-sm flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Resolve
                          </button>
                          <button
                            onClick={() => handleReportAction(report.id, 'dismissed')}
                            className="flex-1 border border-border rounded-xl py-2 text-sm text-muted flex items-center justify-center gap-1 hover:text-foreground transition-colors"
                          >
                            <X className="w-3 h-3" /> Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={async () => {
                const { data, error } = await supabase.functions.invoke('aggregate-stats');
                if (error) toast.error('Failed to refresh stats');
                else toast.success('Stats refreshed');
              }}
              className="border border-border rounded-xl p-4 text-center text-sm text-muted hover:text-foreground hover:border-gold/30 transition-colors"
            >
              <Clock className="w-4 h-4 mx-auto mb-2" />
              Refresh Stats
            </button>
            <button
              onClick={() => toast.info('Feature flags coming soon')}
              className="border border-border rounded-xl p-4 text-center text-sm text-muted hover:text-foreground hover:border-gold/30 transition-colors"
            >
              <Shield className="w-4 h-4 mx-auto mb-2" />
              Feature Flags
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
