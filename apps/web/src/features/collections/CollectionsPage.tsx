import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  SearchableSelect,
} from '@receivables/ui';
import { PhoneCall, Plus, CheckCircle, AlertTriangle, Calendar, Check, ExternalLink } from 'lucide-react';
import { formatMoney } from '@receivables/shared';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const CollectionsPage: React.FC = () => {
  const { business } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    dueToday: 0,
    overdueTasks: 0,
    successRate: '0%',
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Modal
  const [logOpen, setLogOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [receivableId, setReceivableId] = useState('');
  const [activityType, setActivityType] = useState('PHONE_CALL');
  const [outcome, setOutcome] = useState('PROMISED_TO_PAY');
  const [promisedDate, setPromisedDate] = useState('');
  const [promisedAmount, setPromisedAmount] = useState('');
  const [notes, setNotes] = useState('');

  const isCollectionsEnabled = business?.settings?.collectionsEnabled !== false;

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/collections');
      setActivities(data.activities || []);
      setTasks(data.tasks || []);
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load collections' });
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [custData, recData] = await Promise.all([
        apiFetch('/customers'),
        apiFetch('/receivables?status=ACTIVE'),
      ]);
      setCustomers(custData);
      setReceivables(recData);
      if (custData.length > 0 && !customerId) {
        setCustomerId(custData[0].id);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadData();
    loadDropdowns();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    try {
      setCompletingTaskId(taskId);
      await apiFetch(`/collections/tasks/${taskId}/complete`, { method: 'POST' });
      setFeedback({ type: 'success', message: 'Follow-up task marked as completed!' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to complete task' });
    } finally {
      setCompletingTaskId(null);
    }
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await apiFetch('/collections', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          receivableId: receivableId || undefined,
          type: activityType,
          outcome,
          notes: notes.trim(),
          promisedDate: promisedDate || undefined,
          promisedAmount: promisedAmount ? Number(promisedAmount) : undefined,
        }),
      });

      setFeedback({ type: 'success', message: 'Collection communication logged successfully!' });
      setLogOpen(false);
      setNotes('');
      setPromisedDate('');
      setPromisedAmount('');
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to log activity' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Optional Feature Notice if disabled */}
      {!isCollectionsEnabled && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Collections Module is Currently Disabled</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Outreach activities and customer follow-up tracking are deactivated for this workspace.
              </p>
            </div>
          </div>
          <Link to="/settings">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100 gap-1.5 text-xs">
              <ExternalLink className="w-3.5 h-3.5" />
              Configure in Settings
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Collections & Follow-ups
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Track communication history, promised payment dates, and overdue follow-up tasks.
          </p>
        </div>
        <Button
          onClick={() => {
            setFeedback(null);
            setLogOpen(true);
          }}
          disabled={!isCollectionsEnabled}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Log Collection Activity
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-amber-700">
              Follow-Ups Due Today
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{metrics.dueToday} Tasks</div>
            <p className="text-xs text-amber-700 mt-1">Customers with promised payment dates today</p>
          </CardContent>
        </Card>
        <Card className="border-rose-200 bg-rose-50/20">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-rose-700">
              Overdue Follow-ups
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-900">{metrics.overdueTasks} Tasks</div>
            <p className="text-xs text-rose-700 mt-1">Missed promises requiring escalations</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardHeader className="pb-2">
            <span className="text-xs font-semibold uppercase text-emerald-700">
              Promise Success Rate
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{metrics.successRate}</div>
            <p className="text-xs text-emerald-700 mt-1">Settled payments out of total commitments</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Follow-up Tasks Card */}
      {tasks.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-base font-semibold">Scheduled Follow-Up Tasks ({tasks.length})</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">Pending Action</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div key={task.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{task.customer}</p>
                    <p className="text-slate-500 font-mono">
                      Invoice: {task.receivableRef} • {task.outstanding ? formatMoney(task.outstanding, 'RWF') : 'General'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      task.isOverdue
                        ? 'bg-rose-100 text-rose-700'
                        : task.isDueToday
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      Due: {task.dueDate} {task.isOverdue ? '(Overdue)' : task.isDueToday ? '(Today)' : ''}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={completingTaskId === task.id}
                      onClick={() => handleCompleteTask(task.id)}
                      className="h-7 text-[11px] gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      <Check className="w-3 h-3" />
                      Mark Done
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Collection History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Receivable</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Promised Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Logged By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    Loading collection activity logs...
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    No collection communication recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((act) => (
                  <TableRow key={act.id}>
                    <TableCell>
                      <p className="font-medium text-slate-900">{act.customer}</p>
                      <p className="text-xs text-slate-500">{act.phone}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-blue-600 font-semibold">
                      {act.receivableRef}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {act.outstanding ? formatMoney(act.outstanding, 'RWF') : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                        <PhoneCall className="w-3 h-3" />
                        {act.type?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {act.outcome === 'PROMISED_TO_PAY' ? (
                        <Badge variant="warning">Promised to Pay</Badge>
                      ) : act.outcome === 'PAYMENT_MADE' ? (
                        <Badge variant="success">Payment Made</Badge>
                      ) : (
                        <Badge variant="secondary">{act.outcome?.replace('_', ' ')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-indigo-700">
                      {act.promisedDate || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                      {act.notes}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{act.actor}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* LOG ACTIVITY MODAL */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Log Collection Activity</DialogTitle>
            <DialogDescription>
              Record an outreach interaction, phone call, or promise to pay.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogActivity} className="space-y-4">
            <div className="min-w-0">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Customer *</label>
              <SearchableSelect
                options={customers
                  .filter((c) => c.status !== 'INACTIVE')
                  .map((c) => ({
                    value: c.id,
                    label: c.name,
                    subLabel: c.phone,
                    badge: c.customerCode,
                  }))}
                value={customerId}
                onChange={setCustomerId}
                placeholder="Search or select customer..."
                searchPlaceholder="Search customer by name or phone..."
              />
            </div>

            <div className="min-w-0">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Related Receivable (Optional)
              </label>
              <SearchableSelect
                options={[
                  { value: '', label: 'General / No specific invoice', subLabel: 'Overall customer account outreach' },
                  ...receivables.map((r) => ({
                    value: r.id,
                    label: `${r.referenceNumber || r.ref} - ${r.customer}`,
                    subLabel: `Balance: ${formatMoney(r.outstanding, 'RWF')} • ${r.status}`,
                    badge: r.status,
                  })),
                ]}
                value={receivableId}
                onChange={setReceivableId}
                placeholder="Select related receivable invoice..."
                searchPlaceholder="Search invoices..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="min-w-0">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Activity Channel *</label>
                <SearchableSelect
                  options={[
                    { value: 'PHONE_CALL', label: 'Phone Call', subLabel: 'Direct voice conversation' },
                    { value: 'IN_PERSON', label: 'In Person Visit', subLabel: 'Field agent / counter visit' },
                    { value: 'SMS', label: 'SMS Reminder', subLabel: 'Automated / manual text' },
                    { value: 'WHATSAPP', label: 'WhatsApp', subLabel: 'Instant messaging chat' },
                    { value: 'EMAIL', label: 'Email', subLabel: 'Formal statement notice' },
                    { value: 'LETTER', label: 'Demand Letter', subLabel: 'Formal written demand' },
                  ]}
                  value={activityType}
                  onChange={setActivityType}
                  placeholder="Select channel..."
                />
              </div>

              <div className="min-w-0">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Outcome *</label>
                <SearchableSelect
                  options={[
                    { value: 'PROMISED_TO_PAY', label: 'Promised to Pay', subLabel: 'Customer committed to pay on date' },
                    { value: 'PAYMENT_MADE', label: 'Payment Made', subLabel: 'Customer settled balance' },
                    { value: 'FOLLOW_UP_LATER', label: 'Follow-Up Later', subLabel: 'Requested call back' },
                    { value: 'NO_ANSWER', label: 'No Answer', subLabel: 'Phone rang with no response' },
                    { value: 'CUSTOMER_UNAVAILABLE', label: 'Unavailable', subLabel: 'Customer not in office' },
                    { value: 'DISPUTED', label: 'Invoice Disputed', subLabel: 'Customer disputes goods or price' },
                    { value: 'REFUSED', label: 'Payment Refused', subLabel: 'Refused payment obligation' },
                  ]}
                  value={outcome}
                  onChange={setOutcome}
                  placeholder="Select outcome..."
                />
              </div>
            </div>

            {outcome === 'PROMISED_TO_PAY' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-amber-50/50 rounded-lg border border-amber-200 min-w-0">
                <div className="min-w-0">
                  <label className="text-xs font-semibold text-amber-900">Promised Date</label>
                  <Input
                    type="date"
                    value={promisedDate}
                    onChange={(e) => setPromisedDate(e.target.value)}
                    required
                    className="mt-1 text-xs"
                  />
                </div>
                <div className="min-w-0">
                  <label className="text-xs font-semibold text-amber-900">
                    Promised Amount (RWF)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 400000"
                    value={promisedAmount}
                    onChange={(e) => setPromisedAmount(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700">Notes & Conversation Summary</label>
              <Input
                placeholder="e.g. Spoke with manager, payment approval in progress"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Log Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
