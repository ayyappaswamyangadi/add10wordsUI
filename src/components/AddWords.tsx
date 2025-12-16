import { useEffect, useMemo, useReducer, useRef } from "react";
import type { AxiosError } from "axios";
import { useAuth } from "../auth/useAuth";

type Conflicts = { db: string[]; inBatch: string[] } | null;

type State = {
  text: string;
  conflicts: Conflicts;
  replacements: Record<string, string>;
  message: string | null;
  loading: boolean;

  savedWords: Array<{ word: string; wordLower: string }>;
  savedLoading: boolean;
  savedError: string | null;
};

type Action =
  | { type: "SET_TEXT"; text: string }
  | { type: "SET_LOADING"; value: boolean }
  | { type: "SET_MESSAGE"; message: string | null }
  | { type: "SET_CONFLICTS"; conflicts: Conflicts }
  | { type: "SET_REPLACEMENTS"; replacements: Record<string, string> }
  | { type: "RESET_FORM" }
  | {
      type: "SET_SAVED";
      words: Array<{ word: string; wordLower: string }>;
    }
  | { type: "ROLLBACK"; snapshot: State };

const initialState: State = {
  text: "",
  conflicts: null,
  replacements: {},
  message: null,
  loading: false,

  savedWords: [],
  savedLoading: false,
  savedError: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TEXT":
      return { ...state, text: action.text };
    case "SET_LOADING":
      return { ...state, loading: action.value };
    case "SET_MESSAGE":
      return { ...state, message: action.message };
    case "SET_CONFLICTS":
      return { ...state, conflicts: action.conflicts };
    case "SET_REPLACEMENTS":
      return { ...state, replacements: action.replacements };
    case "RESET_FORM":
      return {
        ...state,
        text: "",
        conflicts: null,
        replacements: {},
      };
    case "SET_SAVED":
      return { ...state, savedWords: action.words };
    case "ROLLBACK":
      return action.snapshot;
    default:
      return state;
  }
}

const isApiError = (err: unknown): err is AxiosError<any> =>
  typeof err === "object" && err !== null && "isAxiosError" in err;

function normalize(word: string) {
  return word.trim();
}

type AddWordsProps = {
  onAdded?: () => void | Promise<void>;
};

export default function AddWords({ onAdded }: AddWordsProps = {}) {
  const { api } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Snapshot for rollback
  const rollbackRef = useRef<State | null>(null);

  // --------------------
  // Parsing
  // --------------------
  const parsed = useMemo(() => {
    return state.text
      .split(/[\n,\s;"]+/)
      .map(normalize)
      .filter(Boolean)
      .slice(0, 100);
  }, [state.text]);

  const parsedCount = parsed.length;

  const buildFinal = () =>
    parsed.map((w) => {
      const rep = state.replacements[w.toLowerCase()];
      return rep && rep.trim() ? rep.trim() : w.trim();
    });

  const isFinalValid = () => {
    const final = buildFinal();
    if (final.length !== 10) return false;
    return new Set(final.map((f) => f.toLowerCase())).size === 10;
  };

  // --------------------
  // Optimistic submit with rollback
  // --------------------
  const submitFinal = async (finalWords: string[]) => {
    // 1️⃣ Snapshot current state
    rollbackRef.current = state;

    // 2️⃣ Optimistic UI update
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({
      type: "SET_MESSAGE",
      message: "Words added successfully!",
    });
    dispatch({ type: "RESET_FORM" });

    try {
      // 3️⃣ Actual API call
      await api.post("/words", { words: finalWords });

      // 4️⃣ Confirm success
      if (onAdded) await onAdded();
    } catch (err) {
      // 5️⃣ Rollback on failure
      if (rollbackRef.current) {
        dispatch({ type: "ROLLBACK", snapshot: rollbackRef.current });
      }

      dispatch({
        type: "SET_MESSAGE",
        message: isApiError(err)
          ? err.response?.data?.error || "Submit failed"
          : "Submit failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
      rollbackRef.current = null;
    }
  };

  // --------------------
  // Validate then submit
  // --------------------
  const handleValidate = async () => {
    dispatch({ type: "SET_MESSAGE", message: null });
    dispatch({ type: "SET_CONFLICTS", conflicts: null });

    if (parsedCount !== 10) {
      dispatch({
        type: "SET_MESSAGE",
        message: `Please enter exactly 10 words. You entered ${parsedCount}.`,
      });
      return;
    }

    dispatch({ type: "SET_LOADING", value: true });

    try {
      const res = await api.post("/words/validate", { words: parsed });
      const { ok, conflicts } = res.data;

      if (!ok && conflicts) {
        const map: Record<string, string> = {};
        [...conflicts.db, ...conflicts.inBatch].forEach(
          (k: string) => (map[k.toLowerCase()] = "")
        );

        dispatch({ type: "SET_CONFLICTS", conflicts });
        dispatch({ type: "SET_REPLACEMENTS", replacements: map });
        dispatch({
          type: "SET_MESSAGE",
          message: "Some words are duplicates — please replace them.",
        });
        return;
      }

      await submitFinal(buildFinal());
    } catch (err) {
      dispatch({
        type: "SET_MESSAGE",
        message: isApiError(err)
          ? err.response?.data?.error || "Validation failed"
          : "Validation failed",
      });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  };

  // --------------------
  // Render
  // --------------------
  return (
    <div style={{ maxWidth: 900, margin: "12px auto", padding: 12 }}>
      <h3>Add exactly 10 words</h3>

      <textarea
        value={state.text}
        onChange={(e) => dispatch({ type: "SET_TEXT", text: e.target.value })}
        rows={5}
        style={{ width: "100%", padding: 10 }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          onClick={handleValidate}
          disabled={state.loading || parsedCount !== 10}
        >
          {state.loading ? "Working..." : "Validate & Submit"}
        </button>

        <button
          onClick={() => dispatch({ type: "RESET_FORM" })}
          disabled={state.loading}
        >
          Clear
        </button>

        <div style={{ marginLeft: "auto" }}>Words: {parsedCount} / 10</div>
      </div>

      {state.message && (
        <div
          style={{
            marginTop: 10,
            color: state.message.includes("success") ? "green" : "crimson",
          }}
        >
          {state.message}
        </div>
      )}

      {state.conflicts && (
        <div
          style={{ marginTop: 16, border: "1px solid #f0ad4e", padding: 12 }}
        >
          <strong>Conflicting words — please replace</strong>

          {[
            ...(state.conflicts.db || []),
            ...(state.conflicts.inBatch || []),
          ].map((k) => (
            <div key={k} style={{ marginTop: 8 }}>
              <input
                value={state.replacements[k] ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "SET_REPLACEMENTS",
                    replacements: {
                      ...state.replacements,
                      [k]: e.target.value,
                    },
                  })
                }
                placeholder="Replacement"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          ))}

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => submitFinal(buildFinal())}
              disabled={!isFinalValid() || state.loading}
            >
              Submit replacements
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
