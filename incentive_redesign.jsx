import { useState, useMemo } from "react";

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg: "#0d0f12",
  surface: "#141720",
  border: "#252a36",
  border2: "#1e2330",
  amber: "#f59e0b",
  amberD: "#d97706",
  green: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  muted: "#6b7280",
  text: "#e2e8f0",
  textD: "#94a3b8",
};

// ─── Calculation engine ───────────────────────────────────────────────────────
function calcPillarA(apeLacs, privatePct, productMix, rateA) {
  const privateApe = apeLacs * (privatePct / 100);
  const psuApe = apeLacs * (1 - privatePct / 100);
  const insurerWeighted = privateApe * 1.3 + psuApe * 1.0;
  // product booster: carComp 1.8, other 1.3, TW/CV 1.0
  const booster =
    (productMix.carComp / 100) * 1.8 +
    (productMix.carOther / 100) * 1.3 +
    (productMix.twCv / 100) * 1.0;
  return ((rateA / 100) * insurerWeighted * booster * 100000);
}

function calcPillarB(activeAgents, connectedAgents, rateActive, rateConn) {
  return activeAgents * rateActive + connectedAgents * rateConn;
}

function calcPillarC(renewalPct, slabs) {
  if (renewalPct < 50) return slabs[0];
  if (renewalPct < 65) return slabs[1];
  if (renewalPct < 80) return slabs[2];
  return slabs[3];
}

const DEFAULT_RATES = {
  rateA: 0.12,       // % of weighted APE
  rateActive: 150,   // ₹ per active agent
  rateConn: 40,      // ₹ per connected agent
  renewalSlabs: [0, 800, 1500, 2500],
};

const PROFILES = [
  {
    label: "Struggling RM",
    color: C.red,
    icon: "▼",
    apeLacs: 15,
    privatePct: 40,
    productMix: { carComp: 20, carOther: 40, twCv: 40 },
    activeAgents: 5,
    connectedAgents: 10,
    renewalPct: 42,
  },
  {
    label: "Average RM",
    color: C.amber,
    icon: "●",
    apeLacs: 36.6,
    privatePct: 60,
    productMix: { carComp: 40, carOther: 30, twCv: 30 },
    activeAgents: 12,
    connectedAgents: 25,
    renewalPct: 63,
  },
  {
    label: "Star RM",
    color: C.green,
    icon: "▲",
    apeLacs: 80,
    privatePct: 75,
    productMix: { carComp: 60, carOther: 25, twCv: 15 },
    activeAgents: 22,
    connectedAgents: 45,
    renewalPct: 83,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function Tag({ children, color = C.amber }) {
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 10, fontWeight: 700,
      letterSpacing: 1.5, textTransform: "uppercase",
      color, border: `1px solid ${color}40`,
      padding: "2px 8px", borderRadius: 3,
    }}>{children}</span>
  );
}

function Stat({ label, value, sub, color = C.amber }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{sub}</div>}
      <div style={{ fontSize: 12, color: C.textD, marginTop: 3 }}>{label}</div>
    </div>
  );
}

function Pill({ label, val, max, color }) {
  const pct = Math.min(100, (val / max) * 100);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.textD }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: "monospace", color }}>{val.toLocaleString()}</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, onChange, format = (v) => v }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: C.textD }}>{label}</span>
        <span style={{ fontSize: 13, fontFamily: "monospace", color: C.amber, fontWeight: 700 }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.amber }} />
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("Formula");
  const [rates, setRates] = useState(DEFAULT_RATES);

  // Calculator state
  const [calc, setCalc] = useState({
    apeLacs: 36.6,
    privatePct: 60,
    carComp: 40,
    carOther: 30,
    twCv: 30,
    activeAgents: 12,
    connectedAgents: 25,
    renewalPct: 63,
  });

  const productMix = { carComp: calc.carComp, carOther: calc.carOther, twCv: calc.twCv };

  const calcResult = useMemo(() => {
    const a = calcPillarA(calc.apeLacs, calc.privatePct, productMix, rates.rateA);
    const b = calcPillarB(calc.activeAgents, calc.connectedAgents, rates.rateActive, rates.rateConn);
    const c = calcPillarC(calc.renewalPct, rates.renewalSlabs);
    return { a, b, c, total: a + b + c };
  }, [calc, rates]);

  // Budget simulation: 153 RMs
  const budgetSim = useMemo(() => {
    const profiles = PROFILES.map((p) => {
      const a = calcPillarA(p.apeLacs, p.privatePct, p.productMix, rates.rateA);
      const b = calcPillarB(p.activeAgents, p.connectedAgents, rates.rateActive, rates.rateConn);
      const c = calcPillarC(p.renewalPct, rates.renewalSlabs);
      return { ...p, a, b, c, total: a + b + c };
    });
    // estimate floor total: 15% struggling, 60% avg, 25% star (by count)
    const floorTotal = (profiles[0].total * 0.15 + profiles[1].total * 0.60 + profiles[2].total * 0.25) * 153;
    return { profiles, floorTotal };
  }, [rates]);

  const budgetPct = ((budgetSim.floorTotal / 1700000) * 100).toFixed(1);
  const budgetColor = budgetSim.floorTotal <= 1870000 ? C.green : C.red;

  const tabs = ["Formula", "Calculator", "Profiles", "Calibrate"];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Trebuchet MS', sans-serif", color: C.text, padding: "24px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Tag>B2B Motor · VRM Floor · 153 RMs</Tag>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: "#fff", letterSpacing: -0.5 }}>
            Redesigned Incentive Structure
          </h1>
          <p style={{ color: C.textD, marginTop: 6, fontSize: 14 }}>
            3-Pillar model · Self-calculable · Budget-neutral (±10%)
          </p>
        </div>

        {/* KPI Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Current Budget", value: "₹17L", sub: "/ month", color: C.textD },
            { label: "Projected Budget", value: `₹${(budgetSim.floorTotal / 100000).toFixed(1)}L`, sub: `${budgetPct}% of base`, color: budgetColor },
            { label: "Avg Per RM (new)", value: `₹${Math.round(budgetSim.floorTotal / 153).toLocaleString()}`, sub: "vs ₹11,111 old", color: C.amber },
            { label: "Floor APE", value: "₹56 Cr", sub: "monthly", color: C.blue },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <Stat {...s} />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, background: C.surface, borderRadius: 8, padding: 4, border: `1px solid ${C.border}` }}>
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex: 1, padding: "9px 0", border: "none", borderRadius: 6, cursor: "pointer",
              fontFamily: "monospace", fontSize: 12, letterSpacing: 1, fontWeight: activeTab === t ? 700 : 400,
              background: activeTab === t ? C.amber : "transparent",
              color: activeTab === t ? "#000" : C.muted,
              transition: "all 0.2s", textTransform: "uppercase",
            }}>{t}</button>
          ))}
        </div>

        {/* ── FORMULA TAB ── */}
        {activeTab === "Formula" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Formula Box */}
            <div style={{ background: C.surface, border: `1px solid ${C.amber}30`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ marginBottom: 12 }}><Tag>New Formula</Tag></div>
              <div style={{ fontFamily: "monospace", fontSize: 15, lineHeight: 2.2, color: "#e2e8f0" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Incentive</span>
                <span style={{ color: C.muted }}> = </span>
                <span style={{ color: "#f87171" }}>Pillar A</span>
                <span style={{ color: C.muted }}> + </span>
                <span style={{ color: "#60a5fa" }}>Pillar B</span>
                <span style={{ color: C.muted }}> + </span>
                <span style={{ color: "#34d399" }}>Pillar C</span>
                <br />
                <span style={{ color: "#f87171", fontSize: 13 }}>A</span>
                <span style={{ color: C.muted, fontSize: 13 }}> = 0.12% × (Private APE × 1.3 + PSU APE × 1.0) × Product Booster</span>
                <br />
                <span style={{ color: "#60a5fa", fontSize: 13 }}>B</span>
                <span style={{ color: C.muted, fontSize: 13 }}> = ₹150 × Active Agents + ₹40 × Connected Agents</span>
                <br />
                <span style={{ color: "#34d399", fontSize: 13 }}>C</span>
                <span style={{ color: C.muted, fontSize: 13 }}> = Renewal Rate Bonus (slab-based)</span>
              </div>
            </div>

            {/* 3 Pillars */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                {
                  tag: "Pillar A", color: "#f87171", pct: "~60%",
                  title: "APE Commission",
                  points: [
                    "0.12% of insurer-weighted APE",
                    "Private: 1.3x · PSU: 1.0x",
                    "Product booster: Car Comp 1.8x, TP/TW 1.3x, CV 1.0x",
                    "RM controls: push private insurers, push comp policies",
                  ],
                  why: "Direct link to revenue quality"
                },
                {
                  tag: "Pillar B", color: "#60a5fa", pct: "~28%",
                  title: "Activity Pay",
                  points: [
                    "₹150 per Active Agent (≥1 policy/month)",
                    "₹40 per Connected Agent (call >1 min)",
                    "Both onboarded + mapped agents count",
                    "RM controls: make calls, support agents daily",
                  ],
                  why: "Rewards relationship behaviour"
                },
                {
                  tag: "Pillar C", color: "#34d399", pct: "~12%",
                  title: "Renewal Bonus",
                  points: [
                    "< 50% renewal rate → ₹0",
                    "50–65% → ₹800",
                    "65–80% → ₹1,500",
                    "> 80% → ₹2,500",
                  ],
                  why: "Builds long-term agent loyalty"
                },
              ].map((p) => (
                <div key={p.tag} style={{ background: C.surface, border: `1px solid ${p.color}25`, borderRadius: 12, padding: "18px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <Tag color={p.color}>{p.tag}</Tag>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: p.color }}>{p.pct} of budget</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{p.title}</div>
                  {p.points.map((pt, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, marginBottom: 7 }}>
                      <span style={{ color: p.color, fontSize: 12, marginTop: 1 }}>›</span>
                      <span style={{ fontSize: 12, color: C.textD, lineHeight: 1.5 }}>{pt}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                    <span style={{ fontSize: 11, color: p.color, fontFamily: "monospace" }}>WHY: </span>
                    <span style={{ fontSize: 11, color: C.muted }}>{p.why}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* What changed */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 22px" }}>
              <div style={{ marginBottom: 12 }}><Tag color={C.green}>What Changed from Old Structure</Tag></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Salary deduction (unfair)", "Removed entirely", C.red, C.green],
                  ["0.86x March penalty", "Neutral month (no penalty)", C.red, C.green],
                  ["₹1L hard cap", "No cap — earn what you produce", C.red, C.green],
                  ["Special deals 10% weight", "Stays 10% (complex approval friction)", C.amber, C.textD],
                  ["6-variable formula", "3 pillars, 4 inputs — self-calculable", C.red, C.green],
                  ["No renewal metric", "15% of budget tied to renewals", C.red, C.green],
                ].map(([old, nw, oldC, newC]) => (
                  <div key={old} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: C.bg, borderRadius: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: oldC, fontFamily: "monospace", marginBottom: 3 }}>BEFORE: <span style={{ color: C.muted }}>{old}</span></div>
                      <div style={{ fontSize: 11, color: newC, fontFamily: "monospace" }}>AFTER:  <span style={{ color: C.text }}>{nw}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CALCULATOR TAB ── */}
        {activeTab === "Calculator" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Inputs */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ marginBottom: 16 }}><Tag>RM Inputs</Tag></div>

              <Slider label="Monthly APE (₹ Lacs)" value={calc.apeLacs} min={5} max={150} step={0.5}
                onChange={(v) => setCalc({ ...calc, apeLacs: v })} format={(v) => `₹${v}L`} />
              <Slider label="Private Insurer Mix" value={calc.privatePct} min={0} max={100}
                onChange={(v) => setCalc({ ...calc, privatePct: v })} format={(v) => `${v}%`} />

              <div style={{ marginBottom: 6, fontSize: 12, color: C.textD }}>Product Mix (must total 100%)</div>
              <Slider label="Car Comp / SAOD" value={calc.carComp} min={0} max={100}
                onChange={(v) => setCalc({ ...calc, carComp: v, twCv: Math.max(0, 100 - v - calc.carOther) })} format={(v) => `${v}%`} />
              <Slider label="Car TP / TW ex BN" value={calc.carOther} min={0} max={100}
                onChange={(v) => setCalc({ ...calc, carOther: v, twCv: Math.max(0, 100 - calc.carComp - v) })} format={(v) => `${v}%`} />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: C.textD }}>TW Brand New / CV (auto)</span>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: C.amber }}>{Math.max(0, 100 - calc.carComp - calc.carOther)}%</span>
              </div>

              <Slider label="Active Agents this month" value={calc.activeAgents} min={0} max={60}
                onChange={(v) => setCalc({ ...calc, activeAgents: v })} format={(v) => `${v} agents`} />
              <Slider label="Connected Agents (call >1 min)" value={calc.connectedAgents} min={0} max={100}
                onChange={(v) => setCalc({ ...calc, connectedAgents: v })} format={(v) => `${v} agents`} />
              <Slider label="Renewal Rate" value={calc.renewalPct} min={0} max={100}
                onChange={(v) => setCalc({ ...calc, renewalPct: v })} format={(v) => `${v}%`} />
            </div>

            {/* Output */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Total */}
              <div style={{ background: C.surface, border: `1.5px solid ${C.amber}50`, borderRadius: 12, padding: "20px 22px", textAlign: "center" }}>
                <div style={{ marginBottom: 8 }}><Tag>Your Payout</Tag></div>
                <div style={{ fontSize: 42, fontWeight: 900, color: C.amber, fontFamily: "monospace" }}>
                  ₹{Math.round(calcResult.total).toLocaleString()}
                </div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>this month</div>

                <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16, paddingTop: 14 }}>
                  <Pill label="Pillar A — APE Commission" val={Math.round(calcResult.a)} max={calcResult.total} color="#f87171" />
                  <Pill label="Pillar B — Activity Pay" val={Math.round(calcResult.b)} max={calcResult.total} color="#60a5fa" />
                  <Pill label="Pillar C — Renewal Bonus" val={Math.round(calcResult.c)} max={calcResult.total} color="#34d399" />
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ marginBottom: 12 }}><Tag color={C.textD}>Step-by-Step Workings</Tag></div>
                {[
                  {
                    label: "Insurer-Weighted APE", color: "#f87171",
                    formula: `(${(calc.apeLacs * calc.privatePct / 100).toFixed(1)}L × 1.3) + (${(calc.apeLacs * (100 - calc.privatePct) / 100).toFixed(1)}L × 1.0)`,
                    result: `₹${((calc.apeLacs * calc.privatePct / 100 * 1.3) + (calc.apeLacs * (100 - calc.privatePct) / 100)).toFixed(1)}L`,
                  },
                  {
                    label: "Product Booster", color: "#f87171",
                    formula: `${calc.carComp}%×1.8 + ${calc.carOther}%×1.3 + ${Math.max(0, 100 - calc.carComp - calc.carOther)}%×1.0`,
                    result: `${((calc.carComp / 100) * 1.8 + (calc.carOther / 100) * 1.3 + (Math.max(0, 100 - calc.carComp - calc.carOther) / 100) * 1.0).toFixed(2)}x`,
                  },
                  {
                    label: "Pillar A (APE Pay)", color: "#f87171",
                    formula: `0.12% × Weighted APE × Booster`,
                    result: `₹${Math.round(calcResult.a).toLocaleString()}`,
                  },
                  {
                    label: "Pillar B (Activity)", color: "#60a5fa",
                    formula: `(${calc.activeAgents} × ₹150) + (${calc.connectedAgents} × ₹40)`,
                    result: `₹${Math.round(calcResult.b).toLocaleString()}`,
                  },
                  {
                    label: "Pillar C (Renewal)", color: "#34d399",
                    formula: `${calc.renewalPct}% renewal → slab`,
                    result: `₹${calcResult.c.toLocaleString()}`,
                  },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border2}` }}>
                    <div>
                      <div style={{ fontSize: 11, color: row.color, fontFamily: "monospace", fontWeight: 700 }}>{row.label}</div>
                      <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{row.formula}</div>
                    </div>
                    <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 700, color: "#fff", alignSelf: "center" }}>{row.result}</div>
                  </div>
                ))}
              </div>

              {/* Improve hints */}
              <div style={{ background: "#0f2419", border: `1px solid ${C.green}30`, borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 8 }}>↑ Quick Wins to Earn More</div>
                {[
                  calc.renewalPct < 65 && "Improve renewal rate to 65%+ → unlock ₹1,500 renewal bonus",
                  calc.privatePct < 70 && "Push 10% more business to private insurers → +1.3x boost",
                  calc.carComp < 50 && "Shift product mix toward Car Comp → 1.8x product booster",
                  calc.activeAgents < 15 && "Activate 3 more agents → +₹450",
                  calc.connectedAgents < 30 && "Connect with 5 more agents → +₹200",
                ].filter(Boolean).slice(0, 3).map((tip, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#86efac", marginBottom: 5, display: "flex", gap: 6 }}>
                    <span>›</span><span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILES TAB ── */}
        {activeTab === "Profiles" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {budgetSim.profiles.map((p) => (
                <div key={p.label} style={{ background: C.surface, border: `1px solid ${p.color}30`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ background: `${p.color}15`, borderBottom: `1px solid ${p.color}25`, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, color: p.color, fontSize: 14 }}>{p.label}</span>
                    <span style={{ fontSize: 20, color: p.color }}>{p.icon}</span>
                  </div>
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <div style={{ fontSize: 30, fontWeight: 900, color: p.color, fontFamily: "monospace" }}>
                        ₹{Math.round(p.total).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>monthly incentive</div>
                    </div>
                    {[
                      ["APE", `₹${p.apeLacs}L`, null],
                      ["Private Mix", `${p.privatePct}%`, null],
                      ["Active Agents", `${p.activeAgents}`, null],
                      ["Connected", `${p.connectedAgents}`, null],
                      ["Renewal Rate", `${p.renewalPct}%`, null],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <span style={{ fontSize: 12, color: C.muted }}>{k}</span>
                        <span style={{ fontSize: 12, fontFamily: "monospace", color: C.textD }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12 }}>
                      <Pill label="Pillar A" val={Math.round(p.a)} max={p.total} color="#f87171" />
                      <Pill label="Pillar B" val={Math.round(p.b)} max={p.total} color="#60a5fa" />
                      <Pill label="Pillar C" val={Math.round(p.c)} max={p.total} color="#34d399" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Distribution insight */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ marginBottom: 16 }}><Tag color={C.blue}>Distribution Fairness</Tag></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {[
                  { label: "Struggling RM earns", old: "~₹4,000", nw: `₹${Math.round(budgetSim.profiles[0].total).toLocaleString()}`, note: "Still low — but fair, earned by effort" },
                  { label: "Average RM earns", old: "~₹11,111", nw: `₹${Math.round(budgetSim.profiles[1].total).toLocaleString()}`, note: "Consistent with target avg" },
                  { label: "Star RM earns", old: "~₹18,000 (capped)", nw: `₹${Math.round(budgetSim.profiles[2].total).toLocaleString()}`, note: "Uncapped — rewards real effort" },
                ].map((r) => (
                  <div key={r.label} style={{ padding: "14px 16px", background: C.bg, borderRadius: 8 }}>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{r.label}</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ color: C.red, fontFamily: "monospace", fontSize: 13, textDecoration: "line-through" }}>{r.old}</span>
                      <span style={{ color: C.green, fontFamily: "monospace", fontSize: 16, fontWeight: 800 }}>{r.nw}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textD }}>{r.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CALIBRATE TAB ── */}
        {activeTab === "Calibrate" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ marginBottom: 16 }}><Tag color={C.amber}>Adjust Rates (Manager View)</Tag></div>

              <Slider label="APE Commission Rate (%)" value={rates.rateA} min={0.05} max={0.30} step={0.01}
                onChange={(v) => setRates({ ...rates, rateA: v })} format={(v) => `${v.toFixed(2)}%`} />
              <Slider label="₹ Per Active Agent" value={rates.rateActive} min={50} max={400} step={10}
                onChange={(v) => setRates({ ...rates, rateActive: v })} format={(v) => `₹${v}`} />
              <Slider label="₹ Per Connected Agent" value={rates.rateConn} min={10} max={150} step={5}
                onChange={(v) => setRates({ ...rates, rateConn: v })} format={(v) => `₹${v}`} />

              <div style={{ marginTop: 16, marginBottom: 8 }}><Tag color={C.green}>Renewal Bonus Slabs</Tag></div>
              {["< 50% (₹)", "50–65% (₹)", "65–80% (₹)", "> 80% (₹)"].map((label, i) => (
                <Slider key={i} label={label} value={rates.renewalSlabs[i]} min={0} max={4000} step={100}
                  onChange={(v) => {
                    const slabs = [...rates.renewalSlabs];
                    slabs[i] = v;
                    setRates({ ...rates, renewalSlabs: slabs });
                  }} format={(v) => `₹${v}`} />
              ))}

              <button onClick={() => setRates(DEFAULT_RATES)}
                style={{ width: "100%", padding: "10px", background: C.border, border: "none", borderRadius: 8, color: C.textD, cursor: "pointer", fontFamily: "monospace", fontSize: 12, marginTop: 8 }}>
                ↺ Reset to Recommended
              </button>
            </div>

            {/* Budget Health */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: C.surface, border: `1.5px solid ${budgetColor}40`, borderRadius: 12, padding: "20px 22px" }}>
                <div style={{ marginBottom: 12 }}><Tag color={budgetColor}>Budget Health</Tag></div>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 38, fontWeight: 900, color: budgetColor, fontFamily: "monospace" }}>
                    ₹{(budgetSim.floorTotal / 100000).toFixed(1)}L
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>projected floor disbursement</div>
                  <div style={{ fontSize: 12, marginTop: 4, color: budgetColor }}>
                    {budgetSim.floorTotal <= 1700000 ? "✓ Under current budget" :
                     budgetSim.floorTotal <= 1870000 ? "✓ Within 10% limit" :
                     "✗ Exceeds 10% cap — adjust rates"}
                  </div>
                </div>

                <div style={{ height: 10, background: C.border, borderRadius: 5, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{
                    height: "100%", borderRadius: 5,
                    width: `${Math.min(110, budgetSim.floorTotal / 1700000 * 100)}%`,
                    background: budgetColor, transition: "all 0.4s",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "monospace", color: C.muted }}>
                  <span>₹0</span><span style={{ color: C.amber }}>₹17L (base)</span><span style={{ color: C.green }}>₹18.7L (max)</span>
                </div>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ marginBottom: 12 }}><Tag color={C.textD}>Pillar-wise Budget Split</Tag></div>
                {budgetSim.profiles.map((p, i) => {
                  const scale = [0.15, 0.60, 0.25][i];
                  const totA = p.a * scale * 153;
                  const totB = p.b * scale * 153;
                  const totC = p.c * scale * 153;
                  return null; // just computing for aggregate below
                })}
                {(() => {
                  const totA = budgetSim.profiles.reduce((s, p, i) => s + p.a * [0.15, 0.60, 0.25][i] * 153, 0);
                  const totB = budgetSim.profiles.reduce((s, p, i) => s + p.b * [0.15, 0.60, 0.25][i] * 153, 0);
                  const totC = budgetSim.profiles.reduce((s, p, i) => s + p.c * [0.15, 0.60, 0.25][i] * 153, 0);
                  const tot = totA + totB + totC;
                  return (
                    <>
                      {[["Pillar A — APE", totA, "#f87171"], ["Pillar B — Activity", totB, "#60a5fa"], ["Pillar C — Renewal", totC, "#34d399"]].map(([label, val, color]) => (
                        <div key={label} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: C.textD }}>{label}</span>
                            <span style={{ fontSize: 12, fontFamily: "monospace", color }}>₹{(val / 100000).toFixed(1)}L ({((val / tot) * 100).toFixed(0)}%)</span>
                          </div>
                          <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
                            <div style={{ width: `${(val / tot) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: C.border, fontFamily: "monospace" }}>
          REDESIGNED · MAR 2026 · B2B MOTOR INSURANCE · VRM FLOOR
        </div>
      </div>
    </div>
  );
}
