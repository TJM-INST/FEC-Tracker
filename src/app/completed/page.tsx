import { db } from '@/lib/db';
import { requests } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import CompletedView from '@/components/CompletedView';

export const dynamic = 'force-dynamic';

export default async function CompletedPage() {
  const completed = await db
    .select()
    .from(requests)
    .where(eq(requests.status, 'completed'))
    .orderBy(desc(requests.completedAt));

  return <CompletedView initial={completed} />;
}
