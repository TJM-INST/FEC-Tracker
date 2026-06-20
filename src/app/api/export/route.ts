import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requests } from '@/lib/schema';
import { asc } from 'drizzle-orm';

const locationLabels: Record<string, string> = {
  trade_entry_window: 'Trade Entry Window',
  customer_window: 'Customer Window',
  account_window: 'Account Window',
  order_blotter: 'Confirm Window',
  position_manager: 'Position Manager',
  risk_dashboard: 'Risk Dashboard',
  reports: 'Reports',
  admin: 'Admin',
  other: 'Other',
};

const categoryLabels: Record<string, string> = {
  bug_fix: 'Bug Fix',
  enhancement: 'Enhancement',
  new_feature: 'New Feature',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  in_progress: 'In Progress',
  in_review: 'In Review',
  completed: 'Completed',
};

function escapeCell(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDuration(createdAt: Date, completedAt: Date | null): string {
  if (!completedAt) return '';
  const ms = completedAt.getTime() - createdAt.getTime();
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  return '< 1h';
}

export async function GET() {
  const all = await db.select().from(requests).orderBy(asc(requests.createdAt));

  const headers = [
    'ID', 'Title', 'Description', 'Priority', 'Category', 'Location',
    'Status', 'Submitted', 'Completed', 'Time to Complete',
  ];

  const rows = all.map((r) => [
    String(r.id),
    r.title,
    r.description,
    r.priority.charAt(0).toUpperCase() + r.priority.slice(1),
    categoryLabels[r.category] ?? r.category,
    locationLabels[r.location] ?? r.location,
    statusLabels[r.status] ?? r.status,
    new Date(r.createdAt).toLocaleDateString(),
    r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '',
    formatDuration(new Date(r.createdAt), r.completedAt ? new Date(r.completedAt) : null),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="fec-tracker-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
