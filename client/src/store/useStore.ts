// ============================================================
// RailAvail – Global Zustand Store
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, MaintenanceRequest, MaintenanceBlock,
  Conflict, OptimizationResult, ChatMessage
} from '../types';
import {
  DEMO_USERS, LOGIN_CREDENTIALS,
  MAINTENANCE_REQUESTS, SAMPLE_BLOCKS, SAMPLE_CONFLICTS
} from '../data/mockData';
import { runOptimizationEngine } from '../engine/optimizer';

// ─────────────────────────────────────────
// Auth Slice
// ─────────────────────────────────────────
interface AuthSlice {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

// ─────────────────────────────────────────
// App Slice
// ─────────────────────────────────────────
interface AppSlice {
  requests: MaintenanceRequest[];
  blocks: MaintenanceBlock[];
  conflicts: Conflict[];
  optimizationResult: OptimizationResult | null;
  isOptimizing: boolean;
  chatMessages: ChatMessage[];

  // Requests
  addRequest: (req: Omit<MaintenanceRequest, 'id' | 'requestNumber' | 'submittedAt'>) => void;
  updateRequestStatus: (id: string, status: MaintenanceRequest['status']) => void;

  // Blocks
  approveBlock: (id: string) => void;
  cancelBlock: (id: string) => void;

  // Conflicts
  resolveConflict: (id: string, resolvedBy: string) => void;

  // Optimization
  runOptimization: () => Promise<void>;
  clearOptimization: () => void;

  // Chat
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
}

type Store = AuthSlice & AppSlice;

let reqCounter = MAINTENANCE_REQUESTS.length + 1;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────
      user: null,
      token: null,

      login: (email, password) => {
        const expectedPwd = LOGIN_CREDENTIALS[email];
        if (!expectedPwd || expectedPwd !== password) return false;
        const user = DEMO_USERS.find((u) => u.email === email);
        if (!user) return false;
        // Simple mock JWT
        const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }));
        set({ user, token });
        return true;
      },

      logout: () => set({ user: null, token: null }),

      // ── Requests ──────────────────────────────────────────
      requests: MAINTENANCE_REQUESTS,
      blocks: SAMPLE_BLOCKS,
      conflicts: SAMPLE_CONFLICTS,
      optimizationResult: null,
      isOptimizing: false,
      chatMessages: [],

      addRequest: (req) => {
        const id = `mr${String(Date.now()).slice(-6)}`;
        const requestNumber = `REQ-2026-${String(reqCounter++).padStart(3, '0')}`;
        const newRequest: MaintenanceRequest = {
          ...req,
          id,
          requestNumber,
          submittedAt: new Date().toISOString(),
        };
        set((state) => ({ requests: [...state.requests, newRequest] }));
      },

      updateRequestStatus: (id, status) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id ? { ...r, status, approvedAt: new Date().toISOString() } : r
          ),
        }));
      },

      // ── Blocks ────────────────────────────────────────────
      approveBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, status: 'planned' as const } : b
          ),
        }));
      },

      cancelBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, status: 'cancelled' as const } : b
          ),
        }));
      },

      // ── Conflicts ─────────────────────────────────────────
      resolveConflict: (id, resolvedBy) => {
        set((state) => ({
          conflicts: state.conflicts.map((c) =>
            c.id === id
              ? { ...c, status: 'resolved' as const, resolvedAt: new Date().toISOString(), resolvedBy }
              : c
          ),
        }));
      },

      // ── Optimization ──────────────────────────────────────
      runOptimization: async () => {
        set({ isOptimizing: true });

        // Simulate AI processing delay for UX
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const result = runOptimizationEngine(get().requests);

        set((state) => ({
          isOptimizing: false,
          optimizationResult: result,
          blocks: [...state.blocks, ...result.blocks],
          conflicts: [...state.conflicts, ...result.conflicts.filter(
            (nc) => !state.conflicts.some((ec) => ec.requestIds.sort().join() === nc.requestIds.sort().join())
          )],
          requests: state.requests.map((r) => {
            const block = result.blocks.find((b) => b.requestIds.includes(r.id));
            return block ? { ...r, status: 'scheduled' as const, blockId: block.id } : r;
          }),
        }));
      },

      clearOptimization: () => set({ optimizationResult: null }),

      // ── Chat ──────────────────────────────────────────────
      addChatMessage: (msg) => {
        const message: ChatMessage = {
          ...msg,
          id: `msg-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ chatMessages: [...state.chatMessages, message] }));
      },

      clearChat: () => set({ chatMessages: [] }),
    }),
    {
      name: 'RailAvail-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        requests: state.requests,
        blocks: state.blocks,
        conflicts: state.conflicts,
      }),
    }
  )
);
