import { create } from "zustand";

export type TimeWindow = "any" | "10" | "15" | "30" | "60";

interface DashboardFiltersState {
  destinationQuery: string;
  timeWindowMins: TimeWindow;
  sameDepartment: boolean;
  sameYear: boolean;
  showFriendsOnly: boolean;
  showMyUniversityOnly: boolean;
  setDestinationQuery: (value: string) => void;
  setTimeWindowMins: (value: TimeWindow) => void;
  setSameDepartment: (value: boolean) => void;
  setSameYear: (value: boolean) => void;
  setShowFriendsOnly: (value: boolean) => void;
  setShowMyUniversityOnly: (value: boolean) => void;
  resetFilters: () => void;
}

const INITIAL_STATE: Omit<DashboardFiltersState,
  | "setDestinationQuery"
  | "setTimeWindowMins"
  | "setSameDepartment"
  | "setSameYear"
  | "setShowFriendsOnly"
  | "setShowMyUniversityOnly"
  | "resetFilters"
> = {
  destinationQuery: "",
  timeWindowMins: "any",
  sameDepartment: false,
  sameYear: false,
  showFriendsOnly: false,
  showMyUniversityOnly: false,
};

const useDashboardFiltersStore = create<DashboardFiltersState>((set) => ({
  ...INITIAL_STATE,
  setDestinationQuery: (value) => set({ destinationQuery: value }),
  setTimeWindowMins: (value) => set({ timeWindowMins: value }),
  setSameDepartment: (value) => set({ sameDepartment: value }),
  setSameYear: (value) => set({ sameYear: value }),
  setShowFriendsOnly: (value) => set({ showFriendsOnly: value }),
  setShowMyUniversityOnly: (value) => set({ showMyUniversityOnly: value }),
  resetFilters: () => set(() => ({ ...INITIAL_STATE })),
}));

export default useDashboardFiltersStore;
