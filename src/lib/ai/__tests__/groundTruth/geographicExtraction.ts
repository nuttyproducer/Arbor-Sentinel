/**
 * Ground truth dataset for geographic extraction stage.
 * Tests precision level enforcement and safe coordinate output.
 */

export interface GeographicTestCase {
  id: string;
  sourceText: string;
  expected: Array<{
    location: string;
    precisionLevel: "city" | "district" | "region" | "country" | "approximate";
    coordinates?: { lat: number; lng: number };
    safeName: string;
  }>;
  /** Expected sensitivity: should coordinates be rounded? */
  expectCoordinateRounding: boolean;
}

export const geographicExtractionGroundTruth: GeographicTestCase[] = [
  {
    id: "geo-001",
    sourceText:
      "The incident occurred in the city of Testville, North Test Province. " +
      "Additional events were reported in South Test City.",
    expectCoordinateRounding: false,
    expected: [
      { location: "Testville", precisionLevel: "city", safeName: "Testville, North Test Province" },
      { location: "South Test City", precisionLevel: "city", safeName: "South Test City" },
    ],
  },
  {
    id: "geo-002",
    sourceText:
      "Attacks were documented at coordinates 31.5067° N, 34.4567° E near a " +
      "refugee camp, and at 31.5089° N, 34.4600° E near a medical facility.",
    expectCoordinateRounding: true,
    expected: [
      {
        location: "near 31.5° N, 34.5° E",
        precisionLevel: "approximate",
        coordinates: { lat: 31.5, lng: 34.5 },
        safeName: "Near 31.5°N 34.5°E (approximate)",
      },
      {
        location: "near 31.5° N, 34.5° E",
        precisionLevel: "approximate",
        coordinates: { lat: 31.5, lng: 34.5 },
        safeName: "Near 31.5°N 34.5°E (approximate)",
      },
    ],
  },
  {
    id: "geo-003",
    sourceText:
      "The situation affected the entire Test Region, with particularly severe " +
      "impact in the Eastern District and the Northern Sub-district Delta.",
    expectCoordinateRounding: false,
    expected: [
      { location: "Test Region", precisionLevel: "region", safeName: "Test Region" },
      { location: "Eastern District", precisionLevel: "district", safeName: "Eastern District, Test Region" },
      { location: "Northern Sub-district Delta", precisionLevel: "district", safeName: "Northern Sub-district Delta, Test Region" },
    ],
  },
  {
    id: "geo-004",
    sourceText:
      "Hospitals reported patients from the area around 32.1234° N, 35.5678° E. " +
      "A school located at exact coordinates 32.0001° N, 35.0001° E was damaged.",
    expectCoordinateRounding: true,
    expected: [
      {
        location: "near 32.1° N, 35.6° E",
        precisionLevel: "approximate",
        coordinates: { lat: 32.1, lng: 35.6 },
        safeName: "Near 32.1°N 35.6°E (approximate region)",
      },
      {
        location: "near 32.0° N, 35.0° E",
        precisionLevel: "approximate",
        coordinates: { lat: 32.0, lng: 35.0 },
        safeName: "Near 32.0°N 35.0°E (approximate region)",
      },
    ],
  },
];
