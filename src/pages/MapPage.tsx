// src/pages/MapPage.tsx
import { useMemo, useState } from "react";
import { Container } from "../components/ui/Container";
import { PageIntro } from "../components/pages/PageIntro";
import { PageStatusNotice } from "../components/pages/PageStatusNotice";
import { MapContainer } from "../components/map/MapContainer";
import { MapLayer } from "../components/map/MapLayer";
import { LayerGroupControl } from "../components/map/LayerGroupControl";
import { MapControls } from "../components/map/MapControls";
import { MapLegend } from "../components/map/MapLegend";
import { MapPopup } from "../components/map/MapPopup";
import { MapSearch } from "../components/map/MapSearch";
import { MapFilters, type FilterState } from "../components/map/MapFilters";
import { MapTimeline } from "../components/map/MapTimeline";
import { buildEventLayerConfig } from "../lib/map/layers/EventLayer";
import { buildSourceLayerConfig } from "../lib/map/layers/SourceLayer";
import { buildOrganizationLayerConfig } from "../lib/map/layers/OrganizationLayer";
import { buildLegalLayerConfig } from "../lib/map/layers/LegalLayer";
import { buildInfrastructureLayerConfig } from "../lib/map/layers/InfrastructureLayer";
import { filterFeaturesByDateRange } from "../lib/map/utils/timeline";
import type { MapFeature, MapLayerConfig } from "../lib/map/types";
import { eventFeatures } from "../data/map/events";
import { sourceFeatures } from "../data/map/sources";
import { organizationFeatures } from "../data/map/organizations";
import { legalFeatures } from "../data/map/legal";
import { infrastructureFeatures } from "../data/map/infrastructure";

/** Every feature the map can display, in a single stable array. */
const ALL_FEATURES: MapFeature[] = [
  ...eventFeatures,
  ...sourceFeatures,
  ...organizationFeatures,
  ...legalFeatures,
  ...infrastructureFeatures,
];

function createEmptyFilters(): FilterState {
  return {
    categories: new Set<string>(),
    sourceTypes: new Set<string>(),
    verificationLevels: new Set<string>(),
    dateStart: "",
    dateEnd: "",
    layerIds: new Set<string>(),
  };
}

/**
 * Interactive map of documented events, sources, organizations, legal
 * jurisdictions, and humanitarian infrastructure.
 *
 * Reads static data from `data/map/`, builds a MapLayerConfig per feature
 * type, and composes the map UI primitives. The timeline range and the
 * filter panel are applied to the feature set before layer configs are
 * built, so the rendered layers reflect the active view.
 */
export default function MapPage() {
  const [range, setRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [filters, setFilters] = useState<FilterState>(createEmptyFilters);

  // Combine timeline range and filter-panel state into the feature set used
  // to build layer configs. Undated features are always retained (they could
  // belong to any date).
  const visibleFeatures = useMemo(() => {
    let result = ALL_FEATURES;
    result = filterFeaturesByDateRange(result, range.start, range.end);
    result = filterFeaturesByDateRange(result, filters.dateStart, filters.dateEnd);
    if (filters.categories.size > 0) {
      result = result.filter((f) => filters.categories.has(f.category));
    }
    if (filters.sourceTypes.size > 0) {
      result = result.filter((f) => filters.sourceTypes.has(f.type));
    }
    return result;
  }, [range, filters]);

  const eventConfig = useMemo(
    () => buildEventLayerConfig(visibleFeatures),
    [visibleFeatures],
  );
  const sourceConfig = useMemo(
    () => buildSourceLayerConfig(visibleFeatures),
    [visibleFeatures],
  );
  const organizationConfig = useMemo(
    () => buildOrganizationLayerConfig(visibleFeatures),
    [visibleFeatures],
  );
  const legalConfig = useMemo(
    () => buildLegalLayerConfig(visibleFeatures),
    [visibleFeatures],
  );
  const infrastructureConfig = useMemo(
    () => buildInfrastructureLayerConfig(visibleFeatures),
    [visibleFeatures],
  );

  const allLayerConfigs = useMemo<MapLayerConfig[]>(
    () => [
      eventConfig,
      sourceConfig,
      organizationConfig,
      legalConfig,
      infrastructureConfig,
    ],
    [eventConfig, sourceConfig, organizationConfig, legalConfig, infrastructureConfig],
  );

  return (
    <Container className="py-16 lg:py-20">
      <PageIntro
        eyebrow="Map"
        title="Interactive Map"
        description="Interactive map of documented events, sources, organizations, legal jurisdictions, and humanitarian infrastructure — all coordinates at safe precision."
      />

      <PageStatusNotice
        label="Safe precision"
        title="Coordinates are deliberately imprecise"
      >
        <p>
          Every marker on this map is placed at a reduced level of precision to
          protect people and sites. Hospitals, schools, and other sensitive
          infrastructure are jittered to city level before publication — exact
          coordinates are never shown.
        </p>
      </PageStatusNotice>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Map ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 relative h-[500px] lg:h-[600px] overflow-hidden rounded-lg border border-charcoal/20 bg-bone">
          <MapContainer layerConfigs={allLayerConfigs}>
            <MapLayer config={eventConfig} visible={eventConfig.defaultVisible} />
            <MapLayer config={sourceConfig} visible={sourceConfig.defaultVisible} />
            <MapLayer config={organizationConfig} visible={organizationConfig.defaultVisible} />
            <MapLayer config={legalConfig} visible={legalConfig.defaultVisible} />
            <MapLayer config={infrastructureConfig} visible={infrastructureConfig.defaultVisible} />
            <MapControls />
            <MapLegend layers={allLayerConfigs} />
            <MapPopup />
            <MapTimeline
              features={ALL_FEATURES}
              onRangeChange={(start, end) => setRange({ start, end })}
            />
          </MapContainer>
        </div>

        {/* ── Layers + search + filters ───────────────────────────────── */}
        <div className="space-y-6">
          <LayerGroupControl layers={allLayerConfigs} />
          <MapSearch features={ALL_FEATURES} />
          <MapFilters features={ALL_FEATURES} onFiltersChange={setFilters} />
        </div>
      </div>
    </Container>
  );
}
