import { db } from '@/lib/db';
import { requests } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { PriorityBadge, categoryLabels } from '@/components/Badges';

export const dynamic = 'force-dynamic';

function formatDuration(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  return `< 1h`;
}

export default async function CompletedPage() {
  const completed = await db
    .select()
    .from(requests)
    .where(eq(requests.status, 'completed'))
    .orderBy(desc(requests.completedAt));

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        Completed <span className="text-gray-400 font-normal text-base">({completed.length})</span>
      </h1>

      {completed.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No completed requests yet</p>
        </div>
      )}

      <div className="space-y-3">
        {completed.map((req) => {
          const duration =
            req.completedAt
              ? formatDuration(new Date(req.completedAt).getTime() - new Date(req.createdAt).getTime())
              : '—';
          return (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">{req.title}</h3>
                <PriorityBadge priority={req.priority} />
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{req.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>{categoryLabels[req.category]}</span>
                <span>#{req.id}</span>
                <span>Submitted {new Date(req.createdAt).toLocaleDateString()}</span>
                <span>Completed {req.completedAt ? new Date(req.completedAt).toLocaleDateString() : '—'}</span>
                <span className="font-semibold text-green-700">Time to complete: {duration}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
