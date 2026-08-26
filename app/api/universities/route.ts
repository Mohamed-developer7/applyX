import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);
  try {
    const upstream = await fetch(`https://universities.hipolabs.com/search?name=${encodeURIComponent(q)}&limit=8`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) });
    if (!upstream.ok) throw new Error('University API unavailable');
    const data = await upstream.json();
    return NextResponse.json(data.slice(0, 8));
  } catch {
    return NextResponse.json({ error:'University discovery is temporarily unavailable.' }, { status: 502 });
  }
}
