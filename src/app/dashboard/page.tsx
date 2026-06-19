import { db } from '@/lib/db';
import { requests } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function avg(nums: number[]) {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function formatMs(ms: number | null) {
  if (ms === null) return '—';
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h avg`;
  if (hours > 0) return `${hours}h avg`;
  return `< 1h avg`;
}

export default async function DashboardPage() {
  const all = await db.select().from(requests);

  const byStatus = {
    submitted: all.filter((r) => r.status === 'submitted').length,
    in_progress: all.filter((r) => r.status === 'in_progress').length,
    in_review: all.filter((r) => r.status === 'in_review').length,
    completed: all.filter((r) => r.status === 'completed').length,
  };

  const completed = all.filter((r) => r.status === 'completed' && r.completedAt);
  const allDurations = completed.map(
    (r) => new Date(r.completedAt!).getTime() - new Date(r.createdAt).getTime()
  );

  const byPriority = ['low', 'medium', 'high', 'critical'].map((p) => {
    const durations = completed
      .filter((r) => r.priority === p)
      .map((r) => new Date(r.completedAt!).getTime() - new Date(r.createdAt).getTime());
    return { priority: p, count: all.filter((r) => r.priority === p).length, avg: avg(durations) };
  });

  const byCategory = ['bug_fix', 'enhancement', 'new_feature'].map((c) => {
    const durations = completed
      .filter((r) => r.category === c)
      .map((r) => new Date(r.completedAt!).getTime() - new Date(r.createdAt).getTime());
    return { category: c, count: all.filter((r) => r.category === c).length, avg: avg(durations) };
  });

  const categoryLabels: Record<string, string> = {
    bug_fix: 'Bug Fix',
    enhancement: 'Enhancement',
    new_feature: 'New Feature',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-50 border-gray-200',
    medium: 'bg-blue-50 border-blue-200',
    high: 'bg-orange-50 border-orange-200',
    critical: 'bg-red-50 border-red-200',
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      {/* Status summary */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">By Status</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500 mt-1 capitalize">{status.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Overall avg */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Overall Average Time to Complete</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm inline-block">
          <div className="text-4xl font-bold text-green-700">{formatMs(avg(allDurations))}</div>
          <div className="text-sm text-gray-500 mt-1">across {completed.length} completed request{completed.length !== 1 ? 's' : ''}</div>
        </div>
      </section>

      {/* By priority */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">By Priority</h2>
        <div className="grid grid-cols-4 gap-4">
          {byPriority.map(({ priority, count, avg: a }) => (
            <div
              key={priority}
              className={`border rounded-xl p-4 shadow-sm ${priorityColors[priority]}`}
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </div>
              <div className="text-2xl font-bold text-gray-900">{count} total</div>
              <div className="text-sm text-gray-500 mt-1">{formatMs(a)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* By category */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">By Category</h2>
        <div className="grid grid-cols-3 gap-4">
          {byCategory.map(({ category, count, avg: a }) => (
            <div key={category} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                {categoryLabels[category]}
              </div>
              <div className="text-2xl font-bold text-gray-900">{count} total</div>
              <div className="text-sm text-gray-500 mt-1">{formatMs(a)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
