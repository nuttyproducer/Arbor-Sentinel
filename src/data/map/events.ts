import type { MapFeature } from "../../lib/map/types";
import { safeCoordinate, makeRawCoordinate } from "../../lib/map/utils/safety";

function safed(lat: number, lon: number, locationType: string, isSensitive: boolean, sourcePrecision: Parameters<typeof safeCoordinate>[1]["sourcePrecision"]) {
  return safeCoordinate(makeRawCoordinate(lat, lon), { locationType, isSensitive, sourcePrecision });
}

export const eventFeatures: MapFeature[] = [
  // ICJ public hearings — public building, city-level is fine
  {
    id: "evt-icj-provisional-measures-jan-2024",
    type: "event",
    category: "legal_proceeding",
    title: "ICJ Provisional Measures Order (South Africa v. Israel)",
    safeCoordinate: safed(52.0866, 4.2955, "courthouse", false, "city"),
    date: "2024-01-26",
    description: "The International Court of Justice issued provisional measures in the case concerning Application of the Convention on the Prevention and Punishment of the Crime of Genocide in the Gaza Strip.",
    sourceIds: ["icj-case-192"],
    severity: "notable",
    confidence: 5,
    isSensitive: false,
  },
  {
    id: "evt-icj-advisory-opinion-jul-2024",
    type: "event",
    category: "legal_proceeding",
    title: "ICJ Advisory Opinion on Legal Consequences of Israeli Policies and Practices in the Occupied Palestinian Territory",
    safeCoordinate: safed(52.0866, 4.2955, "courthouse", false, "city"),
    date: "2024-07-19",
    description: "The ICJ delivered its advisory opinion regarding legal consequences arising from the policies and practices of Israel in the Occupied Palestinian Territory, including East Jerusalem.",
    sourceIds: ["icj-advisory-opinion"],
    severity: "notable",
    confidence: 5,
    isSensitive: false,
  },
  // ICC — public building, city-level
  {
    id: "evt-icc-arrest-warrants-nov-2024",
    type: "event",
    category: "legal_proceeding",
    title: "ICC Arrest Warrants Issued",
    safeCoordinate: safed(52.0678, 4.3524, "courthouse", false, "city"),
    date: "2024-11-21",
    description: "The International Criminal Court issued arrest warrants related to the situation in the State of Palestine.",
    sourceIds: ["icc-palestine"],
    severity: "severe",
    confidence: 5,
    isSensitive: false,
  },
  // UN General Assembly — public building, city-level
  {
    id: "evt-unga-resolution-dec-2024",
    type: "event",
    category: "political_development",
    title: "UN General Assembly Resolution on Gaza Ceasefire",
    safeCoordinate: safed(40.7489, -73.9680, "government_building", false, "city"),
    date: "2024-12-11",
    description: "The UN General Assembly adopted a resolution demanding an immediate, unconditional, and permanent ceasefire in Gaza.",
    sourceIds: ["un-news"],
    severity: "notable",
    confidence: 5,
    isSensitive: false,
  },
];
