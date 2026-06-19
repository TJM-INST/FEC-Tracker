import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requests } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.category !== undefined) updates.category = body.category;
    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === 'completed') {
        updates.completedAt = new Date();
      } else {
        updates.completedAt = null;
      }
    }

    const [updated] = await db
      .update(requests)
      .set(updates)
      .where(eq(requests.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(requests).where(eq(requests.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
