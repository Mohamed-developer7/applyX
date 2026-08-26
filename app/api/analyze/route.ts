import { NextRequest, NextResponse } from 'next/server';
import { parseRequirements } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  const { text, institution, program } = await req.json();
  if (!text || typeof text !== 'string') return NextResponse.json({ error:'No requirement text supplied.' }, {status:400});
  if (text.length > 50000) return NextResponse.json({ error:'Source text is too long. Paste a shorter excerpt.' }, {status:400});

  // Deterministic fallback keeps the demo functional without an API key.
  let requirements = parseRequirements(text);
  let mode = 'local-parser';

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-5-mini',
          input: `Extract application requirements from the source below. Return concise requirement names only. Institution: ${institution || 'Unknown'}. Program: ${program || 'Unknown'}. Source:\n${text.slice(0,20000)}`,
          text: { format: { type: 'json_schema', name: 'application_requirements', strict: true, schema: { type:'object', properties:{requirements:{type:'array',items:{type:'string'}}}, required:['requirements'], additionalProperties:false } } }
        })
      });
      if (!response.ok) throw new Error('AI request failed');
      const data = await response.json();
      const parsed = JSON.parse(data.output_text);
      if (Array.isArray(parsed.requirements) && parsed.requirements.length) { requirements = parsed.requirements.slice(0,12); mode='ai-structured'; }
    } catch { /* keep local parser */ }
  }

  return NextResponse.json({ requirements, mode });
}
