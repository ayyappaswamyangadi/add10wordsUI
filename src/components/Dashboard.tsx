// frontend/src/components/Dashboard.tsx
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import AddWords from "./AddWords";
import WordsList from "./WordsList";

type Tab = "add" | "mine" | "all";

type Word = {
  _id: string;
  word: string;
  addedAt: string;
  userId?: string | null;
};

export default function Dashboard(): JSX.Element {
  const { api, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("add");
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [myWords, setMyWords] = useState<Word[]>([]);
  const [filters, setFilters] = useState({
    sort: "date-desc",
    from: "",
    to: "",
    q: "",
  });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/words", { params: filters });
      const data = res.data;
      if (Array.isArray(data)) {
        setMyWords(data as Word[]);
        setAllWords([]);
      } else {
        setAllWords((data?.all || []) as Word[]);
        setMyWords((data?.mine || []) as Word[]);
      }
    } catch (err) {
      console.error("Failed to load words:", err);
      setAllWords([]);
      setMyWords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  const exportCsv = () => {
    const rows = [
      ["word", "addedAt"],
      ...myWords.map((w) => [w.word, new Date(w.addedAt).toLocaleString()]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((cell) =>
            String(cell).includes(",")
              ? `"${String(cell).replace(/"/g, '""')}"`
              : cell,
          )
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily10-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <nav className="dash-nav">
        <span className="dash-brand">Improve English vocabulary</span>
        <div className="dash-nav-right">
          <span className="dash-user">{user?.name ?? user?.email}</span>
          <button className="btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dash-tabs">
        <button
          className={`dash-tab${activeTab === "add" ? " active" : ""}`}
          onClick={() => setActiveTab("add")}
        >
          Add Words
        </button>
        <button
          className={`dash-tab${activeTab === "mine" ? " active" : ""}`}
          onClick={() => setActiveTab("mine")}
        >
          My Words
          {myWords.length > 0 && (
            <span className="dash-tab-badge">{myWords.length}</span>
          )}
        </button>
        <button
          className={`dash-tab${activeTab === "all" ? " active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Users' Words
          {allWords.length > 0 && (
            <span className="dash-tab-badge">{allWords.length}</span>
          )}
        </button>
      </div>

      <div className="dash-container">
        {activeTab === "add" && (
          <AddWords
            onAdded={() => {
              load();
              setActiveTab("mine");
            }}
          />
        )}

        {(activeTab === "mine" || activeTab === "all") && (
          <>
            <div className="dash-filters">
              <label>
                Sort:
                <select
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters((s) => ({ ...s, sort: e.target.value }))
                  }
                >
                  <option value="date-desc">Newest</option>
                  <option value="date-asc">Oldest</option>
                  <option value="alpha-asc">A → Z</option>
                  <option value="alpha-desc">Z → A</option>
                </select>
              </label>

              <label>
                From:
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters((s) => ({ ...s, from: e.target.value }))
                  }
                />
              </label>

              <label>
                To:
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters((s) => ({ ...s, to: e.target.value }))
                  }
                />
              </label>

              <label className="dash-search">
                Search:
                <input
                  value={filters.q}
                  onChange={(e) =>
                    setFilters((s) => ({ ...s, q: e.target.value }))
                  }
                  placeholder="search words"
                />
              </label>

              <button className="btn-primary" onClick={() => load()}>
                Apply
              </button>
              <button
                onClick={() =>
                  setFilters({ sort: "date-desc", from: "", to: "", q: "" })
                }
              >
                Reset
              </button>

              {activeTab === "mine" && (
                <button
                  className="btn-outline dash-export"
                  onClick={exportCsv}
                >
                  Export CSV
                </button>
              )}
            </div>

            <WordsList
              allWords={allWords}
              myWords={myWords}
              loading={loading}
              currentUserId={user?.id}
              mode={activeTab}
            />
          </>
        )}
      </div>
    </>
  );
}
