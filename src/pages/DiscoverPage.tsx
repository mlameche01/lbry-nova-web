import React, { JSX, useEffect, useState } from "react";
import LBRY from "~/LBRY";
import ClaimPreviewTile from "~/components/ClaimPreviewTile";
import CustomSVG from "~/components/CustomSVG";
import Loader from "~/components/Loader";

type Toggle = "new" | "trending" | "top";

function DiscoverPage(): JSX.Element {
  const [items, setItems] = useState<object[] | string | null>(null);
  const [toggle, setToggle] = useState<Toggle>("trending");

  useEffect((): void => {
    setItems(null);
    const orderBy =
      toggle === "new" ? "release_time" :
      toggle === "trending" ? "trending_group" : "effective_amount";

    LBRY.claimSearch({
      page_size: 20,
      page: 1,
      claim_type: ["stream"],
      stream_types: ["video"],
      order_by: [orderBy],
      not_tags: LBRY.NOT_TAGS,
      any_tags: LBRY.FRENCH_TAGS,
      limit_claims_per_channel: 3,
    })
      .then((res) => setItems(res))
      .catch((e) => setItems(e.message));
  }, [toggle]);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    backgroundColor: active ? "rgb(17,17,17)" : "rgba(17,17,17,0.4)",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontWeight: "700",
    height: "40px",
    padding: "0 16px",
  });

  return (
    <>
      <h1>
        <CustomSVG
          style={{ fill: "transparent", height: "24", width: "24", verticalAlign: "middle", stroke: "white", strokeWidth: "2px" }}
          icon="compass"
          viewBox="0 0 24 24"
        />{" "}
        <span style={{ verticalAlign: "middle" }}>Découvrir</span>
      </h1>
      <div style={{ padding: "16px 0" }}>
        <button onClick={() => setToggle("new")} style={{ ...btnStyle(toggle === "new"), borderRadius: "6px 0 0 6px" }}>Récent</button>
        <button onClick={() => setToggle("trending")} style={btnStyle(toggle === "trending")}>Tendances</button>
        <button onClick={() => setToggle("top")} style={{ ...btnStyle(toggle === "top"), borderRadius: "0 6px 6px 0" }}>Top</button>
      </div>
      <div style={{ padding: "16px 0", textAlign: "center" }}>
        {items === null ? <Loader /> :
         typeof items === "string" ? <span style={{ color: "red" }}>{items}</span> :
         items.length > 0 ? items.map((c, i) => <ClaimPreviewTile claim={c} key={i} />) :
         "Aucun contenu"}
      </div>
    </>
  );
}

export default DiscoverPage;
