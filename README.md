# Escapade 🌊

Planificateur de sorties et de voyages, mobile-first. Tu entres une destination
(ou ta géolocalisation) et un budget, l'IA compose un itinéraire complet :
lieux, activités, restaurants, trajets — avec vraies notes/photos Google Places
quand la clé est configurée — plus des pistes TikTok et une carte.

Thème océan, globe 3D animé, cartes inclinables (tilt 3D), installable en PWA.

## Stack
- **Front** : Vite + React 18 (PWA : manifest, service worker, icônes)
- **Back** : fonctions serverless Vercel (`/api/plan`, `/api/places`)
- **IA** : API Claude (génération de l'itinéraire)
- **Lieux** : Google Places API (New) — optionnel

## Lancer en local
```bash
npm install
npm run dev
```

## Variables d'environnement (sur Vercel → Settings → Environment Variables)
| Nom | Requis | Rôle |
|-----|--------|------|
| `ANTHROPIC_API_KEY` | Non | Optionnel : sinon l'IA passe par la passerelle Vercel AI Gateway (auth OIDC automatique) |
| `GOOGLE_PLACES_KEY` | Optionnel | Vraies notes, photos, adresses, carte |

Sans `GOOGLE_PLACES_KEY`, l'app fonctionne en mode IA seule.

## Déploiement
Projet pensé pour Vercel (framework Vite, output `dist`). Connecte le dépôt
GitHub à Vercel, ajoute les variables d'environnement, et chaque push déploie.

## Fonctionnalités
- Destination libre ou géolocalisation GPS
- Budget avec devise (MAD / EUR / USD), nombre de personnes, déplacement, durée, ambiances
- Itinéraire chronologique généré par IA (6–9 étapes)
- Onglets Itinéraire / Carte / TikTok
- Enregistrement de plans (favoris), partage, régénération
- Installable comme app (PWA)

---
Créé avec Claude.
