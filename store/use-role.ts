import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "admin" | "manager" | "accountant" | "viewer";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  manager: 75,
  accountant: 50,
  viewer: 25,
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ["*"],
  manager: [
    "clients:read", "clients:write",
    "returns:read", "returns:write",
    "invoices:read", "invoices:write",
    "compliance:read", "compliance:write",
    "documents:read", "documents:write",
    "reports:read",
    "agents:read", "agents:write",
    "refunds:read", "refunds:write",
    "adr:read", "adr:write",
    "audit:read",
    "settings:read", "settings:write",
  ],
  accountant: [
    "clients:read",
    "returns:read", "returns:write",
    "invoices:read", "invoices:write",
    "compliance:read",
    "documents:read",
    "reports:read",
    "refunds:read",
  ],
  viewer: [
    "clients:read",
    "returns:read",
    "invoices:read",
    "compliance:read",
    "documents:read",
    "reports:read",
  ],
};

interface RoleState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  can: (permission: string) => boolean;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      role: "admin",
      setRole: (role) => set({ role }),
      can: (permission: string) => {
        const { role } = get();
        const perms = ROLE_PERMISSIONS[role];
        return perms.includes("*") || perms.includes(permission);
      },
    }),
    { name: "vat-role" }
  )
);
