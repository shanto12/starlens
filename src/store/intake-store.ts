'use client';

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Goal, HorizonMonths } from "@/lib/types/reading";

export type IntakeData = {
  birth: {
    date: string;
    time?: string;
    timeUnknown: boolean;
    city: string;
    country: string;
  };
  current: {
    city: string;
    country?: string;
  };
  names: {
    birthName?: string;
    currentName?: string;
  };
  goals: Goal[];
  horizonMonths: HorizonMonths;
  options: {
    datePicks: boolean;
    relocation: string[];
    question?: string;
    home: {
      facingDegrees?: number;
      moveInYear?: number;
    };
  };
  timezone?: string;
  locale?: string;
};

const defaultData: IntakeData = {
  birth: {
    date: "",
    time: "",
    timeUnknown: false,
    city: "",
    country: "",
  },
  current: {
    city: "",
    country: "",
  },
  names: {
    birthName: "",
    currentName: "",
  },
  goals: [],
  horizonMonths: 12,
  options: {
    datePicks: false,
    relocation: [],
    question: "",
    home: {},
  },
  timezone:
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
  locale: typeof navigator !== "undefined" ? navigator.language : undefined,
};

function mergeData(target: IntakeData, patch: Partial<IntakeData>): IntakeData {
  return {
    ...target,
    ...patch,
    birth: { ...target.birth, ...patch.birth },
    current: { ...target.current, ...patch.current },
    names: { ...target.names, ...patch.names },
    options: {
      ...target.options,
      ...patch.options,
      home: { ...target.options.home, ...patch.options?.home },
      relocation: patch.options?.relocation ?? target.options.relocation,
    },
    goals: patch.goals ?? target.goals,
    horizonMonths: patch.horizonMonths ?? target.horizonMonths,
  };
}

type IntakeStore = {
  data: IntakeData;
  activeStep: number;
  update: (patch: Partial<IntakeData>) => void;
  setGoals: (goals: Goal[]) => void;
  setActiveStep: (step: number) => void;
  reset: () => void;
};

export const useIntakeStore = create<IntakeStore>()(
  persist(
    (set) => ({
      data: defaultData,
      activeStep: 0,
      update: (patch) =>
        set((state) => ({
          data: mergeData(state.data, patch),
        })),
      setGoals: (goals) =>
        set((state) => ({
          data: { ...state.data, goals },
        })),
      setActiveStep: (step) => set({ activeStep: step }),
      reset: () => set({ data: defaultData, activeStep: 0 }),
    }),
    {
      name: "starlens-intake",
      storage: typeof window !== "undefined" ? createJSONStorage(() => window.sessionStorage) : undefined,
      version: 1,
      partialize: (state) => ({ data: state.data, activeStep: state.activeStep }),
    },
  ),
);
