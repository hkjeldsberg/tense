import localContent from "../../content/rooms.json";
import { getSupabase } from "./supabase";
import type { ContentSource, Room, RoomSummary } from "./types";

/** Fail fast to the bundled content rather than retrying with backoff. */
const TIMEOUT_MS = 5000;

const localRooms = (localContent.rooms as Room[])
  .slice()
  .sort((a, b) => a.order_index - b.order_index);

function summarize({ id, order_index, title, subtitle, focus }: Room): RoomSummary {
  return { id, order_index, title, subtitle, focus };
}

/**
 * Room list. Reads tense.rooms from Supabase; falls back to the bundled
 * content/rooms.json when Supabase is not configured or unreachable.
 */
export async function fetchRooms(): Promise<{ rooms: RoomSummary[]; source: ContentSource }> {
  const db = getSupabase();
  if (db) {
    try {
      const { data, error } = await db
        .from("rooms")
        .select("id, order_index, title, subtitle, focus")
        .order("order_index")
        .retry(false)
        .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
      if (error) throw error;
      if (data?.length) return { rooms: data as RoomSummary[], source: "supabase" };
    } catch (e) {
      console.warn("[content] rooms from Supabase failed, using local:", e);
    }
  }
  return { rooms: localRooms.map(summarize), source: "local" };
}

/** Full room with its puzzles, requested on scene load. */
export async function fetchRoom(roomId: string): Promise<{ room: Room; source: ContentSource } | null> {
  const db = getSupabase();
  if (db) {
    try {
      const { data, error } = await db
        .from("rooms")
        .select(
          "id, order_index, title, subtitle, focus, puzzles (id, order_index, scene_object, sentence_pre, sentence_post, verb_base, options, rule_feedback, translation, anim_trigger)",
        )
        .eq("id", roomId)
        .order("order_index", { referencedTable: "puzzles" })
        .abortSignal(AbortSignal.timeout(TIMEOUT_MS))
        .maybeSingle()
        .retry(false);
      if (error) throw error;
      if (data) return { room: data as Room, source: "supabase" };
    } catch (e) {
      console.warn("[content] room from Supabase failed, using local:", e);
    }
  }
  const room = localRooms.find((r) => r.id === roomId);
  return room ? { room, source: "local" } : null;
}
