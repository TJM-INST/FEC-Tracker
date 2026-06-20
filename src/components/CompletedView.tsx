'use client';
import { useState } from 'react';
import type { Request } from '@/lib/schema';
import { PriorityBadge, categoryLabels, locationLabels } from './Badges';

function formatDuration(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  return '< 1h';
}

export default function CompletedView({ initial }: { initial: Request[] }) {
  const [items, setItems] = useState<Request[]>(initial);

  async function handleReopen(id: number) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((r) => r.id !== id));
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        Completed <span className="text-gray-400 font-normal text-base">({items.length})</span>
      </h1>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No completed requests yet</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((req) => {
          const duration = req.completedAt
            ? formatDuration(new Date(req.completedAt).getTime() - new Date(req.createdAt).getTime())
            : '—';
          return (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">{req.title}</h3>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={req.priority} />
                  <button
                    onClick={() => handleReopen(req.id)}
                    className="text-xs px-2 py-1 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors font-medium"
                  >
                    ↩ Reopen
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{req.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>{locationLabels[req.location]}</span>
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
