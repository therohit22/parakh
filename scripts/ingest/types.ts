export type EntityType = "companies" | "questions";

export interface IngestionOptions {
  filePath: string;
  type?: EntityType;
  dryRun?: boolean;
}

export interface IngestionFailure {
  identifier: string; // row or index reference, e.g. "Row 2" or "Item 0"
  slug?: string;
  reason: string;
}

export interface IngestionReport {
  entityType: EntityType;
  filePath: string;
  dryRun: boolean;
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  failures: IngestionFailure[];
}
