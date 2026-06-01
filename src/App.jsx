import { useState, useRef, useCallback, useEffect } from "react";

// Load Inter font
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
document.head.appendChild(fontLink);

// ── Styles ────────────────────────────────────────────────────────────────────
const BG   = "#f0f4f8";
const CARD = "#ffffff";
const PRI  = "#1e40af";
const PRIL = "#3b82f6";
const RED  = "#dc2626";
const AMB  = "#d97706";
const GRN  = "#16a34a";
const lbl  = {fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:"#64748b",marginBottom:6,display:"block",textTransform:"uppercase"};
const inp  = {width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box",background:"#fff"};
const btn  = (bg,fg="#fff")=>({padding:"10px 20px",borderRadius:10,background:bg,color:fg,border:"none",fontWeight:700,fontSize:14,cursor:"pointer"});

// ── Catalog ───────────────────────────────────────────────────────────────────
const CATALOG = [
  { group:"Structural & Exterior", items:[
    {id:"foundation",label:"Foundation",icon:"🏗",desc:"Cracks, settling, water intrusion",fields:[],q:[
      {id:"cracks",text:"Any visible cracks in foundation walls or floor?",type:"opt",opts:["None","Hairline only","Wide or diagonal"],risk:[0,10,30]},
      {id:"water",text:"Signs of water intrusion or staining?",type:"opt",opts:["None","Minor staining","Active seepage"],risk:[0,15,30]},
      {id:"settling",text:"Visible settling or uneven floors?",type:"yn",risk:[30,0]},
    ]},
    {id:"roof",label:"Roof",icon:"🏠",desc:"Age, shingles, flashing, leaks",fields:[{k:"age",l:"Roof Age (yrs)"},{k:"material",l:"Material (Asphalt/Metal/Tile)"}],q:[
      {id:"missing",text:"Missing, curling, or damaged shingles visible?",type:"opt",opts:["None","A few","Many"],risk:[0,15,30]},
      {id:"flashing",text:"Condition of flashing around chimney/vents?",type:"opt",opts:["Good","Lifting/gaps","Missing"],risk:[0,15,25]},
      {id:"sag",text:"Any sagging or uneven roof plane?",type:"yn",risk:[30,0]},
      {id:"leaks",text:"Evidence of interior leaks or water stains?",type:"yn",risk:[25,0]},
    ]},
    {id:"siding",label:"Siding & Trim",icon:"🎨",desc:"Condition, rot, gaps",fields:[{k:"material",l:"Material (Vinyl/Wood/HardiePlank)"}],q:[
      {id:"rot",text:"Visible rot, damage, or gaps in siding?",type:"opt",opts:["None","Minor","Significant"],risk:[0,10,25]},
      {id:"paint",text:"Paint peeling or significant fading?",type:"yn",risk:[10,0]},
    ]},
    {id:"gutters",label:"Gutters & Downspouts",icon:"🌧",desc:"Drainage, clogging",fields:[],q:[
      {id:"clogged",text:"Gutters clogged, sagging, or pulling away?",type:"opt",opts:["No issues","Minor","Significant"],risk:[0,8,18]},
      {id:"divert",text:"Downspouts divert water away from foundation?",type:"yn",risk:[0,15]},
    ]},
    {id:"driveway",label:"Driveway & Grading",icon:"🛤",desc:"Cracks, water flow toward house",fields:[],q:[
      {id:"grade",text:"Does ground slope away from house on all sides?",type:"opt",opts:["Yes","Mostly","No - slopes toward"],risk:[0,8,20]},
    ]},
  ]},
  { group:"Electrical", items:[
    {id:"panel",label:"Service Panel",icon:"⚡",desc:"Age, capacity, wiring quality",fields:[{k:"manufacturer",l:"Manufacturer"},{k:"amperage",l:"Amperage"},{k:"year",l:"Year"}],q:[
      {id:"brand",text:"Panel brand?",type:"opt",opts:["Square D/Siemens/Eaton","GE/Murray","Federal Pacific/Zinsco"],risk:[0,10,40]},
      {id:"capacity",text:"Panel amperage?",type:"opt",opts:["200A+","150A","100A or less"],risk:[0,5,15]},
      {id:"double_tap",text:"Double-tapped breakers visible?",type:"yn",risk:[15,0]},
      {id:"rust",text:"Corrosion or rust inside panel?",type:"yn",risk:[20,0]},
    ]},
    {id:"wiring",label:"Visible Wiring",icon:"🌀",desc:"Outdated or unsafe wiring types",fields:[],q:[
      {id:"type",text:"Visible wiring type?",type:"opt",opts:["Romex/NM cable","Armored BX","Knob & tube or aluminum"],risk:[0,10,35]},
      {id:"junction",text:"Open junction boxes or exposed splices?",type:"yn",risk:[20,0]},
    ]},
    {id:"outlets",label:"Outlets & GFCIs",icon:"🔲",desc:"Kitchens, baths, exterior",fields:[],q:[
      {id:"gfci",text:"GFCI outlets in kitchen, baths, exterior?",type:"opt",opts:["All present","Some missing","None"],risk:[0,10,20]},
      {id:"ungrounded",text:"Ungrounded (2-prong) outlets visible?",type:"yn",risk:[10,0]},
    ]},
  ]},
  { group:"Plumbing", items:[
    {id:"water_heater",label:"Water Heater",icon:"♨️",desc:"Age, condition, safety",fields:[{k:"manufacturer",l:"Manufacturer"},{k:"model",l:"Model #"},{k:"serial",l:"Serial #"},{k:"year",l:"Mfg Year"}],q:[
      {id:"age",text:"Approximate age of water heater?",type:"opt",opts:["Under 6 yrs","6-10 yrs","10-15 yrs","15+ yrs"],risk:[0,5,20,35]},
      {id:"rust",text:"Rust, corrosion, or mineral buildup visible?",type:"opt",opts:["None","Minor","Significant"],risk:[0,10,25]},
      {id:"tpr",text:"TPR valve and overflow pipe present?",type:"opt",opts:["Yes both","Valve only","Neither"],risk:[0,10,20]},
      {id:"r22",text:"R-22 refrigerant label present (heat pump)?",type:"yn",risk:[25,0]},
    ]},
    {id:"pipes",label:"Pipes & Supply Lines",icon:"🔩",desc:"Material, condition, leaks",fields:[{k:"material",l:"Pipe material"}],q:[
      {id:"material",text:"Visible pipe material?",type:"opt",opts:["Copper/PEX","CPVC","Galvanized/polybutylene"],risk:[0,5,25]},
      {id:"leaks",text:"Evidence of active leaks or prior repairs?",type:"opt",opts:["None","Staining only","Active drips"],risk:[0,10,30]},
      {id:"pressure",text:"Water pressure adequate throughout?",type:"opt",opts:["Good","Low","Very low"],risk:[0,10,20]},
    ]},
    {id:"drain",label:"Drain & Sewer",icon:"🚰",desc:"Slow drains, backup, sewer condition",fields:[],q:[
      {id:"slow",text:"Any slow drains or backup history?",type:"opt",opts:["None","Occasional","Frequent"],risk:[0,10,25]},
      {id:"scoped",text:"Has sewer line been scoped recently?",type:"opt",opts:["Yes, clear","Yes, issues found","Not scoped"],risk:[0,25,10]},
    ]},
  ]},
  { group:"HVAC", items:[
    {id:"hvac",label:"Heating & Cooling System",icon:"🌡",desc:"Age, type, condition, efficiency",fields:[{k:"manufacturer",l:"Manufacturer"},{k:"model",l:"Model #"},{k:"serial",l:"Serial #"},{k:"year",l:"Install Year"}],q:[
      {id:"type",text:"System type?",type:"opt",opts:["Forced air gas","Heat pump","Boiler/radiant","Window units"],risk:[0,0,5,15]},
      {id:"age",text:"Age of system?",type:"opt",opts:["Under 5 yrs","5-10 yrs","10-15 yrs","15+ yrs"],risk:[0,5,15,30]},
      {id:"filter",text:"Filter condition?",type:"opt",opts:["Clean","Dirty","Very clogged"],risk:[0,5,15]},
      {id:"noise",text:"Unusual noises or smells when running?",type:"opt",opts:["None","Minor","Yes"],risk:[0,10,25]},
      {id:"coolant",text:"R-22 (Freon) refrigerant system?",type:"yn",risk:[25,0]},
    ]},
    {id:"ducts",label:"Ductwork & Ventilation",icon:"💨",desc:"Condition, insulation, mold",fields:[],q:[
      {id:"condition",text:"Visible duct condition?",type:"opt",opts:["Good","Aging/gaps","Damaged/disconnected"],risk:[0,10,25]},
      {id:"mold",text:"Any musty smell from vents?",type:"yn",risk:[20,0]},
    ]},
  ]},
  { group:"Interior", items:[
    {id:"walls",label:"Walls & Ceilings",icon:"🧱",desc:"Cracks, stains, settling",fields:[],q:[
      {id:"stains",text:"Water stains or discoloration on ceilings?",type:"opt",opts:["None","Old/dry","Active"],risk:[0,10,25]},
      {id:"cracks",text:"Cracks in walls or ceilings?",type:"opt",opts:["None","Hairline","Wide or structural"],risk:[0,8,25]},
    ]},
    {id:"windows",label:"Windows & Doors",icon:"🪟",desc:"Seals, operation, efficiency",fields:[],q:[
      {id:"seals",text:"Foggy or failed window seals?",type:"opt",opts:["None","A few","Many"],risk:[0,5,15]},
      {id:"operation",text:"All windows and doors operate freely?",type:"yn",risk:[0,10]},
    ]},
    {id:"flooring",label:"Flooring",icon:"🪵",desc:"Condition, soft spots, damage",fields:[],q:[
      {id:"soft",text:"Soft spots or sagging in floors?",type:"yn",risk:[25,0]},
      {id:"condition",text:"Overall flooring condition?",type:"opt",opts:["Good","Worn","Significant damage"],risk:[0,5,20]},
    ]},
    {id:"attic",label:"Attic",icon:"🏚",desc:"Insulation, ventilation, moisture",fields:[],q:[
      {id:"insulation",text:"Insulation level?",type:"opt",opts:["Adequate (10+ in)","Thin (<6 in)","None visible"],risk:[0,10,20]},
      {id:"mold",text:"Signs of mold or moisture in attic?",type:"opt",opts:["None","Minor staining","Active mold"],risk:[0,15,35]},
      {id:"ventilation",text:"Adequate ridge/soffit ventilation?",type:"opt",opts:["Yes","Partial","None"],risk:[0,10,20]},
    ]},
    {id:"basement",label:"Basement / Crawlspace",icon:"🏛",desc:"Water, mold, structural",fields:[],q:[
      {id:"water",text:"Signs of water entry or flooding?",type:"opt",opts:["None","Staining only","Active seepage"],risk:[0,15,35]},
      {id:"mold",text:"Visible mold or musty odor?",type:"opt",opts:["None","Odor only","Visible mold"],risk:[0,15,35]},
      {id:"sump",text:"Sump pump present and working?",type:"opt",opts:["Yes","Present/untested","None"],risk:[0,5,10]},
    ]},
  ]},
  { group:"Safety & Environmental", items:[
    {id:"mold",label:"Mold & Air Quality",icon:"🍄",desc:"Visible mold, odors, moisture",fields:[],q:[
      {id:"visible",text:"Visible mold anywhere in home?",type:"opt",opts:["None","Isolated (bathroom)","Multiple areas"],risk:[0,15,40]},
      {id:"odor",text:"Persistent musty odor?",type:"yn",risk:[20,0]},
      {id:"tested",text:"Air quality or mold test done?",type:"opt",opts:["Yes, clear","Yes, found issues","Not tested"],risk:[0,30,5]},
    ]},
    {id:"radon",label:"Radon",icon:"☢️",desc:"Test results, mitigation",fields:[],q:[
      {id:"tested",text:"Has home been tested for radon?",type:"opt",opts:["Yes, below 4 pCi/L","Yes, above 4 pCi/L","Not tested"],risk:[0,25,10]},
      {id:"system",text:"Radon mitigation system present?",type:"opt",opts:["Yes","No","N/A - not needed"],risk:[0,5,0]},
    ]},
    {id:"asbestos",label:"Asbestos / Lead",icon:"⚠️",desc:"Older materials, paint, insulation",fields:[],q:[
      {id:"age_risk",text:"Home built before 1980?",type:"yn",risk:[15,0]},
      {id:"tested",text:"Lead paint or asbestos inspection done?",type:"opt",opts:["Yes, clear","Yes, found","Not done"],risk:[0,25,10]},
    ]},
    {id:"termites",label:"Pests & Termites",icon:"🐜",desc:"Damage, evidence, history",fields:[],q:[
      {id:"damage",text:"Visible wood damage from pests?",type:"opt",opts:["None","Minor","Significant"],risk:[0,10,30]},
      {id:"mud_tubes",text:"Mud tubes or active pest signs?",type:"yn",risk:[25,0]},
      {id:"inspection",text:"Recent pest inspection?",type:"opt",opts:["Yes, clear","Yes, treatment done","No inspection"],risk:[0,5,15]},
    ]},
    {id:"smoke_co",label:"Smoke & CO Detectors",icon:"🚨",desc:"Placement, function, age",fields:[],q:[
      {id:"present",text:"Smoke detectors on every level?",type:"opt",opts:["Yes all levels","Some levels","None visible"],risk:[0,5,20]},
      {id:"co",text:"CO detectors near sleeping areas?",type:"opt",opts:["Yes","No","No gas appliances"],risk:[0,15,0]},
    ]},
  ]},
];

const ALL_ITEMS = CATALOG.flatMap(g => g.items);

// ── Scoring ───────────────────────────────────────────────────────────────────
const LIFESPAN = {
  roof:20, panel:30, wiring:50, water_heater:12, hvac:18, foundation:100,
  pipes:50, drain:50, mold:0, siding:30, gutters:25, windows:25,
};
const COST_RANGE = {
  roof:[8000,18000], panel:[3000,7000], wiring:[5000,15000],
  water_heater:[1200,2000], hvac:[5000,14000], foundation:[3000,30000],
  pipes:[2000,10000], drain:[1000,8000], mold:[500,5000],
  basement:[2000,15000], attic:[1000,5000], siding:[3000,12000],
};

function scoreItem(id, detail = {}) {
  const def = ALL_ITEMS.find(i => i.id === id);
  let sc = 0, red = false, detail_str = "";

  // Age-based scoring
  const year = parseInt(detail.year) || parseInt(detail.labelResult?.decodedManufactureYear);
  if (year && LIFESPAN[id]) {
    const age = new Date().getFullYear() - year;
    const pct = age / LIFESPAN[id];
    if (pct > 0.85) { sc += 35; red = true; detail_str = `${age} yrs old (${Math.round(pct*100)}% of lifespan)`; }
    else if (pct > 0.65) { sc += 20; detail_str = `${age} yrs old`; }
    else if (pct > 0.4)  { sc += 10; }
  }

  // R-22 check
  if (detail.refrigerant && detail.refrigerant.toUpperCase().includes("R-22")) { sc += 25; red = true; }
  if (detail.labelResult?.refrigerant && detail.labelResult.refrigerant.toUpperCase().includes("R-22")) { sc += 25; red = true; }

  // Photo findings
  (detail.photos || []).forEach(p => {
    (p.result?.findings || []).forEach(f => {
      if (f.severity === "Critical") { sc += 30; red = true; }
      else if (f.severity === "High") { sc += 20; }
      else if (f.severity === "Moderate") { sc += 10; }
    });
  });

  // Structured question answers
  if (def && def.q && detail.answers) {
    def.q.forEach(q => {
      const ans = detail.answers[q.id];
      const opts = q.type === "yn" ? ["Yes","No"] : q.opts;
      const idx = opts.indexOf(ans);
      if (idx >= 0 && q.risk[idx] != null) {
        const penalty = q.risk[idx];
        sc = Math.min(100, sc + penalty);
        if (penalty >= 25) red = true;
        if (!detail_str && penalty > 0) detail_str = q.text.replace(/\?$/,"") + ": " + ans;
      }
    });
  }

  const costRange = COST_RANGE[id] || [500, 3000];
  return { score: Math.min(100, sc), redFlag: red, detail: detail_str, costLow: costRange[0], costHigh: costRange[1] };
}

function calcOverall(items, formData) {
  let base = 0;
  const yearBuilt = parseInt(formData.yearBuilt);
  if (yearBuilt) {
    const age = new Date().getFullYear() - yearBuilt;
    if (age > 80) base = 35;
    else if (age > 50) base = 25;
    else if (age > 30) base = 15;
    else if (age > 15) base = 8;
  }

  const SEVERE_WORDS = ["mold","asbestos","foundation","structural","lead","termite","flood","sewer","electrical fire","knob and tube"];
  const notes = (formData.notes || "").toLowerCase();
  const severeHits = SEVERE_WORDS.filter(w => notes.includes(w));
  if (severeHits.length) base = Math.min(100, base + severeHits.length * 10);

  if (!items.length) return { score: base, signals: [], totalCostLow: 0, totalCostHigh: 0, severeHits };

  const signals = items.map(it => ({ system: it.label, ...scoreItem(it.id, it.detail) }));
  const avg = signals.reduce((s, x) => s + x.score, 0) / signals.length;
  const redCount = signals.filter(s => s.redFlag).length;
  const finalScore = Math.min(100, Math.round(base * 0.3 + avg * 0.5 + redCount * 8));
  const totalCostLow = signals.reduce((s, x) => s + (x.score > 30 ? x.costLow : 0), 0);
  const totalCostHigh = signals.reduce((s, x) => s + (x.score > 30 ? x.costHigh : 0), 0);
  return { score: finalScore, signals, totalCostLow, totalCostHigh, severeHits };
}

// ── AI Helper ─────────────────────────────────────────────────────────────────
async function ai(system, user, images = []) {
  const content = images.length
    ? [...images.map(im => ({ type: "image", source: { type: "base64", media_type: im.type, data: im.b64 } })), { type: "text", text: user }]
    : user;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: [{ role: "user", content }] }),
  });
  const d = await res.json();
  return d.content?.map(b => b.text || "").join("") || "";
}

async function toB64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ── Bradford White + multi-brand serial decode helper prompt ──────────────────
const BW_DECODE = `BRADFORD WHITE SERIAL DECODE RULES:
Format: [Year letter][Month letter][8-digit production number]
Year letters (20-year cycle -- pick the cycle closest to the current year 2025):
A=2004or2024, B=2005or2025, C=2006or2026, D=2007, E=2008or2028, F=2009, G=2010, H=2011, J=2012, K=2013, L=2014, M=2015, N=2016, P=2017, R=2018, S=2019, T=2020, U=2021, V=2022, W=2023, X=2004 (skip I,O,Q)
Month letters: A=Jan, B=Feb, C=Mar, D=Apr, E=May, F=Jun, G=Jul, H=Aug, J=Sep, K=Oct, L=Nov, M=Dec
DISAMBIGUATION RULE: If the ANSI compliance date on the label is after 2007, OR if the production number is 8 digits, use the LATER cycle. 
EXAMPLE: AE53321439 => A=2024 (not 2004, because 8-digit production number means post-2007), E=May => Manufactured May 2024.

OTHER BRANDS:
- Rheem/Ruud: First 2 digits of serial = year, next 2 = week. Example: 2023XXXXXX = 2020.
- AO Smith: First letter = decade (F=2000s,G=2010s,H=2020s), next 2 digits = year offset. Example: H421234 = 2024.
- Carrier/Bryant: First 4 digits of serial = year+week. Example: 2342XXXXX = 2023 week 42.
- Trane: 4th and 5th digits of serial = year. Example: XXXXX4XXXXXXXXXXX where position 4-5 = year digits.
- Lennox: Positions 1-4 of serial in format YYWW = year+week. Example: 2342XXXXX = 2023.`;

// ── Components ────────────────────────────────────────────────────────────────

function QuestionSection({ questions, answers, onChange }) {
  if (!questions || questions.length === 0) return null;
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={lbl}>QUICK QUESTIONS</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {questions.map(q => {
          const ans = answers && answers[q.id];
          const opts = q.type === "yn" ? ["Yes", "No"] : q.opts;
          return (
            <div key={q.id} style={{ background: "#f8fafc", borderRadius: 10, padding: "11px 13px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 8, lineHeight: 1.4 }}>{q.text}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {opts.map((opt, i) => {
                  const isSelected = ans === opt;
                  const riskPenalty = q.risk ? q.risk[i] : 0;
                  const isRisky = riskPenalty >= 25;
                  const isMid = riskPenalty >= 10 && riskPenalty < 25;
                  const selBg = isRisky ? "#fef2f2" : isMid ? "#fffbeb" : "#f0fdf4";
                  const selBdr = isRisky ? "#fecaca" : isMid ? "#fde68a" : "#bbf7d0";
                  const selColor = isRisky ? RED : isMid ? AMB : GRN;
                  return (
                    <button key={opt} onClick={() => onChange(q.id, ans === opt ? null : opt)}
                      style={{
                        padding: "7px 13px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: isSelected ? 700 : 500,
                        background: isSelected ? selBg : "#fff",
                        border: `1.5px solid ${isSelected ? selBdr : "#e2e8f0"}`,
                        color: isSelected ? selColor : "#374151",
                      }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhotoCapture({ itemId, photos, onPhotos }) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const fileRef = useRef();
  const labelRef = useRef();

  async function handleFiles(files, isLabel = false) {
    const newPhotos = [];
    for (const f of files) {
      const b64 = await toB64(f);
      const url = URL.createObjectURL(f);
      newPhotos.push({ url, b64, type: f.type, isLabel, result: null, scanning: true });
    }
    const updated = [...photos, ...newPhotos];
    onPhotos(updated);

    // Analyze each
    for (let i = photos.length; i < updated.length; i++) {
      const p = updated[i];
      try {
        if (p.isLabel) {
          setScanning(true);
          const raw = await ai(
            "You are an expert at reading equipment labels. Return only valid JSON with no markdown.",
            BW_DECODE + "\n\nRead every detail from this label. Return JSON: {manufacturer, model, serial, year (integer), fuelType, capacity, btu, efficiency, refrigerant, decodedManufactureYear (integer, use the BW decode rules above), decodedManufactureMonth (integer), serialDecodeExplanation (string), estimatedAge (string), rawText, confidence (0-100)}",
            [{ type: p.type, b64: p.b64 }]
          );
          let parsed = {};
          try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch {}
          updated[i] = { ...p, scanning: false, result: parsed, isLabel: true };
          setScanResult(parsed);
          setScanning(false);
        } else {
          const raw = await ai(
            "You are a licensed home inspector analyzing a photo. Return only valid JSON.",
            `Analyze this photo for home inspection issues. Return JSON: {findings: [{issue, severity (Critical|High|Moderate|Low), confidence (0-100), description, repairEstimateLow, repairEstimateHigh, specialist}], positives: [string], overallCondition (Excellent|Good|Fair|Poor|Critical)}`,
            [{ type: p.type, b64: p.b64 }]
          );
          let parsed = {};
          try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch {}
          updated[i] = { ...p, scanning: false, result: parsed };
        }
        onPhotos([...updated]);
      } catch (e) {
        updated[i] = { ...p, scanning: false, result: { error: e.message } };
        onPhotos([...updated]);
      }
    }
  }

  function onDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) handleFiles(files, false);
  }

  return (
    <div style={{ marginBottom: 13 }}>
      <label style={lbl}>PHOTOS & LABEL SCAN</label>

      {/* Button group */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <button onClick={() => labelRef.current.click()} style={{ ...btn("#0f172a"), fontSize: 13, padding: "8px 14px" }}>
          📷 Scan Label
        </button>
        <button onClick={() => fileRef.current.click()} style={{ ...btn(PRI), fontSize: 13, padding: "8px 14px" }}>
          📁 Upload Photos
        </button>
        <span style={{ fontSize: 12, color: "#94a3b8", alignSelf: "center" }}>or drag & drop below</span>
      </div>

      <input ref={labelRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { handleFiles(Array.from(e.target.files), true); e.target.value = ""; }} />
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => { handleFiles(Array.from(e.target.files), false); e.target.value = ""; }} />

      {/* Drop zone */}
      <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
        style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: "14px", textAlign: "center", color: "#94a3b8", fontSize: 13, background: "#f8fafc", minHeight: 48 }}>
        {photos.length === 0 ? "Drop images here" : `${photos.length} photo(s) added`}
      </div>

      {/* Scan result card */}
      {scanResult && (
        <div style={{ marginTop: 10, background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: GRN, marginBottom: 6 }}>✅ Label Scanned</div>
          {[["Manufacturer", scanResult.manufacturer], ["Model", scanResult.model], ["Serial", scanResult.serial],
            ["Mfg Year", scanResult.decodedManufactureYear ? `${scanResult.decodedManufactureYear} (${scanResult.serialDecodeExplanation || ""})` : scanResult.year],
            ["Fuel", scanResult.fuelType], ["Capacity", scanResult.capacity], ["BTU", scanResult.btu],
            ["Refrigerant", scanResult.refrigerant], ["Est. Age", scanResult.estimatedAge]
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ fontSize: 12, color: "#374151", marginBottom: 3 }}><b>{k}:</b> {v}</div>
          ))}
        </div>
      )}

      {/* Photo results */}
      {photos.filter(p => !p.isLabel).map((p, i) => (
        <div key={i} style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <img src={p.url} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <div style={{ flex: 1, fontSize: 12 }}>
            {p.scanning ? <span style={{ color: "#94a3b8" }}>Analyzing...</span> :
              p.result?.findings?.length ? p.result.findings.map((f, j) => (
                <div key={j} style={{ color: f.severity === "Critical" ? RED : f.severity === "High" ? AMB : "#374151" }}>
                  {f.severity}: {f.issue}
                </div>
              )) : <span style={{ color: GRN }}>No issues found</span>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemCard({ item, onUpdate, onRemove }) {
  const [open, setOpen] = useState(true);
  const def = ALL_ITEMS.find(d => d.id === item.id);
  const detail = item.detail || {};

  function setField(k, v) { onUpdate({ ...item, detail: { ...detail, [k]: v } }); }
  function setAnswer(qid, val) { onUpdate({ ...item, detail: { ...detail, answers: { ...(detail.answers || {}), [qid]: val } } }); }
  function setPhotos(photos) { onUpdate({ ...item, detail: { ...detail, photos } }); }

  const sc = scoreItem(item.id, detail);
  const scoreColor = sc.score >= 70 ? RED : sc.score >= 40 ? AMB : GRN;

  return (
    <div style={{ background: CARD, borderRadius: 14, border: "1.5px solid #e2e8f0", marginBottom: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "13px 16px", cursor: "pointer", gap: 10 }} onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: 20 }}>{item.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{item.label}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{item.desc}</div>
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, color: scoreColor }}>{sc.score}</div>
        {sc.redFlag && <span style={{ fontSize: 10, background: RED, color: "#fff", borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>FLAG</span>}
        <span style={{ color: "#94a3b8", fontSize: 18 }}>{open ? "^" : "v"}</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 18 }}>x</button>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {/* Detail fields */}
          {(def?.fields || []).length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 13 }}>
              {def.fields.map(f => (
                <div key={f.k}>
                  <label style={lbl}>{f.l}</label>
                  <input style={inp} value={detail[f.k] || ""} onChange={e => setField(f.k, e.target.value)} placeholder={f.l} />
                </div>
              ))}
            </div>
          )}

          {/* Label scan auto-fill */}
          {detail.labelResult?.decodedManufactureYear && (
            <div style={{ marginBottom: 13, background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 10, padding: "10px 13px" }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: PRI, marginBottom: 4 }}>Label auto-filled fields</div>
              <div style={{ fontSize: 12, color: "#374151" }}>
                Year: <b>{detail.labelResult.decodedManufactureYear}</b> | {detail.labelResult.serialDecodeExplanation}
              </div>
            </div>
          )}

          <QuestionSection questions={def?.q} answers={detail.answers || {}} onChange={setAnswer} />

          {/* Condition */}
          <div style={{ marginBottom: 13 }}>
            <label style={lbl}>OVERALL CONDITION</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["Excellent", "Good", "Fair", "Poor"].map(c => (
                <button key={c} onClick={() => setField("condition", c)}
                  style={{ flex: 1, padding: "8px 4px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: detail.condition === c ? (c === "Poor" ? RED : c === "Fair" ? AMB : c === "Excellent" ? GRN : "#64748b") : "#f1f5f9",
                    color: detail.condition === c ? "#fff" : "#374151", border: "none" }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 13 }}>
            <label style={lbl}>NOTES</label>
            <textarea style={{ ...inp, height: 60, resize: "none" }} value={detail.notes || ""} onChange={e => setField("notes", e.target.value)} placeholder="Additional notes..." />
          </div>

          <PhotoCapture itemId={item.id} photos={detail.photos || []} onPhotos={setPhotos} />

          {sc.score > 0 && (
            <div style={{ fontSize: 12, color: scoreColor, fontWeight: 600, marginTop: 6 }}>
              Risk score: {sc.score}/100 {sc.redFlag ? "-- RED FLAG" : ""} {sc.detail ? "| " + sc.detail : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddItemModal({ added, onAdd, onClose }) {
  const [search, setSearch] = useState("");
  const addedIds = added.map(a => a.id);
  const filtered = CATALOG.map(g => ({
    ...g,
    items: g.items.filter(i => !addedIds.includes(i.id) && (i.label.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase())))
  })).filter(g => g.items.length);

  function addAll() {
    CATALOG.flatMap(g => g.items).filter(i => !addedIds.includes(i.id)).forEach(i => onAdd(i));
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: CARD, borderRadius: 18, width: "100%", maxWidth: 520, maxHeight: "80vh", overflow: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>Add Inspection Items</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>x</button>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={addAll} style={{ ...btn(PRI), whiteSpace: "nowrap" }}>Add All</button>
        </div>
        {filtered.map(g => (
          <div key={g.group} style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{g.group}</div>
            {g.items.map(item => (
              <div key={item.id} onClick={() => { onAdd(item); onClose(); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, cursor: "pointer", marginBottom: 6, border: "1.5px solid #e2e8f0", background: "#f8fafc" }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{item.desc}</div>
                </div>
                <div style={{ marginLeft: "auto", color: PRI, fontWeight: 700, fontSize: 18 }}>+</div>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>No items found</div>}
      </div>
    </div>
  );
}

function RiskRing({ score }) {
  const r = 52, cx = 64, cy = 64, stroke = 10;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? RED : score >= 45 ? AMB : score >= 20 ? "#f59e0b" : GRN;
  const label = score >= 70 ? "High Risk" : score >= 45 ? "Elevated" : score >= 20 ? "Moderate" : "Low Risk";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>{score}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11" fill="#64748b">/100</text>
      </svg>
      <div style={{ fontWeight: 700, fontSize: 15, color, marginTop: -6 }}>{label}</div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("property"); // property | items | report
  const [form, setForm] = useState({ address: "", yearBuilt: "", propType: "Single Family", sqft: "", askingPrice: "", reno: "Unknown", notes: "" });
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  function addItem(def) {
    setItems(prev => [...prev, { id: def.id, label: def.label, icon: def.icon, desc: def.desc, detail: { photos: [], answers: {} } }]);
  }

  function updateItem(idx, updated) {
    setItems(prev => prev.map((it, i) => i === idx ? updated : it));
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  const { score, signals, totalCostLow, totalCostHigh, severeHits } = calcOverall(items, form);

  async function generateReport() {
    setGenerating(true);
    setTab("report");
    try {
      const yearBuilt = parseInt(form.yearBuilt);
      const propAge = yearBuilt ? new Date().getFullYear() - yearBuilt : null;
      const itemContext = signals?.map(s => {
        const it = items.find(i => i.id === s.system.toLowerCase().replace(/ /g,"_"));
        const d = it?.detail || {};
        const findings = (d.photos || []).filter(p => p.result?.findings?.length)
          .flatMap(p => p.result.findings.map(f => `${f.issue} (${f.severity})`)).join("; ");
        return [s.system, s.redFlag ? "RED FLAG" : "", s.detail, d.condition ? `Condition: ${d.condition}` : "", d.notes ? `Notes: ${d.notes}` : "", findings].filter(Boolean).join(" | ");
      }).join("\n");

      const prompt = `You are a senior home inspector. The scoring algorithm has calculated scores -- use them as authoritative.

PROPERTY: ${form.address || "unknown"}, Built ${form.yearBuilt}, ${form.propType}, ${form.sqft} sqft, Asking: ${form.askingPrice ? "$" + parseInt(form.askingPrice).toLocaleString() : "unknown"}
Renovations: ${form.reno} | Disclosures: ${form.notes || "none"}
Severe keywords found: ${severeHits?.join(", ") || "none"}

ALGORITHM OUTPUT:
- Overall risk score: ${score}/100
- Est repair costs: $${totalCostLow?.toLocaleString()} - $${totalCostHigh?.toLocaleString()}
- Red flag items: ${signals?.filter(s => s.redFlag).map(s => s.system).join(", ") || "none"}

ITEMS: ${itemContext || "No items added."}

Return ONLY valid JSON (no markdown):
{"overallRiskScore":${score},"riskTier":"${score >= 70 ? "High Risk" : score >= 45 ? "Elevated Risk" : score >= 20 ? "Moderate Risk" : "Low Risk"}","executiveSummary":"2-3 sentence summary","topFindings":[{"system":"","finding":"","severity":"Critical|High|Moderate|Low","estimatedCost":""}],"negotiationTips":[""],"preClosingChecklist":[""],"totalCostLow":${totalCostLow},"totalCostHigh":${totalCostHigh}}`;

      const raw = await ai("You are a licensed home inspection expert. Return only valid JSON.", prompt);
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { parsed = { executiveSummary: raw, overallRiskScore: score, riskTier: "See summary", topFindings: [], negotiationTips: [], preClosingChecklist: [] }; }
      setReport(parsed);
    } catch (e) {
      setReport({ executiveSummary: "Error generating report: " + e.message, overallRiskScore: score, topFindings: [], negotiationTips: [], preClosingChecklist: [] });
    }
    setGenerating(false);
  }

  const tabStyle = (t) => ({
    padding: "10px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none",
    background: tab === t ? PRI : "transparent", color: tab === t ? "#fff" : "#64748b",
  });

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "Inter, system-ui, sans-serif", fontStyle: "normal" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", padding: "0 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔍</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: "#fff", letterSpacing: "-0.02em" }}>ClearScope</span>
            <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>Home Intelligence</span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["property", "items", "report"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>

        {/* PROPERTY TAB */}
        {tab === "property" && (
          <div>
            <div style={{ background: CARD, borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a", marginBottom: 4 }}>Property Details</div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>Enter the basics about this property</div>

              <AddressAutocomplete value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>YEAR BUILT</label>
                  <input style={inp} value={form.yearBuilt} onChange={e => setForm(f => ({ ...f, yearBuilt: e.target.value }))} placeholder="e.g. 1985" />
                </div>
                <div>
                  <label style={lbl}>ASKING PRICE</label>
                  <input style={inp} value={form.askingPrice} onChange={e => setForm(f => ({ ...f, askingPrice: e.target.value }))} placeholder="$450,000" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>PROPERTY TYPE</label>
                  <select style={inp} value={form.propType} onChange={e => setForm(f => ({ ...f, propType: e.target.value }))}>
                    {["Single Family", "Condo", "Townhouse", "Multi-Family", "Manufactured"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>SQUARE FEET</label>
                  <input style={inp} value={form.sqft} onChange={e => setForm(f => ({ ...f, sqft: e.target.value }))} placeholder="e.g. 2,200" />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>KNOWN RENOVATIONS</label>
                <select style={inp} value={form.reno} onChange={e => setForm(f => ({ ...f, reno: e.target.value }))}>
                  {["Unknown", "None", "Kitchen Updated", "Bathrooms Updated", "Roof Replaced", "HVAC Replaced", "Full Renovation", "Multiple Updates"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>SELLER DISCLOSURES / KNOWN ISSUES</label>
                <textarea style={{ ...inp, height: 80, resize: "none" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Paste seller disclosures or note any known issues..." />
              </div>
            </div>

            {/* Score preview */}
            <div style={{ background: CARD, borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
              <RiskRing score={score} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 4 }}>Current Risk Score</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>{items.length} items | ${totalCostLow?.toLocaleString()} - ${totalCostHigh?.toLocaleString()} est. repairs</div>
                <button onClick={() => setTab("items")} style={btn(PRI)}>Add Inspection Items --&gt;</button>
              </div>
            </div>
          </div>
        )}

        {/* ITEMS TAB */}
        {tab === "items" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>Inspection Items</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{items.length} items | Score: {score}/100</div>
              </div>
              <button onClick={() => setShowAdd(true)} style={btn(PRI)}>+ Add Item</button>
            </div>

            {items.length === 0 && (
              <div style={{ background: CARD, borderRadius: 16, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a", marginBottom: 8 }}>No items yet</div>
                <div style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Add items to inspect -- roof, HVAC, electrical, plumbing, and more</div>
                <button onClick={() => setShowAdd(true)} style={btn(PRI)}>+ Add Inspection Items</button>
              </div>
            )}

            {items.map((item, idx) => (
              <ItemCard key={item.id + idx} item={item} onUpdate={u => updateItem(idx, u)} onRemove={() => removeItem(idx)} />
            ))}

            {items.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <button onClick={generateReport} style={{ ...btn("#16a34a"), width: "100%" }} disabled={generating}>
                  {generating ? "Generating..." : "Generate Report"}
                </button>
              </div>
            )}

            {showAdd && <AddItemModal added={items} onAdd={addItem} onClose={() => setShowAdd(false)} />}
          </div>
        )}

        {/* REPORT TAB */}
        {tab === "report" && (
          <div>
            {!report && !generating && (
              <div style={{ background: CARD, borderRadius: 16, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a", marginBottom: 8 }}>No report yet</div>
                <div style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Add inspection items and generate a report</div>
                <button onClick={() => setTab("items")} style={btn(PRI)}>Go to Items</button>
              </div>
            )}

            {generating && (
              <div style={{ background: CARD, borderRadius: 16, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>Generating your report...</div>
                <div style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>AI is analyzing all your inspection data</div>
              </div>
            )}

            {report && !generating && (
              <div>
                {/* Score card */}
                <div style={{ background: CARD, borderRadius: 16, padding: 24, marginBottom: 16, display: "flex", gap: 20, alignItems: "center" }}>
                  <RiskRing score={report.overallRiskScore} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", marginBottom: 4 }}>{report.riskTier}</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>{form.address || "Property"}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: AMB }}>
                      Est. Repair Costs: ${report.totalCostLow?.toLocaleString()} - ${report.totalCostHigh?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ background: CARD, borderRadius: 16, padding: 24, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 10 }}>Executive Summary</div>
                  <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{report.executiveSummary}</div>
                </div>

                {/* Top findings */}
                {report.topFindings?.length > 0 && (
                  <div style={{ background: CARD, borderRadius: 16, padding: 24, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 12 }}>Key Findings</div>
                    {report.topFindings.map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: i < report.topFindings.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.severity === "Critical" ? RED : f.severity === "High" ? AMB : GRN, marginTop: 6, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{f.system}: <span style={{ color: f.severity === "Critical" ? RED : f.severity === "High" ? AMB : GRN }}>{f.severity}</span></div>
                          <div style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>{f.finding}</div>
                          {f.estimatedCost && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>Est. cost: {f.estimatedCost}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Negotiation tips */}
                {report.negotiationTips?.length > 0 && (
                  <div style={{ background: CARD, borderRadius: 16, padding: 24, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 12 }}>💡 Negotiation Tips</div>
                    {report.negotiationTips.map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 14, color: "#374151" }}>
                        <span style={{ color: PRI, fontWeight: 700 }}>{i + 1}.</span> {tip}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pre-closing checklist */}
                {report.preClosingChecklist?.length > 0 && (
                  <div style={{ background: CARD, borderRadius: 16, padding: 24, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 12 }}>✅ Pre-Closing Checklist</div>
                    {report.preClosingChecklist.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 14, color: "#374151" }}>
                        <span>✅</span> {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* Disclaimer */}
                <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 14, padding: 18, marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: AMB, marginBottom: 6 }}>Important Disclaimer</div>
                  <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                    ClearScope is an AI-assisted analysis tool. It is <b>not a formal home inspection</b> and does not constitute professional real estate, engineering, or legal advice. Risk scores and cost estimates are generated by algorithm and AI, and may be inaccurate. Always obtain a full inspection from a licensed home inspector before finalizing any purchase.
                  </div>
                  <button onClick={() => setShowDisclaimer(true)} style={{ background: "none", border: "none", color: AMB, fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 6, padding: 0 }}>Read full disclaimer</button>
                </div>

                <button onClick={generateReport} style={{ ...btn("#475569"), width: "100%" }}>Regenerate Report</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full disclaimer modal */}
      {showDisclaimer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: CARD, borderRadius: 18, maxWidth: 560, width: "100%", maxHeight: "80vh", overflow: "auto", padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>Full Disclaimer</div>
              <button onClick={() => setShowDisclaimer(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#94a3b8" }}>x</button>
            </div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
              <p><b>1. No Professional Inspection Substitute.</b> ClearScope assessments, risk scores, and findings are based on AI analysis of user-provided data and photos. They are not a substitute for a physical inspection by a licensed home inspector, structural engineer, or other qualified professional.</p>
              <p><b>2. No Warranty or Guarantee.</b> ClearScope makes no representations or warranties of any kind regarding the accuracy, completeness, or reliability of any assessment, estimate, or finding. All outputs are provided "as is."</p>
              <p><b>3. Limitation of Liability.</b> ClearScope, its owners, developers, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of or reliance on any information provided -- including property purchase decisions, repair costs, or financial losses.</p>
              <p><b>4. AI Limitations.</b> AI systems can produce inaccurate or incomplete outputs. Photo analysis may fail to detect issues not visible in images, including hidden structural damage, concealed mold, or subsurface conditions.</p>
              <p><b>5. User Responsibility.</b> You are solely responsible for any decisions made based on ClearScope outputs. ClearScope strongly recommends obtaining a full licensed inspection before waiving any inspection contingency.</p>
              <p><b>6. Not Legal or Financial Advice.</b> Nothing in ClearScope constitutes legal, financial, or investment advice.</p>
            </div>
            <button onClick={() => setShowDisclaimer(false)} style={{ ...btn(PRI), width: "100%", marginTop: 12 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
