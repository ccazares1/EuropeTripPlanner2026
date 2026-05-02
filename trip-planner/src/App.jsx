import { useState, useEffect } from "react";

const STORAGE_KEY = "europe-trip-planner-v3";

const defaultTrip = {
  title: "European Family Adventure",
  dates: "Summer 2026",
  totalBudget: 8000,
  cities: [
    {
      id: "city-1", city: "Paris", country: "France", emoji: "🗼",
      arrivalTransport: { type: "flight", from: "New York (JFK)", to: "Paris (CDG)", carrier: "Air France", time: "7:00 PM → 8:30 AM+1", cost: 1200, notes: "Check in 3 hrs early" },
      hotel: { name: "Hôtel Le Marais", address: "35 Rue de Bretagne, Paris", cost: 180, stars: 4, notes: "Breakfast included" },
      days: [
        { id: "d1", date: "Jun 20", label: "Arrival Day", activities: [
          { id: "a1", name: "Eiffel Tower", time: "3:00 PM", cost: 28, notes: "Book skip-the-line tickets!", done: false },
          { id: "a2", name: "Seine River Cruise", time: "6:00 PM", cost: 16, notes: "Sunset cruise 1 hr", done: false },
        ]},
        { id: "d2", date: "Jun 21", label: "Art & Culture", activities: [
          { id: "a3", name: "Louvre Museum", time: "9:00 AM", cost: 22, notes: "Get there early! Kids free under 18", done: false },
          { id: "a4", name: "Montmartre Walk", time: "2:00 PM", cost: 0, notes: "Free! Don't miss Sacré-Cœur", done: false },
          { id: "a5", name: "Dinner at Café de Flore", time: "7:30 PM", cost: 80, notes: "Famous historic café", done: false },
        ]},
      ],
    },
    {
      id: "city-2", city: "Rome", country: "Italy", emoji: "🏛️",
      arrivalTransport: { type: "flight", from: "Paris (CDG)", to: "Rome (FCO)", carrier: "EasyJet", time: "10:00 AM → 12:15 PM", cost: 90, notes: "Budget 1 checked bag" },
      hotel: { name: "Hotel Trevi Fountain", address: "Via delle Muratte 9, Rome", cost: 220, stars: 4, notes: "Steps from Trevi Fountain!" },
      days: [
        { id: "d3", date: "Jun 22", label: "Arrival & Ancient Rome", activities: [
          { id: "a6", name: "Colosseum & Forum", time: "2:00 PM", cost: 24, notes: "Pre-book required!", done: false },
          { id: "a7", name: "Trevi Fountain", time: "8:00 PM", cost: 0, notes: "Beautiful at night. Bring coins!", done: false },
        ]},
        { id: "d4", date: "Jun 23", label: "Vatican & Gelato", activities: [
          { id: "a10", name: "Campo de' Fiori Market", time: "9:00 AM", cost: 0, notes: "Best morning market in Rome", done: false },
          { id: "a8", name: "Vatican Museums & Sistine Chapel", time: "11:00 AM", cost: 27, notes: "Book 2 months ahead!", done: false },
          { id: "a9", name: "Gelato Tour", time: "4:00 PM", cost: 15, notes: "Try 5 different gelaterias", done: false },
        ]},
      ],
    },
    {
      id: "city-3", city: "Barcelona", country: "Spain", emoji: "🌊",
      arrivalTransport: { type: "train", from: "Roma Termini", to: "Barcelona Sants", carrier: "Renfe AVE + TGV", time: "8:00 AM → 6:30 PM", cost: 120, notes: "Scenic coastal route! Book in advance" },
      hotel: { name: "Hotel Arts Barcelona", address: "Carrer de la Marina 19", cost: 260, stars: 5, notes: "Beachfront! Pool access" },
      days: [
        { id: "d5", date: "Jun 24", label: "Arrival & Gaudí", activities: [
          { id: "a11", name: "Sagrada Família", time: "4:00 PM", cost: 35, notes: "Gaudí's masterpiece!", done: false },
          { id: "a12", name: "La Barceloneta Beach", time: "7:00 PM", cost: 0, notes: "Sunset swim. Bring sunscreen!", done: false },
        ]},
      ],
    },
  ],
};

const TRANSPORT_TYPES = [
  { value: "flight", label: "✈️ Flight", icon: "✈️" },
  { value: "train",  label: "🚄 Train",  icon: "🚄" },
  { value: "bus",    label: "🚌 Bus",    icon: "🚌" },
  { value: "car",    label: "🚗 Car",    icon: "🚗" },
  { value: "ferry",  label: "⛴️ Ferry",  icon: "⛴️" },
];
const CARRIER_LABEL = { flight: "Airline", train: "Operator", bus: "Company", car: "Rental Co.", ferry: "Ferry Line" };
const CITY_COLORS = ["#e8c4f0","#f4a261","#f6d365","#7dd3fc","#86efac","#fca5a5","#c4b5fd","#fdba74"];

const P = {
  bg: "#0a0a0f", surface: "#12121a", card: "#1a1a26", border: "#2a2a3f",
  accent: "#f5c842", accentSoft: "rgba(245,200,66,0.12)",
  text: "#f0eee8", muted: "#7a7a8c", green: "#4ade80",
};

const fmt = (n) => `$${Number(n||0).toLocaleString()}`;
const getCityColor = (i) => CITY_COLORS[i % CITY_COLORS.length];
const tIcon = (type) => TRANSPORT_TYPES.find(t => t.value === type)?.icon ?? "🚀";

function hexRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "200,200,200";
}

// ── UI atoms ─────────────────────────────────────────────────────────────────

function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:P.card,border:`1px solid ${P.border}`,borderRadius:16,padding:28,maxWidth:520,width:"100%",maxHeight:"90vh",overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type="text", placeholder }) {
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{ color:P.muted,fontSize:10,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5 }}>{label}</div>
      <input type={type} value={value??""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%",background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",color:P.text,fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit" }} />
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{ color:P.muted,fontSize:10,textTransform:"uppercase",letterSpacing:1.2,marginBottom:5 }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width:"100%",background:P.surface,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",color:P.text,fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit",cursor:"pointer" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant="primary", style: sx }) {
  const v = {
    primary: { background:P.accent, color:"#000", border:"none" },
    ghost:   { background:"none", color:P.muted, border:`1px solid ${P.border}` },
  };
  return (
    <button onClick={onClick} style={{ padding:"9px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:600,...v[variant],...sx }}>
      {children}
    </button>
  );
}

function Stars({ n }) {
  return <span style={{ color:P.accent,fontSize:12 }}>{"★".repeat(n)}{"☆".repeat(5-n)}</span>;
}

// ── Activity row ─────────────────────────────────────────────────────────────

function ActivityRow({ a, cityId, dayId, onToggle, onEdit, onDelete }) {
  return (
    <div style={{ display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",background:a.done?"rgba(74,222,128,0.04)":P.surface,borderRadius:10,border:`1px solid ${a.done?"rgba(74,222,128,0.2)":P.border}`,marginBottom:7 }}>
      <button onClick={() => onToggle(cityId,dayId,a.id)} style={{ width:20,height:20,marginTop:2,borderRadius:5,border:`2px solid ${a.done?P.green:P.border}`,background:a.done?P.green:"transparent",cursor:"pointer",flexShrink:0,color:"#000",fontSize:11,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center" }}>
        {a.done ? "✓" : ""}
      </button>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8,alignItems:"center" }}>
          <span style={{ color:a.done?P.muted:P.text,fontSize:14,textDecoration:a.done?"line-through":"none" }}>{a.name}</span>
          {a.time && <span style={{ color:P.muted,fontSize:11 }}>⏰ {a.time}</span>}
          {a.cost > 0
            ? <span style={{ color:P.accent,fontSize:12,fontWeight:700 }}>{fmt(a.cost)}/person</span>
            : <span style={{ color:P.green,fontSize:11,fontWeight:700 }}>FREE</span>}
        </div>
        {a.notes && <div style={{ color:P.muted,fontSize:12,marginTop:3 }}>{a.notes}</div>}
      </div>
      <button onClick={() => onEdit(cityId,dayId,a)} style={{ background:"none",border:"none",color:P.muted,cursor:"pointer",fontSize:13,padding:"2px 4px" }}>✏️</button>
      <button onClick={() => onDelete(cityId,dayId,a.id)} style={{ background:"none",border:"none",color:P.muted,cursor:"pointer",fontSize:13,padding:"2px 4px" }}>🗑</button>
    </div>
  );
}

// ── Day accordion ─────────────────────────────────────────────────────────────

function DayCard({ day, cityId, color, handlers }) {
  const [open, setOpen] = useState(true);
  const done = day.activities.filter(a => a.done).length;
  const cost = day.activities.reduce((s,a) => s+(a.cost||0), 0);
  return (
    <div style={{ marginBottom:10,border:`1px solid ${P.border}`,borderRadius:12,overflow:"hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:P.surface,cursor:"pointer",userSelect:"none" }}>
        <span style={{ color,fontSize:12,display:"inline-block",transition:"transform 0.2s",transform:open?"rotate(90deg)":"rotate(0)" }}>▶</span>
        <div style={{ flex:1 }}>
          <span style={{ color:P.text,fontSize:15,fontWeight:600 }}>{day.date}</span>
          {day.label && <span style={{ color:P.muted,fontSize:13 }}> · {day.label}</span>}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {done > 0 && <span style={{ color:P.green,fontSize:12 }}>✓{done}/{day.activities.length}</span>}
          {cost > 0 && <span style={{ color:P.muted,fontSize:12 }}>{fmt(cost)}/p</span>}
          <button onClick={e => { e.stopPropagation(); handlers.editDay(day); }} style={{ background:"none",border:"none",color:P.muted,cursor:"pointer",fontSize:12,padding:"2px 4px" }}>✏️</button>
          <button onClick={e => { e.stopPropagation(); handlers.deleteDay(day.id); }} style={{ background:"none",border:"none",color:P.muted,cursor:"pointer",fontSize:12,padding:"2px 4px" }}>🗑</button>
        </div>
      </div>
      {open && (
        <div style={{ padding:"14px 16px",background:P.bg }}>
          {day.activities.length === 0 && <div style={{ color:P.muted,fontSize:13,textAlign:"center",marginBottom:12 }}>No activities yet</div>}
          {day.activities.map(a => (
            <ActivityRow key={a.id} a={a} cityId={cityId} dayId={day.id}
              onToggle={handlers.toggleActivity} onEdit={handlers.editActivity} onDelete={handlers.deleteActivity} />
          ))}
          <button onClick={() => handlers.addActivity(cityId, day.id)} style={{ width:"100%",padding:10,background:P.accentSoft,border:`1px dashed ${P.accent}`,borderRadius:9,color:P.accent,cursor:"pointer",fontSize:13,fontFamily:"inherit" }}>
            + Add Activity
          </button>
        </div>
      )}
    </div>
  );
}

// ── Transport chip ────────────────────────────────────────────────────────────

function TransportChip({ transport, color, onEdit }) {
  if (!transport) {
    return (
      <button onClick={onEdit} style={{ padding:"7px 16px",background:"none",border:`1px dashed ${P.border}`,borderRadius:20,color:P.muted,cursor:"pointer",fontSize:12,fontFamily:"inherit" }}>
        + Add arrival transport
      </button>
    );
  }
  const rgb = hexRgb(color);
  return (
    <div style={{ display:"inline-flex",alignItems:"center",gap:10,padding:"9px 18px",background:`rgba(${rgb},0.08)`,border:`1px solid rgba(${rgb},0.28)`,borderRadius:24,flexWrap:"wrap" }}>
      <span style={{ fontSize:16 }}>{tIcon(transport.type)}</span>
      <div>
        <span style={{ color:P.text,fontSize:13 }}>{transport.from}</span>
        <span style={{ color:P.muted,fontSize:13 }}> → </span>
        <span style={{ color:P.text,fontSize:13 }}>{transport.to}</span>
        {transport.carrier && <span style={{ color:P.muted,fontSize:12,marginLeft:8 }}>{transport.carrier}</span>}
      </div>
      {transport.time && <span style={{ color:P.muted,fontSize:12 }}>{transport.time}</span>}
      <span style={{ color,fontSize:13,fontWeight:700 }}>{fmt(transport.cost)}</span>
      {transport.notes && <span style={{ color:P.muted,fontSize:11 }}>· {transport.notes}</span>}
      <button onClick={onEdit} style={{ background:"none",border:"none",color:P.muted,cursor:"pointer",fontSize:12,padding:"0 2px" }}>✏️</button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function TripPlanner() {
  const [trip, setTrip] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [cityIdx, setCityIdx] = useState(0);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [importError, setImportError] = useState(null);

  // ── Load from storage ──
  // ── Load trip & subscribe to live updates via SSE ──
  useEffect(() => {
    // Load initial state from server
    fetch("/api/trip")
      .then(r => r.json())
      .then(data => { setTrip(data && data.cities ? data : defaultTrip); })
      .catch(() => setTrip(defaultTrip))
      .finally(() => setLoaded(true));

    // Subscribe to live updates (Server-Sent Events)
    const es = new EventSource("/api/trip/stream");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data && data.cities) setTrip(data);
      } catch {}
    };
    return () => es.close();
  }, []);

  // ── Persist to server ──
  const persist = async (newTrip) => {
    setSaveStatus("saving");
    try {
      await fetch("/api/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrip),
      });
      setSaveStatus("shared");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  // ── Core updater: compute next state, then persist it ──
  const upd = (fn) => {
    setTrip(prev => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  };

  // ── Export ──
  const exportTrip = () => {
    const json = JSON.stringify(trip, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family-trip.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import ──
  const importTrip = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.cities || !Array.isArray(parsed.cities)) throw new Error("Invalid format");
        setTrip(parsed);
        persist(parsed);
        setCityIdx(0);
      } catch {
        setImportError("Invalid file — please use an exported trip JSON.");
        setTimeout(() => setImportError(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Activity handlers ──
  const toggleActivity = (cityId, dayId, actId) =>
    upd(t => ({ ...t, cities: t.cities.map(c => c.id!==cityId ? c : { ...c, days: c.days.map(d => d.id!==dayId ? d : { ...d, activities: d.activities.map(a => a.id!==actId ? a : { ...a, done: !a.done }) }) }) }));

  const deleteActivity = (cityId, dayId, actId) =>
    upd(t => ({ ...t, cities: t.cities.map(c => c.id!==cityId ? c : { ...c, days: c.days.map(d => d.id!==dayId ? d : { ...d, activities: d.activities.filter(a => a.id!==actId) }) }) }));

  const addActivity = (cityId, dayId) => {
    setForm({ name:"", time:"", cost:0, notes:"", _cityId:cityId, _dayId:dayId });
    setModal({ t:"act", mode:"add" });
  };

  const editActivity = (cityId, dayId, a) => {
    setForm({ ...a, _cityId:cityId, _dayId:dayId });
    setModal({ t:"act", mode:"edit" });
  };

  const saveActivity = () => {
    const f = { ...form };
    const m = modal?.mode;
    if (!f.name) return;
    const { _cityId: cityId, _dayId: dayId, ...a } = f;
    upd(t => ({ ...t, cities: t.cities.map(c => c.id!==cityId ? c : { ...c, days: c.days.map(d => d.id!==dayId ? d : { ...d, activities: m==="add"
      ? [...d.activities, { ...a, id:"a"+Date.now(), done:false, cost:Number(a.cost)||0 }]
      : d.activities.map(x => x.id===a.id ? { ...a, cost:Number(a.cost)||0 } : x)
    }) }) }));
    setModal(null);
  };

  // ── Day handlers ──
  const addDay = (cityId) => {
    setForm({ _cityId:cityId, date:"", label:"" });
    setModal({ t:"day", mode:"add" });
  };

  const editDay = (cityId, day) => {
    setForm({ ...day, _cityId:cityId });
    setModal({ t:"day", mode:"edit" });
  };

  const saveDay = () => {
    const f = { ...form };
    const m = modal?.mode;
    const { _cityId: cityId, ...day } = f;
    upd(t => ({ ...t, cities: t.cities.map(c => c.id!==cityId ? c : { ...c, days: m==="add"
      ? [...c.days, { ...day, id:"d"+Date.now(), activities:[] }]
      : c.days.map(d => d.id===day.id ? { ...d, ...day } : d)
    }) }));
    setModal(null);
  };

  const deleteDay = (cityId, dayId) =>
    upd(t => ({ ...t, cities: t.cities.map(c => c.id!==cityId ? c : { ...c, days: c.days.filter(d => d.id!==dayId) }) }));

  // ── City handlers ──
  const addCity = () => {
    setForm({ city:"", country:"", emoji:"📍" });
    setModal({ t:"city", mode:"add" });
  };

  const editCity = (c) => {
    setForm({ ...c });
    setModal({ t:"city", mode:"edit" });
  };

  const saveCity = () => {
    const f = { ...form };
    const m = modal?.mode;
    if (!f.city) return;
    upd(t => {
      if (m === "add") {
        const newCity = { ...f, id:"city-"+Date.now(), days:[], hotel:null, arrivalTransport:null };
        setCityIdx(t.cities.length);
        return { ...t, cities: [...t.cities, newCity] };
      }
      return { ...t, cities: t.cities.map(c => c.id===f.id ? { ...c, ...f } : c) };
    });
    setModal(null);
  };

  const deleteCity = (cityId) => {
    upd(t => ({ ...t, cities: t.cities.filter(c => c.id!==cityId) }));
    setCityIdx(0);
  };

  // ── Hotel handlers ──
  const editHotel = (c) => {
    setForm({ ...(c.hotel || { name:"", address:"", cost:0, stars:3, notes:"" }), _cityId:c.id });
    setModal({ t:"hotel" });
  };

  const saveHotel = () => {
    const f = { ...form };
    const { _cityId: cityId, ...hotel } = f;
    upd(t => ({ ...t, cities: t.cities.map(c => c.id!==cityId ? c : { ...c, hotel: { ...hotel, cost:Number(hotel.cost)||0, stars:Number(hotel.stars)||3 } }) }));
    setModal(null);
  };

  // ── Transport handlers ──
  const editTransport = (c) => {
    setForm({ ...(c.arrivalTransport || { type:"flight", from:"", to:"", carrier:"", time:"", cost:0, notes:"" }), _cityId:c.id });
    setModal({ t:"transport" });
  };

  const saveTransport = () => {
    const f = { ...form };
    const { _cityId: cityId, ...transport } = f;
    upd(t => ({ ...t, cities: t.cities.map(c => c.id!==cityId ? c : { ...c, arrivalTransport: { ...transport, cost:Number(transport.cost)||0 } }) }));
    setModal(null);
  };

  // ── Render ──
  if (!loaded || !trip) {
    return (
      <div style={{ background:P.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ color:P.accent, fontSize:18 }}>Loading your trip...</span>
      </div>
    );
  }

  const city = trip.cities[cityIdx] ?? trip.cities[0];
  const color = getCityColor(cityIdx);

  const totalTransport = trip.cities.reduce((s,c) => s+(c.arrivalTransport?.cost||0), 0);
  const totalHotels    = trip.cities.reduce((s,c) => s+(c.hotel?.cost||0)*(c.days.length||1), 0);
  const totalActs      = trip.cities.reduce((s,c) => s+c.days.reduce((ds,d) => ds+d.activities.reduce((as,a) => as+(a.cost||0),0),0), 0);
  const totalSpent     = totalTransport + totalHotels + totalActs;
  const remaining      = trip.totalBudget - totalSpent;
  const pct            = Math.min(100, Math.round(totalSpent/trip.totalBudget*100));

  const nights    = city?.days.length ?? 0;
  const cityActs  = city?.days.reduce((s,d) => s+d.activities.reduce((as,a) => as+(a.cost||0),0),0) ?? 0;
  const cityDone  = city?.days.reduce((s,d) => s+d.activities.filter(a=>a.done).length,0) ?? 0;
  const cityTotal = city?.days.reduce((s,d) => s+d.activities.length,0) ?? 0;

  const handlers = {
    toggleActivity, editActivity, deleteActivity, addActivity,
    editDay: (d) => editDay(city.id, d),
    deleteDay: (id) => deleteDay(city.id, id),
  };

  const statusColor = { idle:P.muted, saving:P.accent, saved:P.green, shared:P.green, error:"#f87171" }[saveStatus];
  const statusBg    = { idle:"transparent", saving:P.accentSoft, saved:"rgba(74,222,128,0.12)", shared:"rgba(74,222,128,0.12)", error:"rgba(248,113,113,0.12)" }[saveStatus];
  const statusText  = { idle:"💾 Saved", saving:"Saving…", saved:"✓ Saved locally", shared:"✓ Synced — family can see updates", error:"Save failed!" }[saveStatus];

  return (
    <div style={{ background:P.bg, minHeight:"100vh", fontFamily:"Georgia,'Times New Roman',serif", color:P.text }}>

      {/* ── Header ── */}
      <div style={{ padding:"22px 20px 16px", borderBottom:`1px solid ${P.border}`, background:`linear-gradient(180deg,${P.surface} 0%,${P.bg} 100%)` }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontSize:10, color:P.accent, letterSpacing:3, textTransform:"uppercase", marginBottom:4 }}>Family Trip Planner</div>
              <h1 style={{ margin:0, fontSize:24, fontWeight:400 }}>{trip.title}</h1>
              <div style={{ color:P.muted, fontSize:13, marginTop:3 }}>
                📅 {trip.dates} · {trip.cities.length} cities · {trip.cities.reduce((s,c)=>s+c.days.length,0)} days
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
              <div style={{ padding:"6px 14px", background:statusBg, border:`1px solid ${statusColor}`, borderRadius:20, fontSize:12, color:statusColor, transition:"all 0.3s" }}>
                {statusText}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={exportTrip} style={{ padding:"6px 12px", background:P.accentSoft, border:`1px solid ${P.accent}`, borderRadius:8, color:P.accent, cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:600 }}>
                  ⬆ Export & Share
                </button>
                <label style={{ padding:"6px 12px", background:P.surface, border:`1px solid ${P.border}`, borderRadius:8, color:P.muted, cursor:"pointer", fontSize:11, fontFamily:"inherit", fontWeight:600 }}>
                  ⬇ Import
                  <input type="file" accept=".json" onChange={importTrip} style={{ display:"none" }} />
                </label>
              </div>
            </div>
          </div>

          {importError && (
            <div style={{ marginTop:10, padding:"8px 14px", background:"rgba(248,113,113,0.12)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:8, color:"#f87171", fontSize:13 }}>
              ⚠ {importError}
            </div>
          )}

          {/* Sharing tip */}
          <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(125,211,252,0.07)", border:"1px solid rgba(125,211,252,0.2)", borderRadius:10, fontSize:12, color:"#7dd3fc" }}>
            💡 <strong>Live sharing:</strong> make edits on desktop — family members on mobile just refresh to see updates. Or use <em>Export & Share</em> to send a file directly.
          </div>

          {/* Budget */}
          <div style={{ marginTop:14, padding:"14px 16px", background:P.card, borderRadius:12, border:`1px solid ${P.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:8 }}>
              <div style={{ fontSize:11, color:P.muted, textTransform:"uppercase", letterSpacing:1 }}>Budget Overview</div>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                {[["🚄 Transport",totalTransport,"#7dd3fc"],["🏨 Hotels",totalHotels,"#f4a261"],["🎭 Activities",totalActs,"#f6d365"]].map(([l,v,c]) => (
                  <span key={l} style={{ fontSize:12, color:c }}>{l}: <strong>{fmt(v)}</strong></span>
                ))}
              </div>
            </div>
            <div style={{ height:5, background:P.border, borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${P.green},${pct>85?"#f97316":P.accent})`, borderRadius:3, transition:"width 0.5s" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, fontSize:12 }}>
              <span style={{ color:P.muted }}>{fmt(totalSpent)} of {fmt(trip.totalBudget)}</span>
              <span style={{ color:remaining>=0?P.green:"#f97316", fontWeight:700 }}>{remaining>=0?`${fmt(remaining)} left`:`${fmt(Math.abs(remaining))} over!`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── City tabs ── */}
      <div style={{ borderBottom:`1px solid ${P.border}`, background:P.surface, overflowX:"auto" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", padding:"0 20px", minWidth:"max-content" }}>
          {trip.cities.map((c,i) => {
            const col = getCityColor(i);
            const active = i === cityIdx;
            return (
              <button key={c.id} onClick={() => setCityIdx(i)} style={{ padding:"12px 20px", background:"none", border:"none", borderBottom:active?`2px solid ${col}`:"2px solid transparent", cursor:"pointer", color:active?col:P.muted, fontFamily:"inherit", fontSize:13, transition:"all 0.2s", whiteSpace:"nowrap", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:1 }}>
                <span><strong>{c.emoji} {c.city}</strong></span>
                <span style={{ fontSize:11, opacity:0.75 }}>{c.days.length} day{c.days.length!==1?"s":""} · {c.country}</span>
              </button>
            );
          })}
          <button onClick={addCity} style={{ padding:"12px 16px", background:"none", border:"none", borderBottom:"2px solid transparent", cursor:"pointer", color:P.muted, fontFamily:"inherit", fontSize:13 }}>+ City</button>
        </div>
      </div>

      {/* ── City panel ── */}
      {city && (
        <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px" }}>

          {/* City title */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:38 }}>{city.emoji}</span>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <h2 style={{ margin:0, fontSize:22, fontWeight:400, color }}>{city.city}, {city.country}</h2>
                  <button onClick={() => editCity(city)} style={{ background:"none", border:"none", color:P.muted, cursor:"pointer", fontSize:13 }}>✏️</button>
                  <button onClick={() => deleteCity(city.id)} style={{ background:"none", border:"none", color:P.muted, cursor:"pointer", fontSize:13 }}>🗑</button>
                </div>
                <div style={{ color:P.muted, fontSize:13, marginTop:3 }}>
                  {nights} night{nights!==1?"s":""} · {cityTotal} activities · est. {fmt(cityActs+(city.hotel?.cost||0)*nights)}/person
                  {cityDone > 0 && <span style={{ color:P.green, marginLeft:10 }}>✓ {cityDone}/{cityTotal}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Arrival transport */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:10, color:P.muted, textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Arriving via</div>
            <TransportChip transport={city.arrivalTransport} color={color} onEdit={() => editTransport(city)} />
          </div>

          {/* Hotel */}
          <div style={{ marginBottom:22, padding:"14px 18px", background:P.card, borderRadius:12, border:`1px solid ${P.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            {city.hotel ? (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{ fontSize:22 }}>🏨</span>
                  <div>
                    <div style={{ color:P.text, fontSize:14, fontWeight:600 }}>{city.hotel.name}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:2 }}>
                      <Stars n={city.hotel.stars} />
                      <span style={{ color:P.muted, fontSize:12 }}>{city.hotel.address}</span>
                    </div>
                    {city.hotel.notes && <div style={{ color:P.muted, fontSize:12, marginTop:2 }}>{city.hotel.notes}</div>}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ color:P.accent, fontSize:16, fontWeight:700 }}>{fmt(city.hotel.cost)}<span style={{ color:P.muted, fontSize:11, fontWeight:400 }}>/night</span></div>
                    <div style={{ color:P.muted, fontSize:11 }}>{fmt(city.hotel.cost*nights)} total ({nights}n)</div>
                  </div>
                  <button onClick={() => editHotel(city)} style={{ background:"none", border:"none", color:P.muted, cursor:"pointer", fontSize:14 }}>✏️</button>
                </div>
              </>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ color:P.muted, fontSize:13 }}>No hotel added</span>
                <Btn onClick={() => editHotel(city)} variant="ghost" style={{ fontSize:12, padding:"6px 14px" }}>+ Add Hotel</Btn>
              </div>
            )}
          </div>

          {/* Days */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:11, color:P.muted, textTransform:"uppercase", letterSpacing:1.2 }}>Daily Itinerary</div>
            <Btn onClick={() => addDay(city.id)} variant="ghost" style={{ fontSize:12, padding:"6px 14px" }}>+ Add Day</Btn>
          </div>
          {city.days.length === 0 && <div style={{ textAlign:"center", color:P.muted, padding:"30px 0", fontSize:13 }}>No days yet. Add your first day!</div>}
          {city.days.map(day => (
            <DayCard key={day.id} day={day} cityId={city.id} color={color} handlers={handlers} />
          ))}
        </div>
      )}

      {/* ── Modals ── */}

      {modal?.t === "act" && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ margin:"0 0 20px", fontWeight:400, fontSize:18 }}>{modal.mode==="add" ? "Add Activity" : "Edit Activity"}</h3>
          <Field label="Name" value={form.name} onChange={v => setForm(p=>({...p,name:v}))} placeholder="e.g. Eiffel Tower" />
          <Field label="Time" value={form.time} onChange={v => setForm(p=>({...p,time:v}))} placeholder="e.g. 2:00 PM" />
          <Field label="Cost per person ($)" type="number" value={form.cost} onChange={v => setForm(p=>({...p,cost:v}))} placeholder="0" />
          <Field label="Notes" value={form.notes} onChange={v => setForm(p=>({...p,notes:v}))} placeholder="Tips, reminders…" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={saveActivity} style={{ flex:1 }}>Save</Btn>
            <Btn onClick={() => setModal(null)} variant="ghost" style={{ flex:1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {modal?.t === "day" && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ margin:"0 0 20px", fontWeight:400, fontSize:18 }}>{modal.mode==="add" ? "Add Day" : "Edit Day"}</h3>
          <Field label="Date" value={form.date} onChange={v => setForm(p=>({...p,date:v}))} placeholder="e.g. Jun 25" />
          <Field label="Day Label" value={form.label} onChange={v => setForm(p=>({...p,label:v}))} placeholder="e.g. Museum Day" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={saveDay} style={{ flex:1 }}>Save</Btn>
            <Btn onClick={() => setModal(null)} variant="ghost" style={{ flex:1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {modal?.t === "city" && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ margin:"0 0 20px", fontWeight:400, fontSize:18 }}>{modal.mode==="add" ? "Add City" : "Edit City"}</h3>
          <Field label="City" value={form.city} onChange={v => setForm(p=>({...p,city:v}))} placeholder="e.g. Amsterdam" />
          <Field label="Country" value={form.country} onChange={v => setForm(p=>({...p,country:v}))} placeholder="e.g. Netherlands" />
          <Field label="Emoji" value={form.emoji} onChange={v => setForm(p=>({...p,emoji:v}))} placeholder="🌷" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={saveCity} style={{ flex:1 }}>Save</Btn>
            <Btn onClick={() => setModal(null)} variant="ghost" style={{ flex:1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {modal?.t === "hotel" && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ margin:"0 0 20px", fontWeight:400, fontSize:18 }}>🏨 Hotel Details</h3>
          <Field label="Hotel Name" value={form.name} onChange={v => setForm(p=>({...p,name:v}))} placeholder="e.g. Hôtel Le Marais" />
          <Field label="Address" value={form.address} onChange={v => setForm(p=>({...p,address:v}))} />
          <Field label="Cost per night ($)" type="number" value={form.cost} onChange={v => setForm(p=>({...p,cost:v}))} />
          <Field label="Stars (1–5)" type="number" value={form.stars} onChange={v => setForm(p=>({...p,stars:Math.min(5,Math.max(1,v))}))} />
          <Field label="Notes" value={form.notes} onChange={v => setForm(p=>({...p,notes:v}))} placeholder="Breakfast included? Pool?" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={saveHotel} style={{ flex:1 }}>Save</Btn>
            <Btn onClick={() => setModal(null)} variant="ghost" style={{ flex:1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {modal?.t === "transport" && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ margin:"0 0 20px", fontWeight:400, fontSize:18 }}>Arrival Transport</h3>
          <Sel label="Type" value={form.type||"flight"} onChange={v => setForm(p=>({...p,type:v}))} options={TRANSPORT_TYPES} />
          <Field label="From" value={form.from} onChange={v => setForm(p=>({...p,from:v}))} placeholder="e.g. Paris Gare de Lyon" />
          <Field label="To" value={form.to} onChange={v => setForm(p=>({...p,to:v}))} placeholder="e.g. Barcelona Sants" />
          <Field label={CARRIER_LABEL[form.type]||"Carrier"} value={form.carrier} onChange={v => setForm(p=>({...p,carrier:v}))} placeholder="e.g. Renfe / Air France" />
          <Field label="Departure → Arrival time" value={form.time} onChange={v => setForm(p=>({...p,time:v}))} placeholder="e.g. 10:00 AM → 3:30 PM" />
          <Field label="Total Cost ($)" type="number" value={form.cost} onChange={v => setForm(p=>({...p,cost:v}))} />
          <Field label="Notes" value={form.notes} onChange={v => setForm(p=>({...p,notes:v}))} placeholder="Booking ref, seat class, tips…" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn onClick={saveTransport} style={{ flex:1 }}>Save</Btn>
            <Btn onClick={() => setModal(null)} variant="ghost" style={{ flex:1 }}>Cancel</Btn>
          </div>
        </Modal>
      )}

      <div style={{ height:48 }} />
    </div>
  );
}
