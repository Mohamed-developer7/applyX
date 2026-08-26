import { NextRequest, NextResponse } from 'next/server';

function cleanHtml(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
}

// Blocks requests aimed at loopback, private, link-local and cloud metadata
// addresses so this route can't be used as a server-side request forgery
// (SSRF) proxy into internal infrastructure.
function isBlockedHostname(hostname: string) {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h === '[::1]' || h === '::1') return true;
  if (h === '169.254.169.254') return true; // cloud metadata endpoint
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local
    if (a === 0) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const parsed = new URL(url);
    if (!['http:','https:'].includes(parsed.protocol)) return NextResponse.json({error:'Only public HTTP(S) URLs are supported.'},{status:400});
    if (isBlockedHostname(parsed.hostname)) return NextResponse.json({error:'That address cannot be fetched.'},{status:400});
    const response = await fetch(parsed.toString(), { headers: { 'user-agent':'ApplyX/0.2 application-intelligence bot' }, signal: AbortSignal.timeout(8000), redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) return NextResponse.json({error:'That source redirects and cannot be fetched directly. Try the final URL.'},{status:400});
    if (!response.ok) return NextResponse.json({error:`Source returned ${response.status}.`},{status:400});
    const html = await response.text();
    return NextResponse.json({ title: parsed.hostname, text: cleanHtml(html).slice(0, 30000), url: parsed.toString() });
  } catch {
    return NextResponse.json({error:'Could not read that URL. Paste the requirements manually instead.'},{status:400});
  }
}
