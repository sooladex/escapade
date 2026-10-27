import React, { useState, useEffect, useRef } from "react";
import {
  MapPin, Wallet, Navigation, Utensils, Camera, Music2, Clock,
  ArrowLeft, Sparkles, Star, ExternalLink, Map, Users,
  Minus, Plus, Bookmark, BookmarkCheck, Share2, RefreshCw,
  Footprints, Car, Bus, Route, Trash2, Lightbulb, CalendarClock,
} from "lucide-react";

const CURRENCIES = ["MAD", "EUR", "USD"];
const VIBES = [
  { id: "Détente", emoji: "🌿" }, { id: "Aventure", emoji: "🧭" },
  { id: "Culture", emoji: "🏛️" }, { id: "Food", emoji: "🍽️" },
  { id: "Fête", emoji: "🎉" }, { id: "Nature", emoji: "⛰️" },
];
const DURATIONS = ["Une sortie (½ j)", "Une journée", "Un week-end", "3–5 jours", "Une semaine"];
const TRANSPORTS = [
  { id: "À pied", icon: Footprints }, { id: "Voiture", icon: Car }, { id: "Transports", icon: Bus },
];
const ICONS = { lieu: Camera, activite: Navigation, manger: Utensils, trajet: Route };
const PRICE_MAP = {
  PRICE_LEVEL_FREE: "Gratuit", PRICE_LEVEL_INEXPENSIVE: "€", PRICE_LEVEL_MODERATE: "€€",
  PRICE_LEVEL_EXPENSIVE: "€€€", PRICE_LEVEL_VERY_EXPENSIVE: "€€€€",
};
const STORE_KEY = "escapade_saved_v1";
const loadSaved = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch { return []; } };
const persist = (list) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch {} };

function Globe({ size = 96 }) {
  const meridians = [0, 30, 60, 90, 120, 150];
  const parallels = [-40, -20, 0, 20, 40];
  return (
    <div className="globe-scene" style={{ width: size, height: size }}>
      <div className="globe-glow" />
      <div className="globe" style={{ width: size, height: size }}>
        {meridians.map((deg) => (
          <div key={"m" + deg} className="meridian" style={{ transform: `rotateY(${deg}deg)`, borderRadius: "50%", width: size, height: size, borderLeftColor: "transparent", borderRightColor: "transparent" }} />
        ))}
        {parallels.map((deg, i) => {
          const scale = Math.cos((deg * Math.PI) / 180);
          return (
            <div key={"p" + i} style={{ position: "absolute", left: "50%", top: "50%", width: size * scale, height: size * scale, transform: `translate(-50%,-50%) translateZ(${Math.sin((deg * Math.PI) / 180) * (size / 2)}px)`, border: "1px solid rgba(230,255,255,0.16)", borderRadius: "50%" }} />
          );
        })}
      </div>
    </div>
  );
}

function Tilt({ children, style, className }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-3px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <div ref={ref} className={className} style={{ ...style, transformStyle: "preserve-3d", transition: "transform 0.2s cubic-bezier(0.2,0.8,0.2,1)" }} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </div>
  );
}

function OceanBackground() {
  const stars = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 46; i++) {
      const size = Math.random() * 2.2 + 0.6;
      arr.push({ left: Math.random() * 100, top: Math.random() * 100, size, delay: (Math.random() * 5).toFixed(2), dur: (Math.random() * 3 + 2.5).toFixed(2) });
    }
    return arr;
  }, []);
  return (
    <>
      <div className="bg-layer">
        <div className="aurora a1" /><div className="aurora a2" />
        <div className="aurora a3" /><div className="aurora a4" />
        {stars.map((st, i) => (
          <span key={i} className="star" style={{ left: st.left + "%", top: st.top + "%", width: st.size, height: st.size, animationDelay: st.delay + "s", animationDuration: st.dur + "s", boxShadow: `0 0 ${st.size * 2}px rgba(207,246,255,0.8)` }} />
        ))}
      </div>
      <div className="vignette" />
    </>
  );
}

export default function App() {
  const [screen, setScreen] = useState("form");
  const [dest, setDest] = useState("");
  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("");
  const [budget, setBudget] = useState(800);
  const [currency, setCurrency] = useState("MAD");
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [vibes, setVibes] = useState(["Food", "Culture"]);
  const [travelers, setTravelers] = useState(2);
  const [transport, setTransport] = useState("À pied");
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("plan");
  const [saved, setSaved] = useState([]);
  const [savedFlag, setSavedFlag] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { setSaved(loadSaved()); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t); }, [toast]);

  const toggleVibe = (id) => setVibes((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const detectLocation = () => {
    if (!navigator.geolocation) { setGeoStatus("Géolocalisation indisponible."); return; }
    setGeoStatus("Localisation…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setDest(`Autour de moi (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`);
        setGeoStatus("Position détectée ✓");
      },
      () => setGeoStatus("Accès refusé. Tape ta ville."),
      { timeout: 8000 }
    );
  };

  const buildParams = () => ({ destination: dest, budget, currency, duration, vibes, travelers, transport });

  const generate = async () => {
    if (!dest.trim()) { setError("Indique une destination ou active ta localisation."); return; }
    setError(""); setSavedFlag(false); setScreen("loading");
    try {
      const res = await fetch("/api/plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(buildParams()) });
      const data = await res.json();
      if (!res.ok || !data.plan) throw new Error(data.message || "fail");
      const p = { ...data.plan, _meta: buildParams(), _id: Date.now() };
      setPlan(p); setTab("plan"); setScreen("plan");
      enrichPlaces(p, dest, coords).then((enriched) => { if (enriched) setPlan({ ...enriched }); });
    } catch (e) { setError("La génération a échoué. Réessaie dans un instant."); setScreen("form"); }
  };

  const savePlan = () => {
    if (!plan) return;
    const exists = saved.some((x) => x._id === plan._id);
    let next;
    if (exists) { next = saved.filter((x) => x._id !== plan._id); setSavedFlag(false); setToast("Retiré des favoris"); }
    else { next = [{ ...plan }, ...saved].slice(0, 30); setSavedFlag(true); setToast("Plan enregistré ✓"); }
    setSaved(next); persist(next);
  };
  const openSaved = (p) => { setPlan(p); setTab("plan"); setSavedFlag(true); setScreen("plan"); };
  const deleteSaved = (id) => { const next = saved.filter((x) => x._id !== id); setSaved(next); persist(next); };

  const sharePlan = async () => {
    if (!plan) return;
    const lines = [`✨ ${plan.titre}`, plan.resume, "", ...plan.items.map((it, i) => `${i + 1}. ${it.nom}${it.cout ? " — " + it.cout : ""}`), "", `Budget: ${plan.budget_estime}`, "", "Créé avec Escapade"].join("\n");
    try { if (navigator.share) await navigator.share({ title: plan.titre, text: lines }); else { await navigator.clipboard.writeText(lines); setToast("Copié ✓"); } } catch {}
  };

  return (
    <div style={s.app}>
      <OceanBackground />
      <div style={s.phone}>
        {screen === "form" && <FormScreen {...{ dest, setDest, setCoords, geoStatus, detectLocation, budget, setBudget, currency, setCurrency, duration, setDuration, vibes, toggleVibe, travelers, setTravelers, transport, setTransport, error, generate, saved, openSaved, deleteSaved }} />}
        {screen === "loading" && <LoadingScreen dest={dest} />}
        {screen === "plan" && plan && <PlanScreen {...{ plan, tab, setTab, back: () => setScreen("form"), savePlan, savedFlag, sharePlan, refresh: generate }} />}
      </div>
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}

async function enrichPlaces(plan, dest, coords) {
  const near = coords ? `${coords.lat},${coords.lng}` : dest.replace(/\(.*\)/, "").trim();
  const items = plan.items || [];
  try {
    const results = await Promise.all(items.map(async (it) => {
      if (it.type === "trajet") return it;
      try {
        const q = it.recherche_maps || `${it.nom} ${it.quartier || ""}`;
        const r = await fetch("/api/places", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query: q, near }) });
        const d = await r.json();
        if (d.enabled && d.found) return { ...it, real: d.place };
        return it;
      } catch { return it; }
    }));
    return { ...plan, items: results };
  } catch { return null; }
}

function Stepper({ value, set, min = 1, max = 12 }) {
  return (
    <div style={s.stepper}>
      <button style={s.stepBtn} onClick={() => set(Math.max(min, value - 1))}><Minus size={16} /></button>
      <span style={s.stepVal}>{value}</span>
      <button style={s.stepBtn} onClick={() => set(Math.min(max, value + 1))}><Plus size={16} /></button>
    </div>
  );
}

function FormScreen(props) {
  const { dest, setDest, setCoords, geoStatus, detectLocation, budget, setBudget, currency, setCurrency, duration, setDuration, vibes, toggleVibe, travelers, setTravelers, transport, setTransport, error, generate, saved, openSaved, deleteSaved } = props;
  return (
    <div style={s.scroll} className="fade-up">
      <div style={s.hero}>
        <div style={{ animation: "floaty 5s ease-in-out infinite" }}><Globe size={92} /></div>
        <span className="serif" style={s.brand}>Escapade</span>
        <p className="serif" style={s.tagline}>Dis-moi où et combien.<br />Je compose la sortie idéale.</p>
      </div>

      <label style={s.label}>Destination</label>
      <div style={s.inputWrap} className="glass">
        <MapPin size={18} color="var(--cyan)" />
        <input style={s.input} placeholder="Ville, région… ou ta position" value={dest} onChange={(e) => { setDest(e.target.value); setCoords(null); }} />
      </div>
      <button style={s.geoBtn} onClick={detectLocation}><Navigation size={15} color="var(--cyan)" /> Utiliser ma localisation</button>
      {geoStatus && <span style={s.geoStatus}>{geoStatus}</span>}

      <label style={s.label}>Budget</label>
      <div style={s.budgetRow}>
        <div style={s.budgetVal}><Wallet size={18} color="var(--cyan)" /><span style={s.budgetNum}>{budget.toLocaleString()}</span></div>
        <div style={s.currencyRow}>{CURRENCIES.map((c) => (<button key={c} onClick={() => setCurrency(c)} style={{ ...s.chip, ...(currency === c ? s.chipOn : {}) }}>{c}</button>))}</div>
      </div>
      <input type="range" min={100} max={20000} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))} style={{ width: "100%" }} />

      <label style={s.label}><Users size={13} style={{ verticalAlign: "-2px" }} /> Personnes</label>
      <Stepper value={travelers} set={setTravelers} />

      <label style={s.label}>Déplacement</label>
      <div style={s.wrapRow}>{TRANSPORTS.map((t) => { const Ic = t.icon; return (<button key={t.id} onClick={() => setTransport(t.id)} style={{ ...s.pill, display: "inline-flex", alignItems: "center", gap: 6, ...(transport === t.id ? s.pillOn : {}) }}><Ic size={15} /> {t.id}</button>); })}</div>

      <label style={s.label}>Durée</label>
      <div style={s.wrapRow}>{DURATIONS.map((d) => (<button key={d} onClick={() => setDuration(d)} style={{ ...s.pill, ...(duration === d ? s.pillOn : {}) }}>{d}</button>))}</div>

      <label style={s.label}>Ambiance</label>
      <div style={s.vibeGrid}>{VIBES.map((v) => (<button key={v.id} onClick={() => toggleVibe(v.id)} style={{ ...s.vibe, ...(vibes.includes(v.id) ? s.vibeOn : {}) }}><span style={{ fontSize: 21 }}>{v.emoji}</span><span>{v.id}</span></button>))}</div>

      {error && <div style={s.error}>{error}</div>}
      <button style={s.cta} onClick={() => generate()}><Sparkles size={18} /> Composer mon plan</button>

      {saved.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <label style={s.label}><Bookmark size={13} style={{ verticalAlign: "-2px" }} /> Mes plans enregistrés</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {saved.map((p) => (
              <div key={p._id} style={s.savedCard} className="glass">
                <button style={s.savedMain} onClick={() => openSaved(p)}>
                  <span style={s.savedTitle}>{p.titre}</span>
                  <span style={s.savedMeta}>{p._meta?.destination?.replace(/\(.*\)/, "").trim()} · {p.budget_estime}</span>
                </button>
                <button style={s.savedDel} onClick={() => deleteSaved(p._id)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ height: 30 }} />
    </div>
  );
}

function LoadingScreen({ dest }) {
  const steps = ["Repérage des lieux…", "Sélection des bonnes tables…", "Calage sur ton budget…", "Optimisation des trajets…", "Recherche des pépites TikTok…"];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % steps.length), 1300); return () => clearInterval(t); }, []);
  return (
    <div style={s.loading}>
      <div style={{ animation: "floaty 4s ease-in-out infinite" }}><Globe size={110} /></div>
      <p className="serif" style={s.loadingDest}>{dest.replace(/\(.*\)/, "").trim() || "Ta sortie"}</p>
      <p style={s.loadingStep}>{steps[i]}</p>
    </div>
  );
}

function PlanScreen({ plan, tab, setTab, back, savePlan, savedFlag, sharePlan, refresh }) {
  const openTikTok = (q) => window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(q)}`, "_blank");
  const openMaps = (it) => { const url = it.real?.mapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(it.recherche_maps || it.nom)}`; window.open(url, "_blank"); };
  const geoItems = (plan.items || []).filter((it) => it.real && it.real.lat && it.real.lng);
  const allMapsUrl = () => {
    const pts = geoItems.map((it) => `${it.real.lat},${it.real.lng}`);
    if (pts.length >= 2) return `https://www.google.com/maps/dir/${pts.join("/")}`;
    if (pts.length === 1) return `https://www.google.com/maps/search/?api=1&query=${pts[0]}`;
    return null;
  };
  return (
    <div style={s.scroll} className="fade-up">
      <div style={s.planHead}>
        <button style={s.iconBtn} className="glass" onClick={back}><ArrowLeft size={20} color="var(--ink)" /></button>
        <div style={s.headActions}>
          <button style={s.iconBtn} className="glass" onClick={() => refresh()}><RefreshCw size={17} color="var(--ink)" /></button>
          <button style={s.iconBtn} className="glass" onClick={sharePlan}><Share2 size={17} color="var(--ink)" /></button>
          <button style={{ ...s.iconBtn, ...(savedFlag ? s.iconBtnOn : {}) }} className={savedFlag ? "" : "glass"} onClick={savePlan}>{savedFlag ? <BookmarkCheck size={17} color="#04202f" /> : <Bookmark size={17} color="var(--ink)" />}</button>
        </div>
      </div>

      <div style={s.badgeRow}>
        <div style={s.budgetBadge}><Wallet size={13} color="var(--cyan-bright)" />{plan.budget_estime}</div>
        {plan._meta?.travelers && <div style={s.metaBadge}><Users size={12} /> {plan._meta.travelers}</div>}
        {plan._meta?.transport && <div style={s.metaBadge}>{plan._meta.transport}</div>}
      </div>

      <h1 className="serif" style={s.planTitle}>{plan.titre}</h1>
      <p style={s.planResume}>{plan.resume}</p>
      {plan.meilleur_moment && <div style={s.momentBar}><CalendarClock size={14} color="var(--gold)" /> {plan.meilleur_moment}</div>}

      <div style={s.tabs} className="glass">
        <button onClick={() => setTab("plan")} style={{ ...s.tab, ...(tab === "plan" ? s.tabOn : {}) }}>Itinéraire</button>
        {geoItems.length > 0 && <button onClick={() => setTab("carte")} style={{ ...s.tab, ...(tab === "carte" ? s.tabOn : {}) }}><MapPin size={14} /> Carte</button>}
        <button onClick={() => setTab("tiktok")} style={{ ...s.tab, ...(tab === "tiktok" ? s.tabOn : {}) }}><Music2 size={14} /> TikTok</button>
      </div>

      {tab === "plan" && (
        <div style={s.timeline}>
          {plan.items.map((it, idx) => {
            const Icon = ICONS[it.type] || Camera;
            const r = it.real; const isTrajet = it.type === "trajet";
            return (
              <Tilt key={idx} className="pop-in glass" style={{ ...s.card, ...(isTrajet ? s.trajetCard : {}), animationDelay: `${idx * 70}ms` }}>
                {r?.photoUrl && <img src={r.photoUrl} alt="" style={s.cardPhoto} loading="lazy" />}
                <div style={s.cardInner}>
                  <div style={{ ...s.cardIcon, ...(isTrajet ? s.trajetIcon : {}) }}><Icon size={17} color={isTrajet ? "var(--faint)" : "var(--cyan)"} /></div>
                  <div style={s.cardBody}>
                    <div style={s.cardTop}>
                      <span style={s.cardName}>{r?.name || it.nom}</span>
                      <span style={s.cardCost}>{r?.priceLevel ? PRICE_MAP[r.priceLevel] || it.cout : it.cout}</span>
                    </div>
                    <div style={s.cardMeta}>
                      {it.moment && <span style={s.metaChip}><Clock size={11} /> {it.moment}</span>}
                      {it.duree && <span style={s.metaChip}>{it.duree}</span>}
                      {r?.rating && <span style={{ ...s.metaChip, ...s.ratingChip }}><Star size={11} fill="var(--gold)" color="var(--gold)" /> {r.rating}{r.reviews ? <span style={s.reviewCount}>({r.reviews})</span> : null}</span>}
                      {r?.openNow === true && <span style={{ ...s.metaChip, ...s.openChip }}>Ouvert</span>}
                      {r?.openNow === false && <span style={{ ...s.metaChip, ...s.closedChip }}>Fermé</span>}
                      {!r && !isTrajet && it.quartier && <span style={s.metaChip}><MapPin size={11} /> {it.quartier}</span>}
                    </div>
                    <p style={s.cardWhy}>{it.pourquoi}</p>
                    {!isTrajet && <button style={s.mapBtn} onClick={() => openMaps(it)}><Map size={13} /> {r?.address ? r.address.split(",")[0] : "Voir sur la carte"} <ExternalLink size={11} /></button>}
                  </div>
                </div>
              </Tilt>
            );
          })}
          {plan.astuce_budget && <div style={s.tip}><span style={s.tipLabel}><Lightbulb size={14} style={{ verticalAlign: "-2px" }} /> Astuce budget</span>{plan.astuce_budget}</div>}
        </div>
      )}

      {tab === "carte" && (
        <div>
          <div style={s.mapList}>
            {geoItems.map((it, i) => (
              <button key={i} style={s.mapRow} className="glass" onClick={() => openMaps(it)}>
                <span style={s.mapPin}>{i + 1}</span>
                <span style={s.mapRowBody}><span style={s.mapRowName}>{it.real.name || it.nom}</span>{it.real.address && <span style={s.mapRowAddr}>{it.real.address}</span>}</span>
                <ExternalLink size={14} color="var(--faint)" />
              </button>
            ))}
          </div>
          {allMapsUrl() && <button style={s.routeBtn} onClick={() => window.open(allMapsUrl(), "_blank")}><Route size={16} /> Ouvrir l'itinéraire complet dans Maps</button>}
        </div>
      )}

      {tab === "tiktok" && (
        <div style={s.timeline}>
          {(plan.tiktok || []).map((t, idx) => (
            <Tilt key={idx} className="pop-in glass" style={{ ...s.ttCard, animationDelay: `${idx * 70}ms` }}>
              <button style={{ all: "unset", cursor: "pointer", display: "block", width: "100%" }} onClick={() => openTikTok(t.recherche)}>
                <div style={s.ttTop}><Music2 size={15} color="var(--tiktok)" /><span style={s.ttTitle}>{t.titre}</span></div>
                <div style={s.ttSearch}>Rechercher : « {t.recherche} »</div>
                <div style={s.ttTags}>{(t.hashtags || []).map((h) => <span key={h} style={s.ttTag}>{h}</span>)}</div>
              </button>
            </Tilt>
          ))}
          <p style={s.ttNote}>Chaque carte ouvre la recherche directement dans TikTok.</p>
        </div>
      )}
      <div style={{ height: 30 }} />
    </div>
  );
}

const s = {
  app: { minHeight: "100dvh", background: "radial-gradient(1400px 700px at 50% -12%, #0E4A6E 0%, #073349 34%, #04202f 66%, #021019 100%)", display: "flex", justifyContent: "center", alignItems: "center", padding: 0, position: "relative", overflow: "hidden" },
  phone: { width: "100%", maxWidth: 440, height: "100dvh", overflow: "hidden", position: "relative", zIndex: 1 },
  scroll: { height: "100%", overflowY: "auto", padding: "clamp(20px, 6vw, 28px)", WebkitOverflowScrolling: "touch" },
  hero: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 26, paddingTop: 12 },
  brand: { fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)", marginTop: 18 },
  tagline: { margin: "10px 0 0", color: "var(--muted)", fontSize: 18, lineHeight: 1.35, fontWeight: 600 },
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "24px 0 10px" },
  inputWrap: { display: "flex", alignItems: "center", gap: 10, borderRadius: 15, padding: "14px 15px" },
  input: { border: "none", outline: "none", flex: 1, fontSize: 16, background: "transparent", color: "var(--ink)", minWidth: 0 },
  geoBtn: { marginTop: 10, display: "inline-flex", alignItems: "center", gap: 7, background: "var(--aqua-tint)", border: "1px solid var(--line)", color: "var(--cyan-bright)", fontWeight: 600, fontSize: 13.5, padding: "10px 15px", borderRadius: 11, cursor: "pointer" },
  geoStatus: { display: "block", marginTop: 8, fontSize: 12.5, color: "var(--faint)" },
  budgetRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  budgetVal: { display: "flex", alignItems: "center", gap: 8 },
  budgetNum: { fontSize: 30, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" },
  currencyRow: { display: "flex", gap: 6 },
  chip: { padding: "7px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 12.5, fontWeight: 700, color: "var(--muted)", cursor: "pointer" },
  chipOn: { background: "linear-gradient(135deg, var(--cyan), var(--teal))", color: "#04202f", borderColor: "transparent" },
  stepper: { display: "inline-flex", alignItems: "center", gap: 4, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 4 },
  stepBtn: { width: 42, height: 42, borderRadius: 9, border: "none", background: "var(--aqua-tint)", color: "var(--cyan-bright)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  stepVal: { minWidth: 44, textAlign: "center", fontSize: 19, fontWeight: 800, color: "var(--ink)" },
  wrapRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  pill: { padding: "10px 14px", borderRadius: 11, border: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer" },
  pillOn: { background: "linear-gradient(135deg, var(--cyan), var(--teal))", color: "#04202f", borderColor: "transparent", fontWeight: 700 },
  vibeGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 },
  vibe: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 6px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 12.5, fontWeight: 600, color: "var(--muted)", cursor: "pointer" },
  vibeOn: { background: "var(--aqua-tint)", borderColor: "var(--cyan)", color: "var(--cyan-bright)" },
  error: { marginTop: 16, background: "rgba(254,44,85,0.12)", color: "#FCA5B5", padding: "12px 15px", borderRadius: 11, fontSize: 13.5, border: "1px solid rgba(254,44,85,0.25)" },
  cta: { marginTop: 26, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, background: "linear-gradient(135deg, var(--cyan), var(--teal))", color: "#04202f", border: "none", borderRadius: 15, padding: "17px", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 30px rgba(34,211,238,0.35)" },
  savedCard: { display: "flex", alignItems: "stretch", borderRadius: 13, overflow: "hidden" },
  savedMain: { flex: 1, textAlign: "left", border: "none", background: "transparent", padding: "12px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  savedTitle: { fontSize: 14.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  savedMeta: { fontSize: 12, color: "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  savedDel: { border: "none", background: "transparent", padding: "0 14px", cursor: "pointer", color: "var(--faint)", display: "flex", alignItems: "center" },
  loading: { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 30 },
  loadingDest: { fontSize: 23, fontWeight: 700, color: "var(--ink)", margin: "14px 0 0", textAlign: "center" },
  loadingStep: { fontSize: 14.5, color: "var(--cyan-bright)", margin: 0 },
  planHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headActions: { display: "flex", gap: 8 },
  iconBtn: { width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
  iconBtnOn: { background: "linear-gradient(135deg, var(--cyan), var(--teal))", border: "1px solid transparent" },
  badgeRow: { display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 },
  budgetBadge: { display: "flex", alignItems: "center", gap: 5, background: "var(--aqua-tint)", color: "var(--cyan-bright)", fontWeight: 700, fontSize: 13, padding: "9px 13px", borderRadius: 11, border: "1px solid var(--line)" },
  metaBadge: { display: "flex", alignItems: "center", gap: 5, background: "var(--surface-2)", color: "var(--muted)", fontWeight: 700, fontSize: 13, padding: "9px 13px", borderRadius: 11, border: "1px solid var(--line)" },
  planTitle: { fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1.12, margin: "0 0 9px" },
  planResume: { fontSize: 15, color: "var(--muted)", lineHeight: 1.5, margin: "0 0 12px" },
  momentBar: { display: "flex", alignItems: "center", gap: 7, background: "rgba(251,191,36,0.1)", color: "var(--gold)", fontSize: 13, fontWeight: 600, padding: "10px 13px", borderRadius: 11, marginBottom: 18, border: "1px solid rgba(251,191,36,0.2)" },
  tabs: { display: "flex", gap: 6, marginBottom: 18, padding: 5, borderRadius: 14 },
  tab: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "11px 6px", borderRadius: 10, border: "none", background: "transparent", fontSize: 13.5, fontWeight: 700, color: "var(--faint)", cursor: "pointer" },
  tabOn: { background: "linear-gradient(135deg, var(--cyan), var(--teal))", color: "#04202f", boxShadow: "0 6px 18px rgba(34,211,238,0.3)" },
  timeline: { display: "flex", flexDirection: "column", gap: 12 },
  card: { borderRadius: 18, overflow: "hidden" },
  trajetCard: { opacity: 0.85, borderStyle: "dashed" },
  cardPhoto: { width: "100%", height: 130, objectFit: "cover", display: "block" },
  cardInner: { display: "flex", gap: 12, padding: 15 },
  cardIcon: { width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: "var(--aqua-tint)", display: "flex", alignItems: "center", justifyContent: "center" },
  trajetIcon: { background: "rgba(159,197,214,0.1)" },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 },
  cardName: { fontSize: 16, fontWeight: 700, color: "var(--ink)" },
  cardCost: { fontSize: 13, fontWeight: 700, color: "var(--cyan-bright)", whiteSpace: "nowrap" },
  cardMeta: { display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" },
  metaChip: { display: "flex", alignItems: "center", gap: 3, fontSize: 11.5, color: "var(--muted)", background: "var(--surface-2)", padding: "4px 8px", borderRadius: 7, fontWeight: 600 },
  ratingChip: { color: "var(--gold)", background: "rgba(251,191,36,0.12)" },
  reviewCount: { color: "var(--faint)", marginLeft: 2 },
  openChip: { color: "var(--ok)", background: "rgba(52,211,153,0.12)" },
  closedChip: { color: "#FCA5B5", background: "rgba(254,44,85,0.12)" },
  cardWhy: { fontSize: 13.5, color: "var(--muted)", lineHeight: 1.45, margin: "0 0 10px" },
  mapBtn: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: "var(--cyan-bright)", background: "var(--aqua-tint)", border: "1px solid var(--line)", padding: "7px 11px", borderRadius: 9, cursor: "pointer" },
  tip: { marginTop: 4, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 14, padding: 15, fontSize: 13.5, color: "var(--ok)", lineHeight: 1.5 },
  tipLabel: { display: "block", fontWeight: 700, marginBottom: 5 },
  mapList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 },
  mapRow: { display: "flex", alignItems: "center", gap: 12, borderRadius: 13, padding: "12px 14px", cursor: "pointer", textAlign: "left", width: "100%" },
  mapPin: { width: 26, height: 26, flexShrink: 0, borderRadius: "50%", background: "linear-gradient(135deg, var(--cyan), var(--teal))", color: "#04202f", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  mapRowBody: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  mapRowName: { fontSize: 14.5, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  mapRowAddr: { fontSize: 12, color: "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  routeBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, var(--cyan), var(--teal))", color: "#04202f", border: "none", borderRadius: 14, padding: "15px", fontSize: 14.5, fontWeight: 800, cursor: "pointer" },
  ttCard: { borderRadius: 16, padding: 16, width: "100%" },
  ttTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 9 },
  ttTitle: { fontSize: 15, fontWeight: 700, color: "var(--ink)" },
  ttSearch: { fontSize: 13.5, color: "var(--muted)", background: "var(--surface-2)", padding: "10px 12px", borderRadius: 10, marginBottom: 10 },
  ttTags: { display: "flex", flexWrap: "wrap", gap: 6 },
  ttTag: { fontSize: 12, fontWeight: 600, color: "#FCA5B5", background: "rgba(254,44,85,0.12)", padding: "4px 9px", borderRadius: 8 },
  ttNote: { fontSize: 12.5, color: "var(--faint)", textAlign: "center", marginTop: 6 },
  toast: { position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, var(--cyan), var(--teal))", color: "#04202f", padding: "13px 22px", borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: "0 8px 30px rgba(34,211,238,0.4)", zIndex: 100, maxWidth: "90%" },
};
