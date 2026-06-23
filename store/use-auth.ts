import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile, Organization } from "@/types/database";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOrganization: (org: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  organization: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setOrganization: (org) => set({ organization: org }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({ user: null, profile: null, organization: null, isLoading: false }),
}));
