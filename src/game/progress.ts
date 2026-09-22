/** Local player progress (per browser). Content comes from Supabase; progress does not. */
export interface Progress {
  solved: string[]; // puzzle ids
  completedRooms: string[]; // room ids
  mistakes: Record<string, number>; // puzzle id → wrong answers
  lastRoom: string | null;
}

const KEY = "tense.progress.v1";

export const emptyProgress = (): Progress => ({ solved: [], completedRooms: [], mistakes: {}, lastRoom: null });

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable: progress lasts for this session only */
  }
}
