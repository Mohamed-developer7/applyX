import { NextRequest, NextResponse } from 'next/server';
import { searchInstitutions } from '@/lib/university-data';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  const country = req.nextUrl.searchParams.get('country')?.trim() || '';
  const region = req.nextUrl.searchParams.get('region')?.trim() || '';

  // 1. Search our curated verified global institutions (US, UK, China, Pakistan, Canada, Europe, Asia)
  const localResults = searchInstitutions(q, {
    country: country && country !== 'all' ? country : undefined,
    region: region && region !== 'all' ? region : undefined,
  });

  if (!q || q.length < 2) {
    return NextResponse.json(localResults.slice(0, 16));
  }

  // 2. Try online Hipo API for supplementary global long-tail lookup if query has 3+ chars
  let externalResults: Array<{ name: string; country: string; alphaTwoCode?: string; domains: string[]; web_pages: string[] }> = [];

  try {
    const upstream = await fetch(
      `https://universities.hipolabs.com/search?name=${encodeURIComponent(q)}&limit=8`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(2500),
      }
    );
    if (upstream.ok) {
      const data = await upstream.json();
      if (Array.isArray(data)) {
        externalResults = data;
      }
    }
  } catch {
    // Graceful offline fallback
  }

  // 3. Merge & deduplicate by institution name
  const seen = new Set<string>();
  const combined = [];

  for (const inst of localResults) {
    seen.add(inst.name.toLowerCase());
    combined.push({
      id: inst.id,
      name: inst.name,
      country: inst.country,
      city: inst.city,
      domains: inst.domains,
      web_pages: inst.webPages,
      admissionsUrl: inst.admissionsUrl,
      applicationPlatform: inst.applicationPlatform,
      standardRequirements: inst.standardRequirements,
      programs: inst.programs,
      verifiedSource: true,
      lastVerifiedDate: inst.lastVerifiedDate,
    });
  }

  for (const ext of externalResults) {
    if (!seen.has(ext.name.toLowerCase())) {
      seen.add(ext.name.toLowerCase());
      combined.push({
        name: ext.name,
        country: ext.country,
        domains: ext.domains || [],
        web_pages: ext.web_pages || [],
        verifiedSource: false,
      });
    }
  }

  return NextResponse.json(combined.slice(0, 20));
}
