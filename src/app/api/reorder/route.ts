import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requests } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { orderedIds } = await req.json() as { orderedIds: number[] };

    await Promise.all(
      orderedIds.map((id, index) =>
        db.update(requests).set({ sortOrder: index }).where(eq(requests.id, id))
      )
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
