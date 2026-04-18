import { useState, useRef, useEffect } from "react";

const BRAND = "#1D9E75";
const BRAND_LIGHT = "#E1F5EE";
const BRAND_DARK = "#085041";

const SYSTEM_PROMPT = `You are the Peterson Solutions Sustainability Assistant — a professional AI chatbot for Peterson Solutions, a global sustainability consultancy specialising in ESG, certifications (RSPO, FSC, MSC, MSPO, GOTS), supply chain audits, and training.

Your job is to qualify leads through a structured conversation. Follow this exact flow:

STEP 1 - Greeting: Introduce yourself warmly and collect: Full Name, Company, Email, Phone.
STEP 2 - Qualification (ask one at a time):
  Q1: What certification are they interested in? (RSPO, FSC, MSC, MSPO, GOTS, or other)
  Q2: Which part of their supply chain? (Farm/Forest, Processing, Logistics, Retail)
  Q3: What is their focus area? (Carbon/GHG, Social Compliance, Traceability, Biodiversity)
  Q4: What service do they need? (Consultancy, Certification Audit Support, Training, Gap Assessment)
  Q5: Which region/country are their operations in?
  Q6: How many production sites/facilities?
STEP 3 - Triage: Ask if they'd like to book a consultation or receive information by email.
STEP 4 - Based on answer, either confirm a booking slot or say tailored info will be sent. Thank them.

Be concise, professional, friendly. Ask ONE question at a time. Keep replies under 60 words.`;

const CURRENCIES = [
  { code: "MYR", symbol: "RM", name: "Malaysia", flag: "🇲🇾", salary: 4500, ai: 800 },
  { code: "SGD", symbol: "S$", name: "Singapore", flag: "🇸🇬", salary: 5500, ai: 1200 },
  { code: "IDR", symbol: "Rp", name: "Indonesia", flag: "🇮🇩", salary: 8000000, ai: 1500000 },
  { code: "THB", symbol: "฿", name: "Thailand", flag: "🇹🇭", salary: 35000, ai: 6000 },
  { code: "PHP", symbol: "₱", name: "Philippines", flag: "🇵🇭", salary: 35000, ai: 6000 },
  { code: "VND", symbol: "₫", name: "Vietnam", flag: "🇻🇳", salary: 18000000, ai: 3500000 },
  { code: "USD", symbol: "$", name: "USA / Global", flag: "🌐", salary: 5000, ai: 1200 },
  { code: "EUR", symbol: "€", name: "Europe", flag: "🇪🇺", salary: 4500, ai: 1000 },
  { code: "GBP", symbol: "£", name: "UK", flag: "🇬🇧", salary: 3800, ai: 900 },
  { code: "AUD", symbol: "A$", name: "Australia", flag: "🇦🇺", salary: 7000, ai: 1500 },
  { code: "INR", symbol: "₹", name: "India", flag: "🇮🇳", salary: 60000, ai: 12000 },
  { code: "JPY", symbol: "¥", name: "Japan", flag: "🇯🇵", salary: 350000, ai: 70000 },
  { code: "CNY", symbol: "¥", name: "China", flag: "🇨🇳", salary: 18000, ai: 3500 },
  { code: "BRL", symbol: "R$", name: "Brazil", flag: "🇧🇷", salary: 8000, ai: 1500 },
];

const PHASE_TEMPLATES = [
  { name: "Month 1–2", title: "Setup & Training", desc: "Configure AI with local SOPs, FAQs, certification knowledge. Train on local language nuances.", color: BRAND },
  { name: "Month 3–4", title: "Pilot Launch", desc: "Go live with selected lead channels. Run A/B testing against human triage. Track intent accuracy.", color: "#378ADD" },
  { name: "Month 5–6", title: "Optimise & Validate", desc: "Refine AI responses based on real data. Achieve >90% intent accuracy. Produce Pilot Report.", color: "#7F77DD" },
  { name: "Month 7+", title: "Full Deployment", desc: "Hand off qualified leads to country sales team. Integrate with CRM. Expand channels (WhatsApp, web).", color: "#D85A30" },
];

const STATS = [
  { label: "Available", value: "24/7", sub: "AI never sleeps" },
  { label: "Triage time saved", value: "80%", sub: "per lead handled" },
  { label: "Intent accuracy", value: ">90%", sub: "post-optimisation" },
  { label: "Response time", value: "<3s", sub: "vs. hours for humans" },
];

function fmt(n, symbol, code) {
  if (["IDR","VND","JPY"].includes(code)) return symbol + " " + Math.round(n).toLocaleString();
  return symbol + " " + Math.round(n).toLocaleString();
}

function ROICalculator() {
  const [selIdx, setSelIdx] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const cur = CURRENCIES[selIdx];

  const [leads, setLeads] = useState(80);
  const [staffCount, setStaffCount] = useState(2);
  const [salary, setSalary] = useState(cur.salary);
  const [hoursPerLead, setHoursPerLead] = useState(1.5);
  const [aiMonthly, setAiMonthly] = useState(cur.ai);

  function selectCurrency(i) {
    const c = CURRENCIES[i];
    setSelIdx(i);
    setSalary(c.salary);
    setAiMonthly(c.ai);
    setShowDropdown(false);
  }

  const workingHours = 160;
  const hourlyRate = salary / workingHours;
  const triageCost = leads * hoursPerLead * hourlyRate * staffCount;
  const humanTotal = (salary * staffCount) + triageCost;
  const saving = humanTotal - aiMonthly;
  const savingPct = Math.round((saving / humanTotal) * 100);
  const annualSaving = saving * 12;
  const s = cur.symbol;
  const c = cur.code;

  const sliders = [
    { label: "Leads per month", val: leads, set: setLeads, min: 10, max: 500, step: 10, disp: leads },
    { label: "Sales staff (headcount)", val: staffCount, set: setStaffCount, min: 1, max: 20, step: 1, disp: staffCount },
    { label: `Avg. staff salary (${c}/mo)`, val: salary, set: setSalary, min: Math.round(cur.salary * 0.3), max: Math.round(cur.salary * 3), step: Math.round(cur.salary * 0.05) || 1, disp: fmt(salary, s, c) },
    { label: "Hours per lead (triage)", val: hoursPerLead, set: setHoursPerLead, min: 0.5, max: 8, step: 0.5, disp: hoursPerLead + "h" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, position: "relative" }}>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Market / Currency:</div>
        <button onClick={() => setShowDropdown(!showDropdown)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${BRAND}`, background: BRAND_LIGHT, color: BRAND_DARK, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          <span style={{ fontSize: 16 }}>{cur.flag}</span> {cur.name} ({cur.code}) ▾
        </button>
        {showDropdown && (
          <div style={{ position: "absolute", top: 36, left: 120, zIndex: 10, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 10, width: 240, maxHeight: 280, overflowY: "auto" }}>
            {CURRENCIES.map((c, i) => (
              <div key={c.code} onClick={() => selectCurrency(i)} style={{ padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: i === selIdx ? "rgba(29,158,117,0.12)" : "transparent", color: i === selIdx ? BRAND_DARK : "var(--color-text-primary)" }}>
                <span style={{ fontSize: 15 }}>{c.flag}</span> {c.name} <span style={{ color: "var(--color-text-secondary)", marginLeft: "auto" }}>{c.code}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        {sliders.map(({ label, val, set, min, max, step, disp }) => (
          <div key={label}>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(+e.target.value)} style={{ flex: 1 }} />
              <span style={{ fontSize: 12, fontWeight: 500, minWidth: 64, textAlign: "right" }}>{disp}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>AI tool monthly cost ({c})</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input type="range" min={Math.round(cur.ai * 0.2)} max={Math.round(cur.ai * 5)} step={Math.round(cur.ai * 0.05) || 1} value={aiMonthly} onChange={e => setAiMonthly(+e.target.value)} style={{ flex: 1 }} />
          <span style={{ fontSize: 12, fontWeight: 500, minWidth: 80, textAlign: "right" }}>{fmt(aiMonthly, s, c)}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ background: "#FEF2F2", border: "0.5px solid #FECACA", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#991B1B", marginBottom: 4, fontWeight: 500 }}>Human team cost / month</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "#7F1D1D" }}>{fmt(humanTotal, s, c)}</div>
          <div style={{ fontSize: 11, color: "#B91C1C", marginTop: 4 }}>Salary + triage hours</div>
        </div>
        <div style={{ background: BRAND_LIGHT, border: "0.5px solid #9FE1CB", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: BRAND_DARK, marginBottom: 4, fontWeight: 500 }}>AI assistant cost / month</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: BRAND_DARK }}>{fmt(aiMonthly, s, c)}</div>
          <div style={{ fontSize: 11, color: "#0F6E56", marginTop: 4 }}>Flat subscription</div>
        </div>
      </div>

      <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Monthly saving</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: BRAND }}>{fmt(saving, s, c)}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Cost reduction</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: BRAND }}>{savingPct}%</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Annual saving</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: BRAND }}>{fmt(annualSaving, s, c)}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>* Default figures are market estimates. Adjust sliders to reflect your actual context.</div>
    </div>
  );
}

function Timeline() {
  const [country, setCountry] = useState("Malaysia");
  const [showCountryDrop, setShowCountryDrop] = useState(false);

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const allMonths = [];
  [2025,2026,2027,2028].forEach(y => monthNames.forEach(m => allMonths.push(`${m} ${y}`)));

  const now = new Date();
  const bufferDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const defaultStart = `${monthNames[bufferDate.getMonth()]} ${bufferDate.getFullYear()}`;
  const [startMonth, setStartMonth] = useState(defaultStart);

  const countries = CURRENCIES.map(c => ({ name: c.name, flag: c.flag }));
  const selCountry = countries.find(c => c.name === country) || countries[0];

  function monthLabel(startStr, offsetMonths) {
    const idx = allMonths.indexOf(startStr);
    if (idx < 0) return "";
    return allMonths[Math.min(idx + offsetMonths, allMonths.length - 1)] || "";
  }

  const phases = [
    { ...PHASE_TEMPLATES[0], period: `${startMonth} – ${monthLabel(startMonth, 1)}` },
    { ...PHASE_TEMPLATES[1], period: `${monthLabel(startMonth, 2)} – ${monthLabel(startMonth, 3)}` },
    { ...PHASE_TEMPLATES[2], period: `${monthLabel(startMonth, 4)} – ${monthLabel(startMonth, 5)}` },
    { ...PHASE_TEMPLATES[3], period: `${monthLabel(startMonth, 6)}+` },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>Country / Market</div>
          <button onClick={() => setShowCountryDrop(!showCountryDrop)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${BRAND}`, background: BRAND_LIGHT, color: BRAND_DARK, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            <span style={{ fontSize: 15 }}>{selCountry.flag}</span> {selCountry.name} ▾
          </button>
          {showCountryDrop && (
            <div style={{ position: "absolute", top: 58, left: 0, zIndex: 10, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 10, width: 200, maxHeight: 220, overflowY: "auto" }}>
              {countries.map(c => (
                <div key={c.name} onClick={() => { setCountry(c.name); setShowCountryDrop(false); }} style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: c.name === country ? "rgba(29,158,117,0.12)" : "transparent", color: c.name === country ? BRAND_DARK : "var(--color-text-primary)" }}>
                  <span style={{ fontSize: 14 }}>{c.flag}</span> {c.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>Onboarding start month</div>
          <select value={startMonth} onChange={e => setStartMonth(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, fontSize: 13 }}>
            {allMonths.filter(m => {
              const [mn, yr] = m.split(" ");
              const mIdx = monthNames.indexOf(mn);
              const mDate = new Date(+yr, mIdx, 1);
              return mDate >= bufferDate;
            }).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: BRAND_LIGHT, border: `0.5px solid #9FE1CB`, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: BRAND_DARK }}>
        <span style={{ fontWeight: 500 }}>{selCountry.flag} {selCountry.name}</span> — AI Assistant deployment starting <span style={{ fontWeight: 500 }}>{startMonth}</span>. Full deployment by <span style={{ fontWeight: 500 }}>{monthLabel(startMonth, 6)}</span>.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {phases.map((p, i) => (
          <div key={p.name} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, flexShrink: 0 }}>{i + 1}</div>
              {i < phases.length - 1 && <div style={{ width: 1, height: 28, background: "var(--color-border-tertiary)", marginTop: 4 }} />}
            </div>
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 14px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{p.title}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 8 }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", whiteSpace: "nowrap", marginLeft: 8 }}>{p.period}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: 10, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
        <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Implementation lead:</span> Ahmad Qaiyum · Peterson Solutions (Malaysia) · Available for country-level project consulting engagement. Each market follows this same 6-month framework, localised to language, SOPs, and certification requirements.
      </div>
    </div>
  );
}

function ChatDemo() {
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: "Hi! I'm the Peterson Sustainability Assistant. I'm here to help qualify your enquiry and connect you with the right expert. To get started, could I get your full name and company?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const newMsgs = [...msgs, { role: "user", text }];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMsgs.map(m => ({ role: m.role, content: m.text }))
        })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Sorry, I couldn't process that.";
      setMsgs(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", text: "Connection issue. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: BRAND, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌿</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 500, fontSize: 14 }}>Peterson Sustainability Assistant</div>
          <div style={{ color: "#9FE1CB", fontSize: 11 }}>Powered by AI · Online 24/7</div>
        </div>
      </div>
      <div style={{ height: 280, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, background: "#F9FAFB" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "8px 12px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: m.role === "user" ? BRAND : "#fff", color: m.role === "user" ? "#fff" : "var(--color-text-primary)", fontSize: 13, lineHeight: 1.5, border: m.role === "assistant" ? "0.5px solid var(--color-border-tertiary)" : "none" }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "8px 14px", borderRadius: "14px 14px 14px 4px", background: "#fff", border: "0.5px solid var(--color-border-tertiary)", fontSize: 13, color: "var(--color-text-secondary)" }}>Typing…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8, padding: "10px 12px", borderTop: "0.5px solid var(--color-border-tertiary)", background: "#fff" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message…" style={{ flex: 1, fontSize: 13 }} />
        <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "6px 16px", background: BRAND, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1 }}>Send</button>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("roi");
  const tabs = [
    { id: "roi", label: "ROI Calculator" },
    { id: "timeline", label: "Country Timeline" },
    { id: "demo", label: "Live Demo" },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <h2 className="sr-only">Peterson Solutions AI Chatbot — Global Pitch Tool</h2>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: BRAND }} />
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 500 }}>PETERSON SOLUTIONS · GLOBAL AI INITIATIVE</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 6px", color: "var(--color-text-primary)" }}>AI Sustainability Assistant</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: 0 }}>A market-by-market adoption framework. Any country team can onboard — see your numbers, your timeline, your ROI.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 22 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: BRAND }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 16px", fontSize: 13, fontWeight: tab === t.id ? 500 : 400, background: "transparent", border: "none", borderBottom: tab === t.id ? `2px solid ${BRAND}` : "2px solid transparent", color: tab === t.id ? BRAND : "var(--color-text-secondary)", cursor: "pointer", marginBottom: -1 }}>{t.label}</button>
        ))}
      </div>

      {tab === "roi" && (
        <div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>Select your market and adjust the sliders to see a real cost comparison between a human triage team and the AI assistant — in your local currency.</p>
          <ROICalculator />
        </div>
      )}

      {tab === "timeline" && (
        <div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>Select your country and preferred start month. The 6-month onboarding framework adapts to any market — same structure, localised execution.</p>
          <Timeline />
        </div>
      )}

      {tab === "demo" && (
        <div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 14 }}>Experience the AI assistant firsthand. Try it as a new client enquiring about RSPO or FSC certification — this is exactly what your leads will interact with.</p>
          <ChatDemo />
        </div>
      )}

      <div style={{ marginTop: 24, fontSize: 11, color: "var(--color-text-secondary)", borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Peterson Solutions · AI Communication Tool · Global Rollout Planner</span>
        <span>Ahmad Qaiyum · Implementation Lead · PCU Global AI Expert Team</span>
      </div>
    </div>
  );
}
