import { JSX, useEffect, useState } from "react";
import LBRY from "~/LBRY";
import ClaimPreviewTile from "~/components/ClaimPreviewTile";
import Loader from "~/components/Loader";

function HomePage(): JSX.Element {
  const [trending, setTrending] = useState<object[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    LBRY.getTrending(1, 20)
      .then((items) => setTrending(items))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <h2 style={{ padding: "16px 0 8px" }}>🔥 Tendances francophones</h2>
      {error ? (
        <div style={{ color: "red", padding: 16 }}>{error}</div>
      ) : trending === null ? (
        <Loader />
      ) : trending.length === 0 ? (
        <div style={{ padding: 16, color: "#aaa" }}>Aucun contenu trouvé.</div>
      ) : (
        <div className="claim-preview-section">
          {trending.map((claim, i) => (
            <ClaimPreviewTile claim={claim} key={i} />
          ))}
        </div>
      )}
    </>
  );
}

export default HomePage;
