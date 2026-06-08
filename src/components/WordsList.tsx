// frontend/src/components/WordsList.tsx

type Word = {
  _id: string;
  word: string;
  addedAt: string | null;
  userId?: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
};

export default function WordsList({
  allWords = [],
  myWords = [],
  loading = false,
  currentUserId,
  mode,
}: {
  allWords?: Word[];
  myWords?: Word[];
  loading?: boolean;
  currentUserId?: string | null;
  mode?: "mine" | "all";
}) {
  if (loading)
    return (
      <div style={{ marginTop: 20, color: "var(--text-muted)", fontSize: 14 }}>
        Loading…
      </div>
    );

  return (
    <div className="words-layout">
      {/* My words — shown when mode is 'mine' or no mode */}
      {(mode === "mine" || !mode) && (
        <div className="words-col">
          <h3>
            Your words <small>({myWords.length})</small>
          </h3>
          {myWords.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
              No words yet.
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {myWords.map((w) => (
                    <tr key={w._id}>
                      <td style={{ fontWeight: 500 }}>{w.word}</td>
                      <td style={{ color: "var(--text-muted)" }}>
                        {w.addedAt
                          ? new Date(w.addedAt).toLocaleDateString()
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All words — shown when mode is 'all' or no mode */}
      {(mode === "all" || !mode) && (
        <div className="words-col">
          <h3>
            All users' words <small>({allWords.length})</small>
          </h3>
          {allWords.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
              No global words available.
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Word</th>
                    <th>Owner</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {allWords.map((w) => {
                    const isMine =
                      w.userId &&
                      currentUserId &&
                      String(w.userId) === String(currentUserId);
                    return (
                      <tr
                        key={w._id}
                        style={
                          isMine
                            ? { background: "rgba(79,70,229,0.04)" }
                            : undefined
                        }
                      >
                        <td style={{ fontWeight: 500 }}>{w.word}</td>
                        <td
                          style={{
                            color: isMine
                              ? "var(--primary)"
                              : "var(--text-muted)",
                            fontWeight: isMine ? 600 : undefined,
                          }}
                        >
                          {w.ownerName ?? (isMine ? "You" : w.ownerEmail)}
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {w.addedAt
                            ? new Date(w.addedAt).toLocaleDateString()
                            : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
