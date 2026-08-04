import type { MapFeature } from "../../lib/map/types";
import { safeCoordinate, makeRawCoordinate } from "../../lib/map/utils/safety";

function safed(lat: number, lon: number, locationType: string, isSensitive: boolean, sourcePrecision: Parameters<typeof safeCoordinate>[1]["sourcePrecision"]) {
  return safeCoordinate(makeRawCoordinate(lat, lon), { locationType, isSensitive, sourcePrecision });
}

/**
 * Court locations (public buildings, city-level) and jurisdiction regions
 * (region-level centroids). No sensitive coordinates.
 */
export const legalFeatures: MapFeature[] = [
  // ── International courts — public buildings, city-level ───────────────
  {
    id: "leg-icj",
    type: "legal",
    category: "international_court",
    title: "International Court of Justice — Peace Palace (The Hague)",
    safeCoordinate: safed(52.0866, 4.2955, "courthouse", false, "city"),
    description: "The principal judicial organ of the United Nations, seated at the Peace Palace in The Hague, Netherlands. Hearings related to the Genocide Convention case and the advisory opinion on the Occupied Palestinian Territory took place here.",
    sourceIds: ["icj-case-192"],
    isSensitive: false,
    confidence: 5,
  },
  {
    id: "leg-icc",
    type: "legal",
    category: "international_court",
    title: "International Criminal Court (The Hague)",
    safeCoordinate: safed(52.0678, 4.3524, "courthouse", false, "city"),
    description: "The permanent international court seated in The Hague, Netherlands, prosecuting individuals for genocide, war crimes, and crimes against humanity under the Rome Statute.",
    sourceIds: ["icc-palestine-2024"],
    isSensitive: false,
    confidence: 5,
  },
  // ── Regional courts ───────────────────────────────────────────────────
  {
    id: "leg-echr",
    type: "legal",
    category: "regional_court",
    title: "European Court of Human Rights (Strasbourg)",
    safeCoordinate: safed(48.5734, 7.7521, "courthouse", false, "city"),
    description: "The European Court of Human Rights, seated in Strasbourg, France, hears applications alleging violations of the European Convention on Human Rights.",
    sourceIds: ["eu-council"],
    isSensitive: false,
    confidence: 5,
  },
  {
    id: "leg-cjeu",
    type: "legal",
    category: "regional_court",
    title: "Court of Justice of the European Union (Luxembourg)",
    safeCoordinate: safed(49.6116, 6.1319, "courthouse", false, "city"),
    description: "The judicial institution of the European Union, seated in Luxembourg, interpreting EU law and reviewing the legality of EU acts.",
    sourceIds: ["eu-council"],
    isSensitive: false,
    confidence: 5,
  },
  // ── Domestic courts ───────────────────────────────────────────────────
  {
    id: "leg-brussels-court",
    type: "legal",
    category: "domestic_court",
    title: "Brussels Courts (Brussels)",
    safeCoordinate: safed(50.8503, 4.3517, "courthouse", false, "city"),
    description: "Brussels-based courts including the Court of First Instance, which have heard cases concerning arms-export control and alleged violations related to the occupied Palestinian territory.",
    sourceIds: ["belgium-flanders-court-2025-07"],
    isSensitive: false,
    confidence: 4,
  },
  {
    id: "leg-cassation",
    type: "legal",
    category: "domestic_court",
    title: "Belgium Court of Cassation (Brussels)",
    safeCoordinate: safed(50.8503, 4.3517, "courthouse", false, "city"),
    description: "The highest court in the Belgian judicial system, seated in Brussels, with jurisdiction over final appeals in civil, criminal, and administrative matters.",
    sourceIds: ["belgium-flanders-court-2025-07"],
    isSensitive: false,
    confidence: 4,
  },
  // ── Jurisdiction regions — region-level centroids ─────────────────────
  {
    id: "leg-jurisdiction-opt",
    type: "legal",
    category: "jurisdiction_region",
    title: "Occupied Palestinian Territory (jurisdiction region)",
    safeCoordinate: safed(31.9, 34.9, "jurisdiction_region", false, "region"),
    description: "The occupied Palestinian territory, including the Gaza Strip and the West Bank including East Jerusalem — the territorial scope of the ICJ proceedings, the ICC situation, and the UN Commission of Inquiry mandate.",
    sourceIds: ["icj-case-192"],
    isSensitive: false,
    confidence: 5,
  },
  {
    id: "leg-jurisdiction-gaza",
    type: "legal",
    category: "jurisdiction_region",
    title: "Gaza Strip (jurisdiction region)",
    safeCoordinate: safed(31.4, 34.4, "jurisdiction_region", false, "region"),
    description: "The Gaza Strip — a densely populated coastal territory subject to the ICJ provisional-measures orders, the ICC situation in the State of Palestine, and repeated UN fact-finding.",
    sourceIds: ["icj-2024-01-26"],
    isSensitive: false,
    confidence: 5,
  },
  {
    id: "leg-jurisdiction-west-bank",
    type: "legal",
    category: "jurisdiction_region",
    title: "West Bank including East Jerusalem (jurisdiction region)",
    safeCoordinate: safed(31.9, 35.2, "jurisdiction_region", false, "region"),
    description: "The West Bank, including East Jerusalem — the subject of the ICJ advisory opinion on legal consequences arising from Israeli policies and practices in the Occupied Palestinian Territory.",
    sourceIds: ["icj-advisory-opinion"],
    isSensitive: false,
    confidence: 5,
  },
];
