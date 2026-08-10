import { CompensationPeriod } from './professional-profile';

// Aggregate only — never a list of individual figures. `sampleSize` lets the UI show "based on
// N similar profiles" without ever exposing which members contributed to it.
export interface SalaryBenchmarkRange {
  readonly low: number;
  readonly high: number;
  readonly currency: string;
  readonly period: CompensationPeriod;
  readonly sampleSize: number;
}

export interface SalaryBenchmarkQuery {
  readonly expertiseAreas: readonly string[];
  readonly currency: string;
  readonly period: CompensationPeriod;
}
