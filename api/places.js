export const config = { runtime: "edge" };
export default async function handler(req) {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return json({ enabled: false });
  let body;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const { query, near } = body || {};
  if (!query) return json({ error: "no_query" }, 400);
  try {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "content-type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.googleMapsUri,places.location,places.photos,places.currentOpeningHours.openNow" },
      body: JSON.stringify({ textQuery: near ? `${query} pres de ${near}` : query, languageCode: "fr", maxResultCount: 1 }),
    });
    if (!r.ok) return json({ enabled: true, found: false });
    const data = await r.json();
    const p = data.places && data.places[0];
    if (!p) return json({ enabled: true, found: false });
    let photoUrl = null;
    if (p.photos && p.photos[0] && p.photos[0].name) { photoUrl = `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxHeightPx=400&maxWidthPx=600&key=${key}`; }
    return json({ enabled: true, found: true, place: { name: p.displayName && p.displayName.text, address: p.formattedAddress || null, rating: p.rating || null, reviews: p.userRatingCount || null, priceLevel: p.priceLevel || null, mapsUri: p.googleMapsUri || null, lat: p.location && p.location.latitude, lng: p.location && p.location.longitude, openNow: p.currentOpeningHours ? p.currentOpeningHours.openNow : null, photoUrl } });
  } catch (e) { return json({ enabled: true, found: false, error: String(e).slice(0, 120) }); }
}
function json(obj, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } }); }
