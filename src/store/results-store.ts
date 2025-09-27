'use client';

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { ReadingResponse } from "@/lib/schemas/reading";

type ReadingStore = {
  latest?: ReadingResponse;
  setReading: (reading: ReadingResponse) => void;
  clear: () => void;
};

export const useReadingStore = create<ReadingStore>()(
  persist(
    (set) => ({
      latest: undefined,
      setReading: (reading) => set({ latest: reading }),
      clear: () => set({ latest: undefined }),
    }),
    {
      name: "starlens-reading",
      storage: typeof window !== "undefined" ? createJSONStorage(() => window.sessionStorage) : undefined,
      version: 1,
    },
  ),
);
