import { NextResponse } from 'next/server';
import { getClient } from '@/lib/subconscious';
import { getTools } from '@/lib/tools';

export const maxDuration = 120;

const NANDA_MAP = [
  { keywords: ['rodent', 'rat', 'pest', 'mosquito', 'vector', 'vermin'], code: '00004', label: 'Risk for Infection', severity: 3 },
  { keywords: ['pothole', 'sidewalk', 'trip', 'falling', 'tree', 'unsafe structure'], code: '00035', label: 'Risk for Injury', severity: 2 },
  { keywords: ['dumping', 'waste', 'abandon', 'hazmat', 'contamination', 'spill'], code: '00161', label: 'Contamination', severity: 2 },
  { keywords: ['graffiti', 'housing violation', 'noise', 'building', 'code enforcement'], code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 },
  { keywords: ['street light', 'signal', 'accessibility', 'parking obstruction', 'blocked'], code: '00085', label: 'Impaired Physical Mobility', severity: 2 },
  { keywords: ['heat', 'no heat', 'hot water', 'temperature', 'boiler'], code: '00005', label: 'Risk for Imbalanced Body Temperature', severity: 4 },
];

function nandaFor(complaint: string) {
  const lc = complaint.toLowerCase();
  for (const m of NANDA_MAP) {
    if (m.keywords.some(k => lc.includes(k))) {
      return { code: m.code, label: m.label, severity: m.severity };
    }
  }
  return { code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 };
}

function computeScore(openCases: number, slaCompliancePct: number, totalCases30d: number): number {
  const densityPenalty = Math.min(openCases / 200, 1) * 35;
  const slaPenalty = (1 - slaCompliancePct / 100) * 45;
  const volumePenalty = Math.min(totalCases30d / 500, 1) * 20;
  return Math.max(5, Math.min(100, Math.round(100 - densityPenalty - slaPenalty - volumePenalty)));
}

export async function GET() {
  const client = getClient();
  const tools = getTools();
  const engine = process.env.SUBCONSCIOUS_ENGINE ?? 'tim-gpt';

  const instructions = `You are a Boston 311 data analyst. Use the Boston MCP tools to gather current service request statistics for these 8 neighborhoods: Dorchester, Roxbury, East Boston, South End, Jamaica Plain, Back Bay, Charlestown, Hyde Park.

For EACH neighborhood, query the MCP to find:
1. Number of currently OPEN service requests
2. Total requests submitted in the last 30 days
3. Top 3 complaint types/categories by count
4. Number of requests that are overdue (past their SLA deadline)
5. Average days to close for recently completed requests
6. SLA compliance percentage

Return ONLY valid JSON with no markdown code fences and no explanation text:
{
  "neighborhoods": [
    {
      "name": "Dorchester",
      "open_cases": 142,
      "total_cases_30d": 380,
      "overdue_cases": 23,
      "avg_days_to_close": 5.2,
      "top_complaints": ["Pothole Repair", "Rodent Activity", "Graffiti"],
      "sla_compliance_pct": 84
    }
  ],
  "queried_at": "${new Date().toISOString()}"
}`;

  try {
    const run = await client.run({
      engine,
      input: { instructions, tools },
      options: { awaitCompletion: true },
    });

    const answer = run.result?.answer ?? '';
    const jsonMatch = answer.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Agent did not return JSON structure');

    const parsed = JSON.parse(jsonMatch[0]) as {
      neighborhoods: Record<string, unknown>[];
      queried_at: string;
    };

    const neighborhoods = parsed.neighborhoods.map(n => {
      const complaints = (n.top_complaints as string[]) ?? [];
      const openCases = (n.open_cases as number) ?? 0;
      const total = (n.total_cases_30d as number) ?? 0;
      const sla = (n.sla_compliance_pct as number) ?? 100;
      const score = computeScore(openCases, sla, total);
      const status =
        score >= 75 ? 'STABLE' :
        score >= 50 ? 'CAUTION' :
        score >= 30 ? 'WARNING' : 'CRITICAL';
      const diagnoses = complaints.map(nandaFor);

      return {
        ...n,
        health_score: score,
        status,
        primary_diagnosis: diagnoses[0] ?? nandaFor(''),
        all_diagnoses: diagnoses,
      };
    });

    return NextResponse.json({ neighborhoods, last_updated: parsed.queried_at });
  } catch (err) {
    console.error('[vitals]', err);
    return NextResponse.json(
      { error: 'Failed to query vitals', detail: String(err) },
      { status: 500 }
    );
  }
}
