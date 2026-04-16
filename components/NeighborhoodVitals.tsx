'use client';
import { useEffect, useState } from 'react';

type Status = 'STABLE' | 'CAUTION' | 'WARNING' | 'CRITICAL';

interface NandaDx {
  code: string;
  label: string;
  severity: number;
}

interface Neighborhood {
  name: string;
  open_cases: number;
  total_cases_30d: number;
  overdue_cases: number;
  avg_days_to_close: number;
  top_complaints: string[];
  sla_compliance_pct: number;
  health_score: number;
  status: Status;
  primary_diagnosis: NandaDx;
  all_diagnoses: NandaDx[];
}

interface VitalsData {
  neighborhoods: Neighborhood[];
  last_updated: string;
}

const COLORS: Record<Status, { ring: string; text: string; badge: string; bg: string; dot: string }> = {
  STABLE:   { ring: 'border-emerald-500/40', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', bg: 'bg-emerald-500/5',  dot: '#10b981' },
  CAUTION:  { ring: 'border-yellow-500/40',  text: 'text-yellow-400',  badge: 'bg-yellow-500/20  text-yellow-300  border-yellow-500/40',  bg: 'bg-yellow-500/5',   dot: '#eab308' },
  WARNING:  { ring: 'border-orange-500/40',  text: 'text-orange-400',  badge: 'bg-orange-500/20  text-orange-300  border-orange-500/40',  bg: 'bg-orange-500/5',   dot: '#f97316' },
  CRITICAL: { ring: 'border-red-500/40',     text: 'text-red-400',     badge: 'bg-red-500/20     text-red-300     border-red-500/40',     bg: 'bg-red-500/5',      dot: '#ef4444' },
};

const INTERVENTIONS: Record<string, string> = {
  'Risk for Infection':                    'Deploy rodent abatement team. Inspect sanitation infrastructure and standing water near open complaints.',
  'Risk for Injury':                       'Prioritize DPW patching schedule. Flag high-traffic corridors for immediate repair.',
  'Contamination':                         'Schedule bulk waste pickup. Issue illegal dumping notices and increase patrol frequency.',
  'Impaired Physical Mobility':            'Emergency streetlight repair order. Initiate ADA compliance audit for flagged corridors.',
  'Risk for Compromised Human Dignity':    'Rapid graffiti removal within 24h. Activate community liaison outreach program.',
  'Risk for Imbalanced Body Temperature':  'Activate cooling/warming centers. Escalate all heat and no-heat complaints to priority queue.',
};

// Fallback demo data shown instantly while live data loads
const DEMO: Neighborhood[] = [
  { name: 'Dorchester',    open_cases: 142, total_cases_30d: 380, overdue_cases: 23, avg_days_to_close: 5.2, sla_compliance_pct: 84, top_complaints: ['Pothole Repair', 'Rodent Activity', 'Graffiti'],          health_score: 58, status: 'CAUTION',  primary_diagnosis: { code: '00035', label: 'Risk for Injury', severity: 2 },      all_diagnoses: [{ code: '00035', label: 'Risk for Injury', severity: 2 }, { code: '00004', label: 'Risk for Infection', severity: 3 }, { code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 }] },
  { name: 'Roxbury',       open_cases: 198, total_cases_30d: 445, overdue_cases: 67, avg_days_to_close: 8.1, sla_compliance_pct: 62, top_complaints: ['Rodent Activity', 'Illegal Dumping', 'Street Light'],       health_score: 28, status: 'CRITICAL', primary_diagnosis: { code: '00004', label: 'Risk for Infection', severity: 3 },    all_diagnoses: [{ code: '00004', label: 'Risk for Infection', severity: 3 }, { code: '00161', label: 'Contamination', severity: 2 }, { code: '00085', label: 'Impaired Physical Mobility', severity: 2 }] },
  { name: 'East Boston',   open_cases: 89,  total_cases_30d: 210, overdue_cases: 12, avg_days_to_close: 3.8, sla_compliance_pct: 91, top_complaints: ['Pothole Repair', 'Abandoned Vehicle', 'Noise Complaint'],   health_score: 72, status: 'CAUTION',  primary_diagnosis: { code: '00035', label: 'Risk for Injury', severity: 2 },      all_diagnoses: [{ code: '00035', label: 'Risk for Injury', severity: 2 }, { code: '00161', label: 'Contamination', severity: 2 }, { code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 }] },
  { name: 'South End',     open_cases: 45,  total_cases_30d: 120, overdue_cases: 3,  avg_days_to_close: 2.1, sla_compliance_pct: 97, top_complaints: ['Graffiti Removal', 'Parking Enforcement', 'Noise'],         health_score: 88, status: 'STABLE',   primary_diagnosis: { code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 }, all_diagnoses: [{ code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 }, { code: '00085', label: 'Impaired Physical Mobility', severity: 1 }, { code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 }] },
  { name: 'Jamaica Plain', open_cases: 67,  total_cases_30d: 180, overdue_cases: 8,  avg_days_to_close: 3.2, sla_compliance_pct: 88, top_complaints: ['Tree Maintenance', 'Pothole Repair', 'Graffiti'],          health_score: 77, status: 'STABLE',   primary_diagnosis: { code: '00035', label: 'Risk for Injury', severity: 2 },      all_diagnoses: [{ code: '00035', label: 'Risk for Injury', severity: 2 }, { code: '00035', label: 'Risk for Injury', severity: 2 }, { code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 }] },
  { name: 'Back Bay',      open_cases: 28,  total_cases_30d: 85,  overdue_cases: 1,  avg_days_to_close: 1.8, sla_compliance_pct: 99, top_complaints: ['Parking Enforcement', 'Noise Complaint', 'Graffiti'],      health_score: 94, status: 'STABLE',   primary_diagnosis: { code: '00085', label: 'Impaired Physical Mobility', severity: 1 }, all_diagnoses: [{ code: '00085', label: 'Impaired Physical Mobility', severity: 1 }, { code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 }, { code: '00174', label: 'Risk for Compromised Human Dignity', severity: 1 }] },
  { name: 'Charlestown',   open_cases: 52,  total_cases_30d: 145, overdue_cases: 6,  avg_days_to_close: 2.9, sla_compliance_pct: 93, top_complaints: ['Pothole Repair', 'Parking Enforcement', 'Street Light'],   health_score: 81, status: 'STABLE',   primary_diagnosis: { code: '00035', label: 'Risk for Injury', severity: 2 },      all_diagnoses: [{ code: '00035', label: 'Risk for Injury', severity: 2 }, { code: '00085', label: 'Impaired Physical Mobility', severity: 1 }, { code: '00085', label: 'Impaired Physical Mobility', severity: 2 }] },
  { name: 'Hyde Park',     open_cases: 115, total_cases_30d: 295, overdue_cases: 34, avg_days_to_close: 6.7, sla_compliance_pct: 72, top_complaints: ['Rodent Activity', 'Pothole Repair', 'Illegal Dumping'],    health_score: 41, status: 'WARNING',  primary_diagnosis: { code: '00004', label: 'Risk for Infection', severity: 3 },    all_diagnoses: [{ code: '00004', label: 'Risk for Infection', severity: 3 }, { code: '00035', label: 'Risk for Injury', severity: 2 }, { code: '00161', label: 'Contamination', severity: 2 }] },
];

function ekgPath(score: number, w: number, h: number): string {
  const amp = Math.max(4, ((100 - score) / 100) * h * 0.72);
  const mid = h / 2;
  const segs = 5;
  const sw = w / segs;
  let d = `M 0 ${mid}`;
  for (let i = 0; i < segs; i++) {
    const x = i * sw;
    if (score < 30) {
      d += ` L ${x + sw * 0.12} ${mid} L ${x + sw * 0.22} ${mid - amp * 2.1} L ${x + sw * 0.32} ${mid + amp * 1.1} L ${x + sw * 0.42} ${mid} L ${x + sw} ${mid}`;
    } else if (score < 50) {
      d += ` L ${x + sw * 0.28} ${mid} L ${x + sw * 0.38} ${mid - amp * 1.5} L ${x + sw * 0.5} ${mid + amp * 0.65} L ${x + sw * 0.62} ${mid} L ${x + sw} ${mid}`;
    } else {
      d += ` L ${x + sw * 0.33} ${mid} L ${x + sw * 0.44} ${mid - amp} L ${x + sw * 0.55} ${mid + amp * 0.38} L ${x + sw * 0.66} ${mid} L ${x + sw} ${mid}`;
    }
  }
  return d;
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-right">
      <div className={`text-xl font-bold leading-none ${color}`}>{value}</div>
      <div className="text-[10px] text-white/30 mt-0.5 tracking-widest">{label}</div>
    </div>
  );
}

function MiniEkg({ score, status }: { score: number; status: Status }) {
  return (
    <svg width={156} height={26} className="overflow-visible">
      <path d={ekgPath(score, 156, 26)} fill="none" stroke={COLORS[status].dot} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LargeEkg({ score, status }: { score: number; status: Status }) {
  const color = COLORS[status].dot;
  const path = ekgPath(score, 560, 52);
  return (
    <svg width="100%" height={52} viewBox="0 0 560 52" preserveAspectRatio="none" className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth="8"   strokeLinecap="round" strokeLinejoin="round" opacity="0.07" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NeighborhoodVitals() {
  const [data, setData] = useState<VitalsData>({ neighborhoods: DEMO, last_updated: new Date().toISOString() });
  const [loading, setLoading] = useState(true);
  const [liveLoaded, setLiveLoaded] = useState(false);
  const [selected, setSelected] = useState<Neighborhood>(DEMO[0]);

  useEffect(() => {
    fetch('/api/vitals')
      .then(r => r.json())
      .then((live: VitalsData) => {
        if (live.neighborhoods?.length) {
          setData(live);
          setSelected(live.neighborhoods[0]);
          setLiveLoaded(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const city = {
    totalOpen: data.neighborhoods.reduce((s, n) => s + n.open_cases, 0),
    avgScore:  Math.round(data.neighborhoods.reduce((s, n) => s + n.health_score, 0) / data.neighborhoods.length),
    critical:  data.neighborhoods.filter(n => n.status === 'CRITICAL').length,
    stable:    data.neighborhoods.filter(n => n.status === 'STABLE').length,
  };

  const c = COLORS[selected.status];

  return (
    <div className="h-screen flex flex-col bg-[#070b14] text-white overflow-hidden" style={{ fontFamily: 'var(--font-chivo-mono, ui-monospace, monospace)' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex-none border-b border-white/10 px-6 py-3 flex items-center justify-between gap-6">
        <div>
          <h1 className="text-sm font-bold tracking-[0.22em] text-cyan-400 uppercase">Boston Municipal Health Monitor</h1>
          <p className="text-[10px] text-white/25 mt-0.5">Community Vitals · Boston 311 × NANDA-I Diagnostic Framework</p>
        </div>
        <div className="flex items-center gap-7">
          <Stat label="OPEN CASES" value={city.totalOpen.toLocaleString()} color="text-white" />
          <Stat label="CITY SCORE"  value={String(city.avgScore)} color={city.avgScore >= 75 ? 'text-emerald-400' : city.avgScore >= 50 ? 'text-yellow-400' : 'text-red-400'} />
          <Stat label="CRITICAL"   value={String(city.critical)} color="text-red-400" />
          <Stat label="STABLE"     value={String(city.stable)}   color="text-emerald-400" />
          <div className="text-[10px] text-white/25 flex items-center gap-1.5 ml-3 border-l border-white/10 pl-4">
            <span className={`w-1.5 h-1.5 rounded-full flex-none ${loading ? 'bg-yellow-400 animate-pulse' : liveLoaded ? 'bg-emerald-400' : 'bg-white/20'}`} />
            {loading ? 'Loading live 311 data…' : liveLoaded ? `Live · ${new Date(data.last_updated).toLocaleTimeString()}` : 'Demo data'}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* ── Left: neighborhood list ────────────────────────── */}
        <aside className="w-[268px] flex-none border-r border-white/10 overflow-y-auto">
          {data.neighborhoods.map(n => {
            const nc = COLORS[n.status];
            const isActive = selected.name === n.name;
            return (
              <button
                key={n.name}
                onClick={() => setSelected(n)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/5 ${isActive ? 'bg-white/8 border-l-2 border-l-cyan-400' : ''}`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <div className="text-sm font-semibold">{n.name}</div>
                    <div className={`text-[10px] mt-0.5 leading-tight ${nc.text}`}>{n.primary_diagnosis.label}</div>
                  </div>
                  <div className="text-right flex-none ml-2">
                    <div className={`text-lg font-bold leading-none ${nc.text}`}>{n.health_score}</div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border mt-1 inline-block ${nc.badge}`}>{n.status}</span>
                  </div>
                </div>
                <MiniEkg score={n.health_score} status={n.status} />
                <div className="flex gap-3 mt-1 text-[10px] text-white/25">
                  <span>{n.open_cases} open</span>
                  <span>{n.sla_compliance_pct}% SLA</span>
                  <span>{n.overdue_cases} overdue</span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* ── Right: patient detail ───────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[620px]">

            {/* Patient header */}
            <div className={`flex items-center gap-4 mb-5 p-4 rounded-xl border ${c.ring} ${c.bg}`}>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/25 tracking-widest mb-0.5">PATIENT FILE</div>
                <h2 className="text-2xl font-bold truncate">{selected.name}</h2>
                <div className="text-[10px] text-white/30 mt-0.5">
                  ID: BOS-311-{selected.name.toUpperCase().replace(/ /g, '')} · {selected.top_complaints[0]}
                </div>
              </div>
              <div className="text-center flex-none">
                <div className={`text-4xl font-bold leading-none ${c.text}`}>{selected.health_score}</div>
                <div className="text-[10px] text-white/25 mt-1 tracking-widest">HEALTH SCORE</div>
              </div>
              <div className={`text-center px-4 py-3 rounded-lg border flex-none ${c.ring} ${c.bg}`}>
                <div className={`text-lg font-bold tracking-widest ${c.text}`}>{selected.status}</div>
                <div className="text-[10px] text-white/25 mt-0.5">STATUS</div>
              </div>
            </div>

            {/* Vital signs grid */}
            <div className="grid grid-cols-4 gap-2.5 mb-5">
              {[
                { l: 'OPEN CASES',      v: String(selected.open_cases),                  col: 'text-white' },
                { l: 'OVERDUE',         v: String(selected.overdue_cases),               col: selected.overdue_cases > 20 ? 'text-red-400' : 'text-yellow-400' },
                { l: 'SLA COMPLIANCE',  v: `${selected.sla_compliance_pct}%`,            col: selected.sla_compliance_pct >= 85 ? 'text-emerald-400' : selected.sla_compliance_pct >= 70 ? 'text-yellow-400' : 'text-red-400' },
                { l: 'AVG CLOSE TIME',  v: `${selected.avg_days_to_close.toFixed(1)}d`,  col: 'text-white' },
              ].map(s => (
                <div key={s.l} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className={`text-xl font-bold ${s.col}`}>{s.v}</div>
                  <div className="text-[10px] text-white/25 mt-1 tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>

            {/* EKG display */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-5">
              <div className="text-[10px] text-white/25 tracking-widest mb-3">COMMUNITY VITAL SIGNS · CASE LOAD PROFILE</div>
              <LargeEkg score={selected.health_score} status={selected.status} />
            </div>

            {/* NANDA diagnoses */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-5">
              <div className="text-[10px] text-white/25 tracking-widest mb-3">NANDA-I NURSING DIAGNOSES</div>
              <div className="space-y-2">
                {selected.all_diagnoses.map((dx, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg">
                    <div className={`w-2 h-2 flex-none rounded-full ${i === 0 ? 'bg-red-400' : i === 1 ? 'bg-yellow-400' : 'bg-white/15'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{dx.label}</div>
                      <div className="text-[10px] text-white/25">Code {dx.code} · Severity {dx.severity}/4</div>
                    </div>
                    <div className="text-[10px] text-white/35 truncate max-w-[130px]">{selected.top_complaints[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intervention recommendation */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <div className="text-[10px] text-cyan-400 tracking-widest mb-2">RECOMMENDED INTERVENTION</div>
              <p className="text-sm text-white/75 leading-relaxed">
                {INTERVENTIONS[selected.primary_diagnosis.label] ?? 'Continue monitoring. Maintain current response protocols.'}
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
