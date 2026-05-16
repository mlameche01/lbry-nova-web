import { JSX, useEffect, useState } from "react";
import { Params, useParams } from "react-router";
import LBRY from "~/LBRY";
import Claim from "~/components/Claim";
import Error from "~/components/Error";
import Loader from "~/components/Loader";

function ClaimPage(): JSX.Element {
  const params: Params<string> = useParams();
  // URL format: @channel:id/name:id  or  name:id
  const claimPath = params["*"] ?? "";
  // Convert : back to # for lbry:// URLs
  const lbryUrl = "lbry://" + claimPath.replace(/:([a-f0-9]+)/gi, "#$1");

  const [claimData, setClaimData] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    if (!claimPath) return;
    setClaimData(null);
    setError(null);
    LBRY.resolve([lbryUrl])
      .then((result: object) => {
        const item = (result as any)[lbryUrl];
        if (!item || item.error) {
          setError(item?.error?.message ?? "Contenu introuvable.");
        } else {
          setClaimData(item);
        }
      })
      .catch((e) => setError(e.message));
  }, [claimPath]);

  if (error) return <Error message={error} />;
  if (!claimData) return <Loader />;
  if ((claimData as any).type === "claim") return <Claim data={claimData} />;
  return <Error message="Type de claim inconnu." />;
}

export default ClaimPage;
