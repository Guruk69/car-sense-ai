# Car Sense AI

**See the damage. Know the cost. Drive with confidence.**

A mobile-first, installable Progressive Web App for inspecting vehicle damage,
estimating repair cost in INR, and getting roadside help. Built with TanStack
Start (React 19 + TypeScript), Tailwind CSS v4, shadcn/ui, Lucide icons and a
managed Postgres/Auth/Storage backend.

---

## Features

- **Damage inspection** — pick a vehicle, capture with the rear camera or upload
  a photo, run detection, and see responsive bounding boxes drawn over the
  image.
- **Classification** — damage type (`scratch`, `dent`, `crack`, `broken_part`),
  severity (`minor`, `moderate`, `severe`), affected part and model confidence.
- **Repair estimate** — INR min/max range derived from a seeded repair-cost
  table, adjusted by severity.
- **Repair guidance** — do-it-yourself vs workshop advice per damage type.
- **History** — every inspection saved with its image, detections and estimate.
- **Mechanics** — curated workshops filtered by service type and sorted by real
  distance from your location, with call and directions actions.
- **Parking** — save your exact parking spot and navigate back to it.
- **SOS** — read your current location, log the event, and share it (Web Share
  API with clipboard fallback), with optional live location updates.
- **Service** — reminders by date or mileage, plus vehicle health tips.
- **Vehicles** — manage your garage and pick the current vehicle.
- **PWA** — manifest, icons, theme colour and standalone display for
  Add-to-Home-Screen installation.

## Routes

| Route | Purpose |
| --- | --- |
| `/login`, `/signup` | Email/password and Google sign-in |
| `/` | Dashboard: current vehicle, scan CTA, quick actions, recent inspections |
| `/scan` | Capture/upload and analyse |
| `/analysis/:reportId` | Result of the inspection you just ran |
| `/history`, `/history/:reportId` | Saved inspections |
| `/mechanics` | Nearby workshops |
| `/parking` | Save and find your parked car |
| `/sos` | Emergency location sharing |
| `/service` | Reminders and tips |
| `/vehicles` | Garage management |
| `/profile` | Account, stats, detection mode |

Everything except `/login` and `/signup` sits behind an authenticated route
layout.

## Damage detection service

All inference goes through one abstraction:

```ts
import { detectDamage } from "@/services/ai/damageDetectionService";
const result = await detectDamage(file);
```

- **Demo mode (default).** With no `VITE_AI_API_URL`, results are generated
  locally and deterministically from the image. The UI labels these results as
  simulated everywhere they appear — no claim is made that a trained model ran.
- **Real mode.** Set `VITE_AI_API_URL` and the same call posts the image to your
  own backend:

  ```http
  POST {VITE_AI_API_URL}/api/detect-damage
  Content-Type: multipart/form-data
  image: <file>
  ```

  ```json
  {
    "success": true,
    "detections": [
      {
        "class": "dent",
        "confidence": 0.91,
        "severity": "moderate",
        "part": "front_bumper",
        "bbox": [120, 240, 310, 180]
      }
    ]
  }
  ```

  `bbox` is `[x, y, width, height]` in **original image pixels**;
  `DamageImageViewer` converts them to percentages so boxes stay aligned at any
  screen size.

No model training, fine-tuning, weight downloads or client-side ML inference
happens in this repository.

## Data model

Private, per-user (row-level security scoped to the signed-in user):
`profiles`, `vehicles`, `damage_reports`, `damage_detections`,
`parking_locations`, `service_reminders`, `emergency_events`.

Shared reference data, readable by signed-in users: `repair_costs`, `mechanics`,
`vehicle_tips`, `repair_guides` — seeded with realistic Indian pricing,
workshops and guidance.

Vehicle photos live in a **private** `vehicle-images` storage bucket. Uploads are
compressed client-side and stored under `{user_id}/…`; storage policies allow
each user to read, write and delete only their own folder, and the app renders
images through short-lived signed URLs.

## Local development

```bash
bun install
bun run dev      # http://localhost:8080
bun run build    # production build
bun run lint
```

Copy `.env.example` to `.env` and fill in the optional keys you need. The
backend variables are managed for you.

## Deployment

The build output is a standard server bundle and deploys to Vercel (or any Node
/edge host) with no extra configuration:

- Build command: `bun run build`
- Install command: `bun install`
- Add the same environment variables in the hosting project settings.

## Notes and honesty

- Repair estimates are indicative ranges from seeded reference pricing, not
  quotes from a workshop.
- Workshop listings are curated demo data, not a live directory; distances are
  computed from your real device location.
- SOS prepares and shares a location link. No SMS or emergency service is
  contacted automatically — the app never claims otherwise.
- No secrets are committed; server-side keys are never exposed to the browser.
