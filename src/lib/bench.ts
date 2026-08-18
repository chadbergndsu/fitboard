/**
 * BenchAlert helpers — surface candidates finishing soon and match them
 * to open roles via the open FitScore engine (no paid APIs).
 */

import {
  computeFitScore,
  type Candidate,
  type FitScoreResult,
  type JobReq,
} from "./fitscore";
import type { BenchCandidate } from "./data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BenchWindowOptions {
  /** Inclusive window in days from `asOf` (default 30). */
  withinDays?: number;
  /** Reference date (default: today UTC midnight). ISO or Date. */
  asOf?: string | Date;
}

export interface BenchMatch {
  candidate: BenchCandidate;
  /** Days until endDate from asOf (can be 0 if ending today). */
  daysUntilEnd: number;
  endDate: string;
  /** Best FitScore matches against provided open jobs. */
  matches: Array<{
    job: JobReq;
    fit: FitScoreResult;
  }>;
  /** Highest score among matches (0 if none). */
  bestScore: number;
}

export interface BenchAlertSummary {
  asOf: string;
  withinDays: number;
  finishing: BenchCandidate[];
  alerts: BenchMatch[];
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function toUtcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function parseDate(input: string | Date): Date {
  if (input instanceof Date) return toUtcMidnight(input);
  // Expect ISO YYYY-MM-DD or full ISO; treat date-only as UTC
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, day] = input.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, day));
  }
  return toUtcMidnight(new Date(input));
}

function daysBetween(from: Date, to: Date): number {
  const ms = toUtcMidnight(to).getTime() - toUtcMidnight(from).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function asIsoDate(d: Date): string {
  return toUtcMidnight(d).toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Candidates whose assignment endDate falls within the next N days
 * (inclusive of asOf and asOf+N). Past end dates are excluded.
 */
export function candidatesFinishingWithin(
  bench: BenchCandidate[],
  options: BenchWindowOptions = {},
): BenchCandidate[] {
  const withinDays = options.withinDays ?? 30;
  const asOf = parseDate(options.asOf ?? new Date());

  return bench
    .filter((c) => {
      const end = parseDate(c.endDate);
      const days = daysBetween(asOf, end);
      return days >= 0 && days <= withinDays;
    })
    .sort((a, b) => parseDate(a.endDate).getTime() - parseDate(b.endDate).getTime());
}

/**
 * Days until a bench candidate's endDate from asOf (negative if already ended).
 */
export function daysUntilBenchEnd(
  candidate: BenchCandidate,
  asOf: string | Date = new Date(),
): number {
  return daysBetween(parseDate(asOf), parseDate(candidate.endDate));
}

/**
 * Match a single bench candidate to open jobs using FitScore.
 * Returns results sorted by score descending.
 */
export function matchBenchCandidateToJobs(
  candidate: BenchCandidate | Candidate,
  openJobs: JobReq[],
  options: { minScore?: number; limit?: number } = {},
): Array<{ job: JobReq; fit: FitScoreResult }> {
  const minScore = options.minScore ?? 0;
  const limit = options.limit ?? openJobs.length;

  return openJobs
    .map((job) => ({
      job,
      fit: computeFitScore(candidate, job),
    }))
    .filter((m) => m.fit.score >= minScore)
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, limit);
}

/**
 * Build BenchAlert rows: finishing-soon candidates + top FitScore job matches.
 */
export function buildBenchAlerts(
  bench: BenchCandidate[],
  openJobs: JobReq[],
  options: BenchWindowOptions & {
    minScore?: number;
    matchesPerCandidate?: number;
    /** Only jobs with status open (or undefined). Default true. */
    openOnly?: boolean;
  } = {},
): BenchMatch[] {
  const finishing = candidatesFinishingWithin(bench, options);
  const asOf = parseDate(options.asOf ?? new Date());
  const minScore = options.minScore ?? 50;
  const matchesPerCandidate = options.matchesPerCandidate ?? 3;
  const openOnly = options.openOnly ?? true;

  const jobs = openOnly
    ? openJobs.filter((j) => !j.status || j.status === "open")
    : openJobs;

  return finishing.map((candidate) => {
    const matches = matchBenchCandidateToJobs(candidate, jobs, {
      minScore,
      limit: matchesPerCandidate,
    });
    const bestScore = matches[0]?.fit.score ?? 0;
    return {
      candidate,
      daysUntilEnd: daysBetween(asOf, parseDate(candidate.endDate)),
      endDate: candidate.endDate,
      matches,
      bestScore,
    };
  });
}

/**
 * Full BenchAlert summary for dashboards.
 * Alerts are sorted by earliest end date, then best FitScore.
 */
export function getBenchAlertSummary(
  bench: BenchCandidate[],
  openJobs: JobReq[],
  options: BenchWindowOptions & {
    minScore?: number;
    matchesPerCandidate?: number;
    openOnly?: boolean;
  } = {},
): BenchAlertSummary {
  const withinDays = options.withinDays ?? 30;
  const asOfDate = parseDate(options.asOf ?? new Date());
  const finishing = candidatesFinishingWithin(bench, {
    withinDays,
    asOf: asOfDate,
  });
  const alerts = buildBenchAlerts(bench, openJobs, options).sort((a, b) => {
    if (a.daysUntilEnd !== b.daysUntilEnd) {
      return a.daysUntilEnd - b.daysUntilEnd;
    }
    return b.bestScore - a.bestScore;
  });

  return {
    asOf: asIsoDate(asOfDate),
    withinDays,
    finishing,
    alerts,
  };
}

/**
 * True if candidate should fire a BenchAlert (within window and has a match).
 */
export function shouldAlert(
  candidate: BenchCandidate,
  openJobs: JobReq[],
  options: BenchWindowOptions & { minScore?: number } = {},
): boolean {
  const withinDays = options.withinDays ?? 30;
  const asOf = parseDate(options.asOf ?? new Date());
  const days = daysBetween(asOf, parseDate(candidate.endDate));
  if (days < 0 || days > withinDays) return false;

  const minScore = options.minScore ?? 50;
  const jobs = openJobs.filter((j) => !j.status || j.status === "open");
  return matchBenchCandidateToJobs(candidate, jobs, { minScore, limit: 1 }).length > 0;
}
