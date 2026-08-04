# Map Architecture

**Status:** Active — interactive map at `/map` (static beta)
**Last reviewed:** 2026-08-03

This document describes the interactive map implementation built on
[MapLibre GL JS](https://maplibre.org/). It covers the component architecture,
the static-data → layer → MapLibre pipeline, the coordinate safety system, the
layer system, the tile usage policy, and how to add new layers.

---

## Overview

The map is a **static-first** feature. There is no backend, no live tile
service beyond the standard OpenStreetMap raster tiles, and no real-time data
feed. All features come from hand-reviewed static data files in
`src/data/map/`, each coordinate is passed through a mandatory safety function
(`safeCoordinate`) before it can be displayed, and the resulting
`MapFeature[]` arrays are composed into MapLibre sources and layers by a small
set of pure factory functions.

The design goals are:

1. **Safety by construction** — exact coordinates for sensitive locations can
   never reach the map. Branded types and a single choke point
   (`safeCoordinate`) enforce this at the type level and at runtime.
2. **Static data review** — all published coordinates are pre-reviewed and
   stored in data files (see `docs/anti-doxing-policy.md`).
3. **Small, testable primitives** — the MapLibre instance is isolated behind
   a context, and each component/library module has unit tests.
4. **Code-split** — the map page is lazy-loaded, so the heavy `maplibre-gl`
   bundle is only fetched when a visitor navigates to `/map`.

---

## Architecture overview

### Component tree

```
App.tsx  (lazy import → Suspense → RouteLoadingFallback)
└── <Route path="/map" element={<MapPage />} />
    └── src/pages/MapPage.tsx  (default export)
        ├── Container / PageIntro / PageStatusNotice (safe-precision notice)
        └── grid (lg:grid-cols-3)
            ├── map panel (col-span-2)
            │   └── <MapContainer>                         — creates MapLibre map, owns MapContext
            │       ├── <MapLayer config={eventConfig} … />        × 5 (zero-render)
            │       ├── <MapControls />    — zoom in/out/reset
            │       ├── <MapLegend layers={allLayerConfigs} />
            │       ├── <MapPopup />       — feature-click dialog
            │       └── <MapTimeline features={ALL_FEATURES} />    — playable date slider
            └── sidebar (col-span-1)
                ├── <MapSearch features={ALL_FEATURES} />
                └── <MapFilters features={ALL_FEATURES} />
```

`MapPage` is the assembly point. It reads the static feature arrays, applies
the current timeline range and filter-panel state to produce a
`visibleFeatures` set, builds one `MapLayerConfig` per feature type via the
layer builders, and renders the map primitives. `LayerGroupControl` exists as
a standalone primitive but is not wired into the current page (see
`src/components/map/LayerGroupControl.tsx`).

There is also a pre-composed **`EventMapPanel`**
(`src/components/map/EventMapPanel.tsx`) that packages a `MapContainer` with
event + source layers, a timeline, and a legend into a self-contained,
500px-tall embeddable panel. It follows the same composition pattern as
`MapPage` and can be dropped into any page that already has event/source
features.

### Context flow

`MapContainer` initializes the MapLibre instance and exposes it through a React
context defined in `src/components/map/MapContext.tsx`:

```ts
export interface MapContextValue {
  map: Map | null;                    // MapLibre instance, null until "load"
  layerVisibility: LayerVisibility;   // { [layerId]: boolean }
  setLayerVisibility: (id: string, visible: boolean) => void;
  toggleLayerGroup: (group: LayerGroup) => void;
}
```

Key facts about the context:

- `map` starts as `null`. `MapContainer` sets it only after the MapLibre
  `"load"` event fires. Consumers must tolerate `null` (every primitive does —
  they render nothing / no-op when the map is unavailable).
- `setLayerVisibility` updates the `layerVisibility` map by layer id. The
  actual MapLibre `setLayoutProperty` call is performed by the owning
  `MapLayer` component in response to its `visible` prop (the context value is
  the source of truth for legend/controls; the DOM layer is updated by
  `MapLayer`).
- `toggleLayerGroup` flips a synthetic `__group__<group>` key. It is a
  convenience for group-level UI; individual `MapLayer`s react to their own
  visibility.

### Directory map

| Path | Responsibility |
|---|---|
| `src/pages/MapPage.tsx` | Route page: assemble everything, apply timeline + filters |
| `src/components/map/MapContainer.tsx` | Create MapLibre map (OSM tiles), own context, resize handling |
| `src/components/map/MapContext.tsx` | `MapContext` + `useMapContext()` |
| `src/components/map/MapLayer.tsx` | Zero-render bridge: add/update/remove a source + layer |
| `src/components/map/MapControls.tsx` | Zoom in/out, reset view |
| `src/components/map/MapLegend.tsx` | Legend grouped by `LayerGroup`, reflects `layerVisibility` |
| `src/components/map/MapPopup.tsx` | Feature-click popup via `queryRenderedFeatures` |
| `src/components/map/MapSearch.tsx`, `MapSearchResults.tsx` | Debounced fuzzy search + result list; `panTo` on select |
| `src/components/map/MapFilters.tsx` | Checkbox filter panel (AND logic) + date range |
| `src/components/map/MapTimeline.tsx` | Playable date-range slider |
| `src/components/map/LayerGroupControl.tsx` | Nested group/sub-layer toggles |
| `src/components/map/EventMapPanel.tsx` | Pre-composed event map embed |
| `src/lib/map/types.ts` | Branded coordinate types, precision, groups, configs |
| `src/lib/map/sources.ts` | `createGeoJSONSource(MapFeature[])` → MapLibre GeoJSON source |
| `src/lib/map/layers.ts` | Category color maps, `getLayerStyle`, `createLayerSpec` |
| `src/lib/map/layers/` | Per-feature-type layer config builders |
| `src/lib/map/utils/safety.ts` | `safeCoordinate`, jitter, precision downgrade |
| `src/lib/map/utils/timeline.ts` | Date-range filtering + slider helpers |
| `src/data/map/` | Static, pre-reviewed `MapFeature[]` data files |

---

## Data flow

The pipeline is deliberately one-directional: **static data → layers → sources
→ MapLibre**.

```
src/data/map/*.ts                 MapFeature[] (each feature already carries a SafeCoordinate)
        │
        │  safeCoordinate() ran at module load (the `safed()` helper in each data file)
        ▼
layer builders  src/lib/map/layers/*.ts
        │  buildEventLayerConfig(features) etc.
        │  → MapLayerConfig (id, group, label, features, style, defaultVisible, subLayers)
        ▼
MapLayer component                src/components/map/MapLayer.tsx
        │  on mount, once map is available:
        │    source = createGeoJSONSource(config.features)
        │    spec   = createLayerSpec(config, sourceId)
        │    map.addSource(sourceId, source); map.addLayer(spec)
        ▼
MapLibre GL render pipeline
```

Two points in this chain are where the "safe" guarantee is enforced:

1. **Data files** call `safeCoordinate()` via a small `safed()` wrapper at
   module scope, so every exported feature already holds a `SafeCoordinate`.
2. **`createGeoJSONSource`** (`src/lib/map/sources.ts`) reads only
   `feature.safeCoordinate` — never a raw coordinate. It also performs the
   GeoJSON `[lng, lat]` swap:

```ts
geometry: {
  type: "Point",
  coordinates: [f.safeCoordinate.lon, f.safeCoordinate.lat], // GeoJSON is [lng, lat]
}
```

`MapPage` inserts the timeline + filter step in front of the layer builders:

```
ALL_FEATURES
  → filterFeaturesByDateRange(ALL_FEATURES, range.start, range.end)   (timeline)
  → filterFeaturesByDateRange(…, filters.dateStart, filters.dateEnd)  (filter panel)
  → category / source-type set filters
  → build<Type>LayerConfig(visibleFeatures)  for each of the 5 types
```

Undated features are always retained by the date filters (they could belong to
any date). The search and filter panels receive the full `ALL_FEATURES` array
(they must surface every possible category and the full date span); only the
rendered layers receive the filtered subset.

---

## Safety enforcement

Safety is the map's most important invariant. The enforcement has three layers:
branded types, a single runtime choke point, and jitter/downgrade rules.

### Branded coordinate types

`src/lib/map/types.ts` defines two structurally identical but mutually
incompatible types using `unique symbol` brands:

```ts
export interface RawCoordinate {
  lat: number;
  lon: number;
  [RawCoordinateBrand]: never;
}

export interface SafeCoordinate {
  lat: number;
  lon: number;
  precision: LocationPrecision;
  [SafeCoordinateBrand]: never;
}
```

Because the brand property is `never`, only code that casts (i.e.
`safeCoordinate` and `makeRawCoordinate`) can produce these types. Every
consumer that matters — `MapFeature.safeCoordinate`, `MapLayerConfig.features`,
and therefore `createGeoJSONSource` — is typed to accept only `SafeCoordinate`.
A `RawCoordinate` cannot be passed to the map layer system without a deliberate
`as` cast, which is exactly what the system is designed to prevent.

### The one way in: `safeCoordinate`

`src/lib/map/utils/safety.ts` exports `safeCoordinate(raw, context)`. This is
the single entry point for coordinates entering the display system.

```ts
export function safeCoordinate(
  raw: RawCoordinate,
  context: SafetyContext,   // { locationType, isSensitive, sourcePrecision }
): SafeCoordinate
```

The function:

1. Looks up whether `locationType` is in `SENSITIVE_LOCATION_TYPES`.
2. If the feature is sensitive (`isSensitive` or a sensitive location type),
   applies `SAFE_PRECISION_MAP` to derive the display precision.
3. Applies **jitter** to the raw lat/lon when the feature is sensitive,
   sized by the display precision.
4. Logs a `console.debug` in dev when a precision downgrade occurred.

`makeRawCoordinate(lat, lon)` is exported **only for tests and data
preprocessing** — never for map rendering code. The data files in
`src/data/map/` use it through the `safed()` wrapper, which is the intended
preprocessing site.

### Sensitive location types

The set is defined once in `safety.ts` and mirrored in the AI pipeline's
`GeographicExtractor` (`src/lib/ai/stages/GeographicExtractor.ts`) so that the
two systems agree:

```ts
export const SENSITIVE_LOCATION_TYPES = new Set([
  "shelter", "safe_house", "medical_facility", "aid_distribution_point",
  "checkpoint", "witness_location", "individual_home",
]);
```

### Precision downgrade map

```ts
export const SAFE_PRECISION_MAP: Record<string, LocationPrecision> = {
  exact: "safe",
  district: "city",
  city: "city",
  region: "region",
  country: "country",
  safe: "safe",
};
```

Applied only when the feature is sensitive. Non-sensitive features keep their
`sourcePrecision` unchanged.

### Jitter

Jitter is deterministic (seeded per coordinate + session) so tests are
reproducible. It is applied only to sensitive features, sized by display
precision:

| Display precision | Jitter range | Code |
|---|---|---|
| `safe` | ±~35 km | `applyJitter(lat, 35)` |
| `city` | ±~10 km | `applyJitter(lat, 10)` |
| `region` | ±~20 km | `applyJitter(lat, 20)` |
| `country` | none | already imprecise |

`applyJitter` works by treating ~1 degree as ~111 km: the offset is
`(pseudo - 0.5) * 2 * (rangeKm / 111)`, where `pseudo` is a deterministic
pseudo-random value in `[0, 1)`.

> **Rule of thumb for contributors:** if a coordinate could place a person or a
> sensitive site at risk, do not add it as `exact`. Prefer a `district`,
> `city`, `region`, or `country` `sourcePrecision` and set `isSensitive: true`
> for the classes above. See "Coordinate precision rules" below.

---

## Layer system

### Layer groups

```ts
export type LayerGroup = "events" | "sources" | "organizations" | "legal" | "infrastructure";
```

Groups are the top-level organization of layers. `LAYER_GROUP_LABELS`
(`src/lib/map/types.ts`) maps each group to its display label.

### Layer config

```ts
export interface MapLayerConfig {
  id: string;               // unique; used as the MapLibre layer id
  group: LayerGroup;
  label: string;
  features: MapFeature[];
  style: LayerStyle;        // color, radius, fillOpacity, strokeWidth, icon
  minZoom?: number;
  defaultVisible: boolean;
  subLayers?: MapLayerConfig[];
}
```

The `id` also namespaces the GeoJSON source as `${config.id}--source` (see
`MapLayer`). `defaultVisible` controls both the initial `visibility` in the
layer spec and the initial legend/checkbox state. The sensitive infrastructure
layer is the notable exception: `defaultVisible: false`.

### Layer config builders

`src/lib/map/layers/` holds one builder per feature type:

| Builder | File | Groups features by |
|---|---|---|
| `buildEventLayerConfig` | `EventLayer.ts` | event category → sub-layers |
| `buildSourceLayerConfig` | `SourceLayer.ts` | source category → sub-layers |
| `buildOrganizationLayerConfig` | `OrganizationLayer.ts` | org category → sub-layers |
| `buildLegalLayerConfig` | `LegalLayer.ts` | single flat layer (all "trust" color) |
| `buildInfrastructureLayerConfig` | `InfrastructureLayer.ts` | only `hospital`/`school`; hidden by default |
| `buildHumanitarianLayerConfig` | `HumanitarianLayer.ts` | `aid_route`/`crossing_point`; hidden by default |

Each builder filters `features` to its own `MapFeature.type`, groups by
category into `subLayers` (where applicable), and assigns styles from the
category color maps in `src/lib/map/layers.ts`.

### Style factories

`src/lib/map/layers.ts` provides:

- `EVENT_CATEGORY_COLORS`, `SOURCE_CATEGORY_COLORS`, `ORG_CATEGORY_COLORS` —
  per-category colors drawn from the project palette (trust `#3B6EA8`, amber
  `#D99A2B`, clay `#B95C50`, charcoal `#1F2937`).
- `getLayerStyle(category)` — returns a `LayerStyle`, falling back to a neutral
  grey `#999999` for unknown categories.
- `createLayerSpec(config, sourceId)` — produces a MapLibre **circle** layer
  spec for point features, or a **fill** layer spec otherwise (the type is
  inferred from `config.features[0].safeCoordinate`). The initial `layout.visibility`
  is taken from `config.defaultVisible`.

### Toggling

There are two visibility mechanisms that cooperate:

1. **`MapLayer`'s `visible` prop.** The component calls
   `map.setLayoutProperty(config.id, "visibility", visible ? "visible" : "none")`
   whenever the prop changes. This is what actually changes what is drawn.
2. **`layerVisibility` in context.** `MapLegend` and `LayerGroupControl` read
   this map to reflect current state; `setLayerVisibility` updates it. On the
   current `MapPage`, each `MapLayer` receives `visible={config.defaultVisible}`
   directly, so the context values and DOM visibility are consistent from the
   initial render.

`LayerGroupControl` additionally supports **group toggling** (expand/collapse +
show/hide all in a group) and nested `subLayers`.

---

## Adding new layers

Step-by-step guide for adding a new feature type (e.g. a new "military"
category) to the map.

### 1. Add the static data

Create (or extend) a file under `src/data/map/`. Each feature must go through
`safeCoordinate` at module load:

```ts
import type { MapFeature } from "../../lib/map/types";
import { safeCoordinate, makeRawCoordinate } from "../../lib/map/utils/safety";

function safed(lat: number, lon: number, locationType: string, isSensitive: boolean, sourcePrecision: "country" | "region" | "city" | "district" | "exact" | "safe") {
  return safeCoordinate(makeRawCoordinate(lat, lon), { locationType, isSensitive, sourcePrecision });
}

export const militaryFeatures: MapFeature[] = [
  {
    id: "mil-001",
    type: "military",             // extend the MapFeature.type union in types.ts
    category: "base",
    title: "…",
    safeCoordinate: safed(…, …, "military_base", false, "city"),
    sourceIds: [],
    isSensitive: false,
  },
];
```

If the category is a sensitive class (shelter, medical facility, school, …),
set `isSensitive: true` (and prefer a `district`/`city` `sourcePrecision`) —
`safeCoordinate` will downgrade and jitter automatically.

### 2. Add the builder

Create `src/lib/map/layers/MilitaryLayer.ts`:

```ts
export function buildMilitaryLayerConfig(features: MapFeature[]): MapLayerConfig {
  const militaryFeatures = features.filter((f) => f.type === "military");
  // group by category into subLayers, assign styles via getLayerStyle(cat)
  return {
    id: "military-layer",
    group: "military",           // extend the LayerGroup union + LAYER_GROUP_LABELS
    label: "Military",
    features: militaryFeatures,
    style: { color: "#…", radius: 8 },
    defaultVisible: true,
    subLayers,
  };
}
```

### 3. Register category colors

If you introduce new categories, add them to the relevant color map in
`src/lib/map/layers.ts` (e.g. `EVENT_CATEGORY_COLORS`) or to
`getLayerStyle`'s lookup chain.

### 4. Wire into `MapPage`

In `src/pages/MapPage.tsx`:

- import the data array and the builder;
- add the features to `ALL_FEATURES`;
- build the config with `useMemo`;
- add `<MapLayer config={militaryConfig} visible={militaryConfig.defaultVisible} />`
  inside `MapContainer`;
- include the config in `allLayerConfigs` so `MapLegend` picks it up.

### 5. Tests

- **Data safety:** add the new data file to `src/data/__tests__/mapSafety.test.ts`
  (or add assertions) so sensitive types can never hold exact coordinates.
- **Builder:** add cases to `src/lib/map/__tests__/layerDefinitions.test.ts`
  asserting the new config's `id`, `group`, and `defaultVisible`.
- **Colors/style:** if new categories were added, cover them in
  `src/lib/map/__tests__/layers.test.ts`.
- **Route smoke:** `src/pages/__tests__/routeSmoke.test.tsx` already renders
  `MapPage`; it will catch wiring regressions automatically.

### 6. Verify

```bash
npx vitest run src/components/map src/lib/map src/data/__tests__/mapSafety.test.ts
npm run lint
npm run typecheck
```

---

## Tile usage policy

`MapContainer` serves the default basemap from the standard OpenStreetMap
raster tile servers:

```ts
const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [{ id: "osm-tiles", type: "raster", source: "osm-tiles", minzoom: 0, maxzoom: 19 }],
};
```

### Rules for using `tile.openstreetmap.org`

The OSM tile server is a community-run service, not a free CDN. Adherence to
the [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
is mandatory:

- **Attribution:** the `© OpenStreetMap contributors` attribution must remain
  visible (it is set in the style and rendered by MapLibre's attribution
  control, which stays enabled).
- **Light use only:** the current usage (a static page, tiles fetched on
  demand as the user pans/zooms) is appropriate. Sustained, scripted, or
  high-volume downloads are prohibited.
- **No bulk pre-fetching:** do not write scripts that pre-warm or download
  large tile areas from `tile.openstreetmap.org`.
- **Rate limits:** keep per-user request rates modest (the OSM policy targets
  roughly a sustained ~2 requests/second per client and discourages
  high-volume, low-interactivity consumers). The default map at default zoom
  does not approach this.
- **User-Agent:** MapLibre sends a browser User-Agent; no special UA tricks.

### Production considerations

- **Cache tiles:** rely on HTTP caching and consider a service worker / CDN
  cache for tile responses so repeat views do not re-hit OSM.
- **Prefer a tile provider for scale:** if the map becomes heavily used,
  switch to a hosted tile provider (MapTiler, Stadia, or self-hosted vector
  tiles) to avoid load on OSM and to gain vector styling. The style is a
  single object in `MapContainer` — the swap point is localized.
- **Offline/coverage fallback:** the map is client-side only; there is no
  server-side tile proxy in the static beta.

---

## Coordinate precision rules

`LocationPrecision` is one of
`"country" | "region" | "city" | "district" | "exact" | "safe"`.

### Sensitive types — never exact

These `locationType` values must **never** be published with exact coordinates.
`safeCoordinate` enforces this automatically for any feature with these types
(regardless of `isSensitive`):

```
shelter, safe_house, medical_facility, aid_distribution_point,
checkpoint, witness_location, individual_home
```

`school` and `hospital` are treated as sensitive in the infrastructure data
(they carry `isSensitive: true`); the `SENSITIVE_LOCATION_TYPES` set is the
AI-pipeline canonical list and is mirrored in
`src/lib/ai/stages/GeographicExtractor.ts`.

### Downgrade map

For a sensitive feature, the display precision is derived from the source
precision:

| Source precision | Display precision |
|---|---|
| `exact` | `safe` (jittered ~±35 km) |
| `district` | `city` (jittered ~±10 km) |
| `city` | `city` (jittered ~±10 km) |
| `region` | `region` (jittered ~±20 km) |
| `country` | `country` (no jitter — already imprecise) |
| `safe` | `safe` |

Non-sensitive features are displayed at their `sourcePrecision` unchanged.

### Jitter

Jitter is applied only to sensitive features, sized by display precision
(see "Safety enforcement" above). It is deterministic (seeded per coordinate +
session) so that tests are reproducible and repeated page loads are stable.

### Popup disclosure

`MapPopup` displays the applied `safePrecision` on each feature (e.g.
"`city` precision") so users understand why markers are not exact. The
`PageStatusNotice` on the map page discloses the policy up front.

---

## Testing approach

Map tests follow the existing Vitest + Testing Library conventions
(`jsdom`, `src/test-setup.ts`). See `docs/quality-and-testing.md` for the
general test structure and CI flow.

### Lib unit tests — `src/lib/map/__tests__/`

Pure functions are tested directly, without mocks:

| File | Covers |
|---|---|
| `safety.test.ts` | `safeCoordinate` pass-through, downgrade (`exact→safe`, `district→city`), jitter bounds, `SENSITIVE_LOCATION_TYPES`, `makeRawCoordinate` |
| `sources.test.ts` | `createGeoJSONSource` — FeatureCollection shape, feature properties, `[lng, lat]` swap, empty input |
| `layers.test.ts` | `createLayerSpec` circle/fill + paint + initial visibility, `getLayerStyle` fallback, category color maps |
| `layerDefinitions.test.ts` | Each `build*LayerConfig` — `id`, `group`, `defaultVisible`, sub-layer generation |
| `timeline.test.ts` | `filterFeaturesByDateRange`, `getDateRange`, `generateTimelineSteps` (undated inclusion, edge cases) |

### Data safety tests — `src/data/__tests__/mapSafety.test.ts`

Guards the static data contract: for every sensitive location type, the safety
function must never return `exact` precision. If a data file is added, this
fixture list is the place to extend validation.

### Component mock tests — `src/components/map/__tests__/`

Components are tested with a **mocked `maplibre-gl` module** because jsdom has
no WebGL. The mock (see `MapContainer.test.tsx` for the canonical form) uses a
constructable `function` mock, shares one mock between `default.Map` and the
named `Map` export, and fires the `"load"` event synchronously so the context
becomes non-null. Components that need map API surface (e.g. `MapLayer`,
`MapSearch`) inject a `vi.fn()`-based fake map via `MapContext.Provider`.

| File | Covers |
|---|---|
| `MapContainer.test.tsx` | map init with default/custom viewport, context exposure, children, unmount cleanup |
| `MapLayer.test.tsx` | adds source + layer, zero-render (`null`), unmount cleanup, visibility prop → `setLayoutProperty`, no-op when `map` is null, async add once map arrives |
| `MapControls.test.tsx` | zoom in/out/reset buttons call the map API; no crash when `map` is null |
| `MapLegend.test.tsx` | renders only visible layers, groups by `LayerGroup`, empty state |
| `MapPopup.test.tsx` | renders nothing when no feature selected |
| `MapFilters.test.tsx` | unique category/source-type/verification checkboxes, AND-logic emission, date range, clear-all |
| `MapSearch.test.tsx` | debounce (fake timers), fuzzy matching, result rendering, `panTo` on select |
| `MapTimeline.test.tsx` | date-range derivation, slider, play/animation, speed, reduced-motion |
| `LayerGroupControl.test.tsx` | per-layer checkboxes, group toggle, sub-layer rendering |

### Integration / route smoke tests

`src/pages/__tests__/routeSmoke.test.tsx` renders `MapPage` (and every other
route) inside a `MemoryRouter`, with both `framer-motion` and `maplibre-gl`
mocked. It asserts the map page renders its heading, search, and filter UI.
Because the map page is lazy-loaded in `App.tsx`, the smoke test imports the
page component directly.

### Running the map test suite

```bash
npx vitest run src/components/map src/lib/map src/data/__tests__/mapSafety.test.ts
npx vitest run src/pages/__tests__/routeSmoke.test.tsx
```

---

## Route and code splitting

`/map` is registered in `src/App.tsx` as a **lazy-loaded route**:

```ts
const MapPage = lazy(() => import("./pages/MapPage"));

// …
<Route path="/map" element={<MapPage />} />
```

- `MapPage` uses a default export, so `lazy(() => import("./pages/MapPage"))`
  works directly (no `.then(m => ({ default: m.Name }))` wrapper needed).
- The lazy page sits inside the existing
  `<Suspense fallback={<RouteLoadingFallback />}>` boundary that wraps all
  routes, so navigating to `/map` shows the shared loading fallback while the
  chunk loads.
- Because the page — and only the page — imports `maplibre-gl`, the MapLibre
  runtime is **excluded from the initial bundle**. `maplibre-gl` (and its CSS)
  is pulled into the `/map` chunk and loaded on first navigation to `/map`.
- `src/data/routeMetadata.ts` defines the `/map` entry (title, description,
  canonical path, OG metadata) used by `DocumentHead`.

The Vite build (`vite.config.ts`) further splits stable third-party code into
`vendor-react`, `vendor-motion`, and `vendor-i18n` manual chunks so the map
page doesn't pay for libraries it doesn't use and shared vendors get long-term
caching. `chunkSizeWarningLimit` is raised to 400 kB to surface meaningful size
regressions.

### Why page-level splitting matters here

`maplibre-gl` is the single largest runtime dependency in the app. Lazy-loading
the map page means:

- first paint of the home page and content routes is unaffected by the map
  library;
- the map's JS/CSS only downloads when a visitor actually opens the map;
- the rest of the app can evolve independently of map bundle size.

If the map grows more layers or heavier data, keep the page-level split as the
boundary and profile the map chunk (`npm run build` prints chunk sizes).
