// ============================================================
// RailAvail – Block Planning Optimization Engine
// Rule-based scoring algorithm (designed for ML replacement)
//
// Architecture:
//   1. Clustering   – group requests by geographic proximity
//   2. Windowing    – find low-traffic time windows per cluster
//   3. Compatibility – check department & resource constraints
//   4. Scoring      – multi-factor weighted optimization score
//   5. Scheduling   – produce final optimized block schedule
// ============================================================

import type { MaintenanceRequest, MaintenanceBlock, Conflict, OptimizationResult } from '../types';
import { TRAFFIC_WINDOWS } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// ── SCORING WEIGHTS (sum = 1.0) ───────────────────────────
const WEIGHTS = {
  locationProximity: 0.30,
  timeWindowEfficiency: 0.25,
  trafficImpactReduction: 0.20,
  resourceConsolidation: 0.15,
  priorityAlignment: 0.10,
};

// ── DEPARTMENT COMPATIBILITY MATRIX ──────────────────────
// Defines which departments can safely work in the same block
const COMPATIBILITY: Record<string, string[]> = {
  Engineering: ['Engineering', 'Signal & Telecommunication', 'Traction Distribution'],
  'Traction Distribution': ['Engineering', 'Traction Distribution', 'Signal & Telecommunication'],
  'Signal & Telecommunication': ['Engineering', 'Signal & Telecommunication', 'Traction Distribution'],
  Operations: ['Operations'],
};

// ── PRIORITY WEIGHTS ──────────────────────────────────────
const PRIORITY_SCORE: Record<string, number> = {
  critical: 1.0,
  high: 0.75,
  medium: 0.50,
  low: 0.25,
};

// ─────────────────────────────────────────────────────────
// STEP 1: Cluster requests by section & date proximity
// ─────────────────────────────────────────────────────────
interface Cluster {
  sectionId: string;
  date: string;
  requests: MaintenanceRequest[];
}

function clusterRequests(requests: MaintenanceRequest[]): Cluster[] {
  const clusterMap: Record<string, Cluster> = {};

  for (const req of requests) {
    // Cluster key = sectionId + preferred date
    const key = `${req.sectionId}__${req.preferredDate}`;
    if (!clusterMap[key]) {
      clusterMap[key] = { sectionId: req.sectionId, date: req.preferredDate, requests: [] };
    }
    clusterMap[key].requests.push(req);
  }

  return Object.values(clusterMap);
}

// ─────────────────────────────────────────────────────────
// STEP 2: Find optimal maintenance window for a cluster
// Return the best 4-hour window with lowest avg traffic
// ─────────────────────────────────────────────────────────
function findOptimalWindow(durationHours: number): { startHour: number; score: number } {
  const windowSize = Math.ceil(durationHours);
  let bestStart = 1;
  let bestScore = 100;

  for (let start = 0; start <= 24 - windowSize; start++) {
    const windowIntensities = TRAFFIC_WINDOWS.slice(start, start + windowSize).map((w) => w.intensity);
    const avgIntensity = windowIntensities.reduce((a, b) => a + b, 0) / windowIntensities.length;
    if (avgIntensity < bestScore) {
      bestScore = avgIntensity;
      bestStart = start;
    }
  }

  return { startHour: bestStart, score: bestScore };
}

// ─────────────────────────────────────────────────────────
// STEP 3: Check km overlap between two requests
// ─────────────────────────────────────────────────────────
function kmsOverlap(a: MaintenanceRequest, b: MaintenanceRequest): boolean {
  return a.fromKm <= b.toKm && b.fromKm <= a.toKm;
}

// ─────────────────────────────────────────────────────────
// STEP 4: Check department compatibility
// ─────────────────────────────────────────────────────────
function areDepartmentsCompatible(depts: string[]): boolean {
  for (const dept of depts) {
    const compatible = COMPATIBILITY[dept] || [];
    for (const other of depts) {
      if (dept !== other && !compatible.includes(other)) return false;
    }
  }
  return true;
}

// ─────────────────────────────────────────────────────────
// STEP 5: Calculate optimization score for a group (0–100)
// ─────────────────────────────────────────────────────────
function calculateOptimizationScore(requests: MaintenanceRequest[], windowScore: number): number {
  // 1. Location proximity: how tightly do km ranges overlap?
  const kmRanges = requests.map((r) => r.toKm - r.fromKm);
  const overlapKm = Math.min(...requests.map((r) => r.toKm)) - Math.max(...requests.map((r) => r.fromKm));
  const totalKm = Math.max(...requests.map((r) => r.toKm)) - Math.min(...requests.map((r) => r.fromKm));
  const proximityScore = totalKm > 0 ? Math.min((overlapKm / totalKm) * 100, 100) : 50;

  // 2. Time window efficiency: inverse of traffic intensity
  const timeScore = 100 - windowScore;

  // 3. Traffic impact reduction: estimated from merging vs separate
  const separateHours = requests.reduce((a, r) => a + r.estimatedDuration, 0);
  const mergedHours = Math.max(...requests.map((r) => r.estimatedDuration));
  const trafficScore = Math.min(((separateHours - mergedHours) / separateHours) * 100, 100);

  // 4. Resource consolidation: unique departments
  const uniqueDepts = new Set(requests.map((r) => r.department)).size;
  const resourceScore = uniqueDepts > 1 ? Math.min(uniqueDepts * 30, 100) : 20;

  // 5. Priority alignment: average priority score
  const priorityScore =
    (requests.reduce((a, r) => a + PRIORITY_SCORE[r.priority] * 100, 0) / requests.length);

  const weighted =
    proximityScore * WEIGHTS.locationProximity +
    timeScore * WEIGHTS.timeWindowEfficiency +
    trafficScore * WEIGHTS.trafficImpactReduction +
    resourceScore * WEIGHTS.resourceConsolidation +
    priorityScore * WEIGHTS.priorityAlignment;

  return Math.round(Math.min(weighted, 100));
}

// ─────────────────────────────────────────────────────────
// STEP 6: Detect conflicts in requests and blocks
// ─────────────────────────────────────────────────────────
function detectConflicts(requests: MaintenanceRequest[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (let i = 0; i < requests.length; i++) {
    for (let j = i + 1; j < requests.length; j++) {
      const a = requests[i];
      const b = requests[j];

      if (a.sectionId !== b.sectionId) continue;

      // Track overlap on same section same day
      if (a.preferredDate === b.preferredDate && kmsOverlap(a, b)) {
        const deptCompatible = areDepartmentsCompatible([a.department, b.department]);

        if (!deptCompatible) {
          conflicts.push({
            id: uuidv4(),
            type: 'dept_incompatibility',
            severity: 'critical',
            title: `Department Incompatibility: ${a.department} & ${b.department}`,
            description: `${a.requestNumber} and ${b.requestNumber} involve departments that cannot safely work in the same block on ${a.preferredDate} at km ${Math.max(a.fromKm, b.fromKm)}–${Math.min(a.toKm, b.toKm)}.`,
            requestIds: [a.id, b.id],
            sectionId: a.sectionId,
            detectedAt: new Date().toISOString(),
            status: 'open',
            aiSuggestion: `Schedule ${a.requestNumber} and ${b.requestNumber} in separate time windows with at least a 2-hour gap to avoid safety conflicts.`,
          });
        } else {
          conflicts.push({
            id: uuidv4(),
            type: 'track_overlap',
            severity: 'high',
            title: `Track Overlap: ${a.department} & ${b.department} on ${a.sectionName}`,
            description: `${a.requestNumber} (${a.department}) and ${b.requestNumber} (${b.department}) overlap at km ${Math.max(a.fromKm, b.fromKm)}–${Math.min(a.toKm, b.toKm)} on ${a.preferredDate}.`,
            requestIds: [a.id, b.id],
            sectionId: a.sectionId,
            detectedAt: new Date().toISOString(),
            status: 'open',
            aiSuggestion: `These departments are compatible. Combine ${a.requestNumber} and ${b.requestNumber} into a single optimized block. Estimated optimization score: 88–94%.`,
          });
        }
      }
    }
  }

  return conflicts;
}

// ─────────────────────────────────────────────────────────
// MAIN ENGINE: Run full optimization
// ─────────────────────────────────────────────────────────
export function runOptimizationEngine(
  requests: MaintenanceRequest[]
): OptimizationResult {
  // Filter to only combinable pending requests
  const eligible = requests.filter(
    (r) => r.status === 'pending' && r.canBeCombined
  );
  const nonEligible = requests.filter(
    (r) => r.status === 'pending' && !r.canBeCombined
  );

  // Cluster by section + date
  const clusters = clusterRequests(eligible);

  const blocks: MaintenanceBlock[] = [];
  let totalBlocksBefore = eligible.length + nonEligible.length;
  let hoursBefore = requests.reduce((a, r) => a + r.estimatedDuration, 0);
  let hoursAfter = nonEligible.reduce((a, r) => a + r.estimatedDuration, 0);
  let trainImpactBefore = 0;
  let trainImpactAfter = 0;

  for (const cluster of clusters) {
    const { requests: clusterReqs, date, sectionId } = cluster;

    if (clusterReqs.length === 1) {
      // Single request: create solo block
      const req = clusterReqs[0];
      const { startHour, score } = findOptimalWindow(req.estimatedDuration);
      const startTime = `${String(startHour).padStart(2, '0')}:00`;
      const endHour = startHour + req.estimatedDuration;
      const endTime = `${String(Math.floor(endHour)).padStart(2, '0')}:${endHour % 1 === 0.5 ? '30' : '00'}`;

      const optScore = calculateOptimizationScore([req], score);
      const trainImpact = Math.ceil(req.estimatedDuration * 2.5);
      trainImpactBefore += trainImpact;
      trainImpactAfter += trainImpact;
      hoursAfter += req.estimatedDuration;

      blocks.push({
        id: uuidv4(),
        blockNumber: `BLK-${format(new Date(), 'yyyy')}-${String(blocks.length + 100).padStart(3, '0')}`,
        date,
        startTime,
        endTime,
        duration: req.estimatedDuration,
        sectionId,
        sectionName: req.sectionName,
        fromKm: req.fromKm,
        toKm: req.toKm,
        departmentsInvolved: [req.department],
        requestIds: [req.id],
        activitiesCombined: [req.maintenanceType],
        priority: req.priority,
        expectedTrainImpact: trainImpact,
        assetAvailabilityImprovement: optScore * 0.15,
        optimizationScore: optScore,
        status: 'planned',
        generatedAt: new Date().toISOString(),
        generatedBy: 'ai',
      });
    } else {
      // Multiple requests: try to merge compatible ones
      const groups: MaintenanceRequest[][] = [];
      const used = new Set<string>();

      for (let i = 0; i < clusterReqs.length; i++) {
        if (used.has(clusterReqs[i].id)) continue;
        const group = [clusterReqs[i]];
        used.add(clusterReqs[i].id);

        for (let j = i + 1; j < clusterReqs.length; j++) {
          if (used.has(clusterReqs[j].id)) continue;
          const candidate = clusterReqs[j];
          const groupDepts = [...group.map((r) => r.department), candidate.department];

          if (
            kmsOverlap(group[0], candidate) &&
            areDepartmentsCompatible(groupDepts)
          ) {
            group.push(candidate);
            used.add(candidate.id);
          }
        }

        groups.push(group);
      }

      // Create a block for each group
      for (const group of groups) {
        const maxDuration = Math.max(...group.map((r) => r.estimatedDuration));
        const { startHour, score } = findOptimalWindow(maxDuration);
        const startTime = `${String(startHour).padStart(2, '0')}:00`;
        const endHour = startHour + maxDuration;
        const endHourStr = `${String(Math.floor(endHour)).padStart(2, '0')}:${endHour % 1 === 0.5 ? '30' : '00'}`;

        const optScore = calculateOptimizationScore(group, score);
        const depts = [...new Set(group.map((r) => r.department))];
        const highestPriority = group.find((r) => r.priority === 'critical')?.priority ||
          group.find((r) => r.priority === 'high')?.priority ||
          group.find((r) => r.priority === 'medium')?.priority || 'low';

        // Track impact: separate vs combined
        const separateTrainImpact = group.reduce((a, r) => a + Math.ceil(r.estimatedDuration * 2.5), 0);
        const combinedTrainImpact = Math.ceil(maxDuration * 2.5);
        trainImpactBefore += separateTrainImpact;
        trainImpactAfter += combinedTrainImpact;

        const fromKm = Math.min(...group.map((r) => r.fromKm));
        const toKm = Math.max(...group.map((r) => r.toKm));
        hoursAfter += maxDuration;

        blocks.push({
          id: uuidv4(),
          blockNumber: `BLK-${format(new Date(), 'yyyy')}-${String(blocks.length + 100).padStart(3, '0')}`,
          date,
          startTime,
          endTime: endHourStr,
          duration: maxDuration,
          sectionId,
          sectionName: group[0].sectionName,
          fromKm,
          toKm,
          departmentsInvolved: depts as any,
          requestIds: group.map((r) => r.id),
          activitiesCombined: group.map((r) => r.maintenanceType),
          priority: highestPriority as any,
          expectedTrainImpact: combinedTrainImpact,
          assetAvailabilityImprovement: Math.round(optScore * 0.18),
          optimizationScore: optScore,
          status: 'planned',
          generatedAt: new Date().toISOString(),
          generatedBy: 'ai',
        });
      }
    }
  }

  // Add non-combinable as individual blocks
  for (const req of nonEligible) {
    const { startHour, score } = findOptimalWindow(req.estimatedDuration);
    const startTime = `${String(startHour).padStart(2, '0')}:00`;
    const endHour = startHour + req.estimatedDuration;
    const endTime = `${String(Math.floor(endHour)).padStart(2, '0')}:00`;
    const optScore = calculateOptimizationScore([req], score);
    const trainImpact = Math.ceil(req.estimatedDuration * 2.5);
    trainImpactBefore += trainImpact;
    trainImpactAfter += trainImpact;

    blocks.push({
      id: uuidv4(),
      blockNumber: `BLK-${format(new Date(), 'yyyy')}-${String(blocks.length + 100).padStart(3, '0')}`,
      date: req.preferredDate,
      startTime,
      endTime,
      duration: req.estimatedDuration,
      sectionId: req.sectionId,
      sectionName: req.sectionName,
      fromKm: req.fromKm,
      toKm: req.toKm,
      departmentsInvolved: [req.department],
      requestIds: [req.id],
      activitiesCombined: [req.maintenanceType],
      priority: req.priority,
      expectedTrainImpact: trainImpact,
      assetAvailabilityImprovement: optScore * 0.1,
      optimizationScore: optScore,
      status: 'planned',
      generatedAt: new Date().toISOString(),
      generatedBy: 'ai',
    });
  }

  // Detect conflicts
  const conflicts = detectConflicts(requests.filter((r) => r.status === 'pending'));

  // Compute overall metrics
  const hoursSaved = Math.round((hoursBefore - hoursAfter) * 10) / 10;
  const disruptionReduction = hoursBefore > 0
    ? Math.round(((hoursBefore - hoursAfter) / hoursBefore) * 100)
    : 0;
  const assetAvailabilityGain = Math.round(disruptionReduction * 0.15 * 10) / 10;
  const avgScore = blocks.length > 0
    ? Math.round(blocks.reduce((a, b) => a + b.optimizationScore, 0) / blocks.length)
    : 0;

  return {
    blocks,
    conflicts,
    score: avgScore,
    requestsMerged: eligible.length - blocks.filter((b) => b.requestIds.length === 1).length,
    blocksBefore: totalBlocksBefore,
    blocksAfter: blocks.length,
    hoursSaved,
    disruptionReduction,
    assetAvailabilityGain,
    generatedAt: new Date().toISOString(),
  };
}
