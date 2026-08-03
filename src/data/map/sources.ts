import type { MapFeature } from "../../lib/map/types";
import { safeCoordinate, makeRawCoordinate } from "../../lib/map/utils/safety";

function safed(lat: number, lon: number) {
  return safeCoordinate(makeRawCoordinate(lat, lon), { locationType: "institution_hq", isSensitive: false, sourcePrecision: "city" });
}

export const sourceFeatures: MapFeature[] = [
  {
    id: "src-icj",
    type: "source",
    category: "court",
    title: "International Court of Justice",
    safeCoordinate: safed(52.0866, 4.2955),
    sourceIds: [],
    isSensitive: false,
  },
  {
    id: "src-icc",
    type: "source",
    category: "court",
    title: "International Criminal Court",
    safeCoordinate: safed(52.0678, 4.3524),
    sourceIds: [],
    isSensitive: false,
  },
  {
    id: "src-un-hq",
    type: "source",
    category: "un_body",
    title: "United Nations Headquarters",
    safeCoordinate: safed(40.7489, -73.9680),
    sourceIds: [],
    isSensitive: false,
  },
  {
    id: "src-un-hrc",
    type: "source",
    category: "un_body",
    title: "UN Human Rights Council",
    safeCoordinate: safed(46.2253, 6.1416),
    sourceIds: [],
    isSensitive: false,
  },
];
