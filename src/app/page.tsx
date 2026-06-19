import { db } from '@/lib/db';
import { requests } from '@/lib/schema';
import { asc } from 'drizzle-orm';
import QueueView from '@/components/QueueView';

export const dynamic = 'force-dynamic';

export default async function QueuePage() {
  const all = await db.select().from(requests).orderBy(asc(requests.sortOrder), asc(requests.createdAt));
  return <QueueView initial={all} />;
}
