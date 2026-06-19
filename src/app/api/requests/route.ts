import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requests } from '@/lib/schema';
import { desc, eq, ne } from 'drizzle-orm';

export async function GET() {
  try {
    const all = await db.select().from(requests).orderBy(requests.sortOrder, desc(requests.createdAt));
    return NextResponse.json(all);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, priority, category } = body;

    // Find highest sortOrder among active requests
    const active = await db
      .select({ sortOrder: requests.sortOrder })
      .from(requests)
      .where(ne(requests.status, 'completed'))
      .orderBy(desc(requests.sortOrder))
      .limit(1);

    const nextOrder = active.length > 0 ? active[0].sortOrder + 1 : 0;

    const [created] = await db
      .insert(requests)
      .values({ title, description, priority, category, sortOrder: nextOrder })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
