// Types
export type {
  AIOperationResult,
  SourceSpan,
  AIProvider,
  AIRequest,
  AIResponse,
  AIMessage,
  MessageRole,
  AIErrorType,
  AIError,
  AILogEntry,
  ModelConfig,
  ModelRoute,
  PromptTemplate,
  PipelineContext,
  AIContent,
  AIProcessedContent,
  AIStage,
  StageDefinition,
  AIPipelineConfig,
} from "./types";

export { successResult, emptyResult } from "./types";

// Provider
export { OpenAICompatibleAdapter, createMockProvider } from "./provider";
export type { OpenAICompatibleConfig } from "./provider";

// Core infrastructure
export { Logger } from "./Logger";
export { ErrorHandler, AIRequestError } from "./ErrorHandler";
export type { RetryConfig } from "./ErrorHandler";
export { RateLimiter, DEFAULT_RATE_LIMITS } from "./RateLimiter";
export type { RateLimiterConfig } from "./RateLimiter";
export { PromptManager } from "./PromptManager";
export { ModelRouter, DEFAULT_MODEL_CONFIG, DEFAULT_ROUTES } from "./ModelRouter";
export { StructuredOutputHandler } from "./StructuredOutputHandler";
export type { StructuredOutputOptions } from "./StructuredOutputHandler";

// Pipeline
export { AIPipeline, createStage, createPipelineContext } from "./AIPipeline";

// Stage types
export type {
  DetectionResult,
  TranslationResult,
  TranslationRiskClassification,
  RiskLevel,
  SummaryResult,
  SummaryType,
  FactExtraction,
  ExtractedEntity,
  EntityType,
  EntityLink,
  ExtractedClaim,
  ClaimType,
  ClaimVerificationStatus,
  TimelineEvent,
  DatePrecision,
  ExtractedLocation,
  LocationPrecision,
  GeoJSONFeature,
  EntityRelationship,
  RelationshipType,
  RelationshipDirection,
  RelationshipStrength,
  TopicClassification,
  DuplicateGroup,
  MergeProposal,
  MatchLevel,
  ContradictionReport,
  ContradictionType,
  ContradictionSeverity,
  ResolutionState,
  ConfidenceReport,
  HallucinationFlag,
  HallucinationSeverity,
  HallucinationFlagType,
} from "./stages/types";

// Stages
export { languageDetectorStage } from "./stages/LanguageDetector";
export { translatorStage } from "./stages/Translator";
export { translationReviewerStage } from "./stages/TranslationReviewer";
export { summarizerStage } from "./stages/Summarizer";
export { entityExtractorStage } from "./stages/EntityExtractor";
export { claimExtractorStage } from "./stages/ClaimExtractor";
export { timelineExtractorStage } from "./stages/TimelineExtractor";
export { geographicExtractorStage } from "./stages/GeographicExtractor";
export { relationshipDetectorStage } from "./stages/RelationshipDetector";
export { topicClassifierStage } from "./stages/TopicClassifier";
export { duplicateDetectorStage } from "./stages/DuplicateDetector";
export { contradictionDetectorStage } from "./stages/ContradictionDetector";
export { confidenceEstimatorStage } from "./stages/ConfidenceEstimator";
export { hallucinationDetectorStage } from "./stages/HallucinationDetector";
