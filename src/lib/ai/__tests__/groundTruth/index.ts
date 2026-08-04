/**
 * Ground truth datasets for AI pipeline testing.
 * Re-exports all datasets for convenient imports.
 */

export { summarizationGroundTruth } from "./summarization";
export type { SummarizationTestCase } from "./summarization";

export { entityExtractionGroundTruth } from "./entityExtraction";
export type { EntityTestCase } from "./entityExtraction";

export { claimExtractionGroundTruth } from "./claimExtraction";
export type { ClaimTestCase } from "./claimExtraction";

export { timelineExtractionGroundTruth } from "./timelineExtraction";
export type { TimelineTestCase } from "./timelineExtraction";

export { geographicExtractionGroundTruth } from "./geographicExtraction";
export type { GeographicTestCase } from "./geographicExtraction";

export { contradictionDetectionGroundTruth } from "./contradictionDetection";
export type { ContradictionTestCase } from "./contradictionDetection";

export { hallucinationDetectionGroundTruth } from "./hallucinationDetection";
export type { HallucinationTestCase } from "./hallucinationDetection";
