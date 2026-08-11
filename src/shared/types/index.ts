/**
 * shared/types/index.ts
 * ─────────────────────
 * Domain-wide primitive types shared across all modules.
 * Nothing here imports from a module — these are the leaf-level definitions.
 */

// ── User ──────────────────────────────────────────────────────────────────────
export type UserRole = 'buyer' | 'seller' | 'rider' | 'admin';

// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'on_the_way'
  | 'reached'
  | 'delivered'
  | 'cancelled';

export type DeliveryType = 'standard' | 'express';
