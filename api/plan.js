// Auth: ANTHROPIC_API_KEY (direct) > AI_GATEWAY_API_KEY > OIDC Vercel (automatique, aucune cle requise)
export async function POST(req) {
  const direct = process.env.ANTHROPIC_API_KEY;
  const gwKey = process.env.AI_GATEWAY_API_KEY || req.headers.get("x-vercel-oidc-token") || process.env.VERCEL_OIDC_TOKEN;
  if (!direct && !gwKey) return json({ error: "missing_key", message: "Aucune authentification IA disponible." }, 500);
  let body;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const { destination, budget, currency, duration, vibes, travelers, transport } = body || {};
  if (!destination) return json({ error: "no_destination" }, 400);
  const vibeText = Array.isArray(vibes) && vibes.length ? vibes.join(", ") : "polyvalent";
  const people = travelers && travelers > 0 ? travelers : 1;
  const move = transport || "a pied / transports";
  const prompt = `Tu es un planificateur de voyage local expert. Compose un plan concret et realiste.

Destination / point de depart: ${destination}
Budget total: ${budget} ${currency}
Nombre de personnes: ${people}
Moyen de deplacement: ${move}
Duree: ${duration}
Ambiances voulues: ${vibeText}

Reponds UNIQUEMENT avec un objet JSON valide, sans texte avant/apres ni backticks. Structure exacte:
{
  "titre": "titre court et accrocheur",
  "resume": "1-2 phrases qui donnent le ton",
  "budget_estime": "fourchette realiste en ${currency} pour ${people} personne(s)",
  "items": [
    { "type": "lieu | activite | manger | trajet", "nom": "nom precis", "quartier": "quartier ou zone", "moment": "Matin | Midi | Apres-midi | Soir", "cout": "cout approx pour ${people} pers", "pourquoi": "1 phrase", "recherche_maps": "requete carte", "duree": "duree conseillee" }
  ],
  "tiktok": [ { "titre": "type de contenu", "recherche": "requete TikTok exacte", "hashtags": ["#tag1"] } ],
  "astuce_budget": "conseil concret",
  "meilleur_moment": "meilleure periode/heure"
}

Donne 6 a 9 items varies (melange lieu/activite/manger, et 1-2 'trajet' si pertinent), ordonnes dans le temps. Adapte le rythme au moyen de deplacement (${move}). Donne 3 pistes TikTok pertinentes. Adapte les couts au budget et au nombre de personnes. Ecris en francais.`;
  try {
    const r = direct
      ? await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": direct, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
        })
      : await fetch("https://ai-gateway.vercel.sh/v1/messages", {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${gwKey}`, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model: "anthropic/claude-sonnet-5", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
        });
    if (!r.ok) { const t = await r.text(); return json({ error: "upstream", detail: t.slice(0, 300) }, 502); }
    const data = await r.json();
    const text = (data.content || []).filter((c) => c.type === "text").map((c) => c.text).join("").replace(/```json|```/g, "").trim();
    let plan;
    try { plan = JSON.parse(text); } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) return json({ error: "parse", raw: text.slice(0, 300) }, 502);
      plan = JSON.parse(m[0]);
    }
    return json({ plan });
  } catch (e) { return json({ error: "server", message: String(e).slice(0, 200) }, 500); }
}
function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }); }
