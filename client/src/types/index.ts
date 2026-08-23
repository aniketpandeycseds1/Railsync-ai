// ============================================================
// RailAvail – Core TypeScript Types
// ============================================================

export type UserRole =
  | 'administrator'
  | 'engineering'
  | 'traction'
  | 'signaling'
  | 'operations';

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'scheduled' | 'completed';
export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';
export type Department = 'Engineering' | 'Traction Distribution' | 'Signal & Telecommunication' | 'Operations';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  division: string;
  avatar?: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  zone: string;
  division: string;
  x: number; // SVG coordinate
  y: number;
  isJunction: boolean;
}

export interface RailwaySection {
  id: string;
  name: string;
  fromStation: string;
  toStation: string;
  fromStationId: string;
  toStationId: string;
  zone: string;
  division: string;
  length: number; // km
  trafficIntensity: 'high' | 'medium' | 'low'; // baseline
  electrified: boolean;
}

export interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  department: Department;
  division: string;
  zone: string;
  sectionId: string;
  sectionName: string;
  fromLocation: string;
  toLocation: string;
  fromKm: number;
  toKm: number;
  maintenanceType: string;
  description: string;
  estimatedDuration: number; // hours
  priority: Priority;
  preferredDate: string; // ISO date
  preferredTimeStart: string; // HH:mm
  preferredTimeEnd: string; // HH:mm
  requiredWorkers: number;
  equipmentRequired: string[];
  canBeCombined: boolean;
  additionalNotes?: string;
  status: RequestStatus;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  blockId?: string;
}

export interface MaintenanceBlock {
  id: string;
  blockNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // hours
  sectionId: string;
  sectionName: string;
  fromKm: number;
  toKm: number;
  departmentsInvolved: Department[];
  requestIds: string[];
  activitiesCombined: string[];
  priority: Priority;
  expectedTrainImpact: number; // number of trains affected
  assetAvailabilityImprovement: number; // percentage
  optimizationScore: number; // 0-100
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  generatedAt: string;
  generatedBy: 'ai' | 'manual';
  notes?: string;
}

export interface Conflict {
  id: string;
  type: 'track_overlap' | 'time_overlap' | 'resource_conflict' | 'traffic_conflict' | 'dept_incompatibility';
  severity: ConflictSeverity;
  title: string;
  description: string;
  requestIds: string[];
  blockIds?: string[];
  sectionId: string;
  detectedAt: string;
  status: 'open' | 'resolved' | 'ignored';
  aiSuggestion: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface TrafficWindow {
  hour: number; // 0-23
  intensity: number; // 0-100
  label: string;
}

export interface OptimizationResult {
  blocks: MaintenanceBlock[];
  conflicts: Conflict[];
  score: number;
  requestsMerged: number;
  blocksBefore: number;
  blocksAfter: number;
  hoursSaved: number;
  disruptionReduction: number; // percentage
  assetAvailabilityGain: number; // percentage
  generatedAt: string;
}

export interface DashboardKPIs {
  totalRequests: number;
  pendingRequests: number;
  optimizedBlocks: number;
  conflictsDetected: number;
  conflictsResolved: number;
  disruptionReduction: number;
  assetAvailability: number;
  maintenanceHoursSaved: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
