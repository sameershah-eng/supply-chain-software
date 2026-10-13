import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store/useStore';
import { Alert } from '../../types';
import { formatRelativeTime } from '../../lib/utils';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface AdminAlertsProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminAlerts: React.FC<AdminAlertsProps> = ({ onNavigateTab }) => {
  const { alerts, markAlertRead, markAllAlertsRead } = useStore();
  const { showToast } = useToast();

  const handleMarkAllRead = () => {
    markAllAlertsRead();
    showToast({
      type: 'success',
      title: 'Alerts Marked Read',
      message: 'All system warning feeds have been acknowledged.',
    });
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'high':
        return <Badge variant="coral">Critical Severity</Badge>;
      case 'medium':
        return <Badge variant="amber">Moderate Impact</Badge>;
      case 'low':
        return <Badge variant="slate">Advisory</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Network Alerts & Risk Telemetry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active material shortages, overbooked capacity lines, and delayed orders requiring operational intervention.
          </p>
        </div>

        {alerts.some((a) => !a.isRead) && (
          <Button size="sm" variant="outline" onClick={handleMarkAllRead}>
            Acknowledge All Alerts
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card className="py-12 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">All systems operating within thresholds</p>
            <p className="text-xs text-slate-400 mt-1">No material shortages, capacity breaches, or delivery delays.</p>
          </Card>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.isRead
                  ? 'bg-white border-slate-200 opacity-75'
                  : alert.severity === 'high'
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-amber-50/30 border-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    alert.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">{alert.title}</span>
                    {getSeverityBadge(alert.severity)}
                    <span className="text-[11px] text-slate-400">
                      {formatRelativeTime(alert.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!alert.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAlertRead(alert.id)}
                  >
                    Acknowledge
                  </Button>
                )}
                {alert.linkTab && onNavigateTab && (
                  <Button
                    size="sm"
                    variant="secondary"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => onNavigateTab(alert.linkTab!)}
                  >
                    Investigate
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
