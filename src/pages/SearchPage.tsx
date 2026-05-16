import { JSX, useEffect, useState } from "react";
import { Location, useLocation } from "react-router";
import LBRY from "~/LBRY";
import ClaimPreviewTile from "~/components/ClaimPreviewTile";
import Loader from "~/components/Loader";

function SearchPage(): JSX.Element {
  const location: Location = useLocation();
  const query = new URLSearchParams(location.search).get("q") ?? "";

  const [items, setItems] = useState<object[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    if (!query) return;
    setItems(null);
    setError(null);
    LBRY.searchContent(query, 1, 24)
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [query]);

  return (
    <div>
      <span>Résultats pour '<b>{query}</b>' :</span>
      {error ? (
        <div style={{ color: "red", padding: 16 }}>{error}</div>
      ) : items === null ? (
        <Loader />
      ) : items.length === 0 ? (
        <div style={{ padding: 16, color: "#aaa" }}>Aucun résultat trouvé.</div>
      ) : (
        <div className="claim-preview-section">
          {items.map((c, i) => <ClaimPreviewTile claim={c} key={i} />)}
        </div>
      )}
    </div>
  );
}

export default SearchPage;
