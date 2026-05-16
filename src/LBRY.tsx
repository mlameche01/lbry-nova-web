// LBRY / Odysee public API — sans daemon local requis
const ODYSEE_API = "https://api.na-backend.odysee.com/api/v1/proxy";
const LIGHTHOUSE_URL = "https://lighthouse.odysee.tv/search";
const THUMBNAIL_CDN = "https://thumbnails.odycdn.com/optimize/s:390:0/quality:85/plain/";
const PLAYER_CDN = "https://player.odycdn.com/api/v3/streams/free";

const FRENCH_TAGS = [
  "french","français","francais","france","québec","quebec",
  "algérie","algerie","maroc","tunisie","belgique","suisse",
  "afrique francophone","fr","maghreb","dz","ma","tn",
];

const NOT_TAGS_DEFAULT: string[] = [
  "porn","porno","nsfw","mature","xxx","sex","creampie",
  "blowjob","handjob","vagina","boobs","big boobs","big dick",
  "pussy","cumshot","anal","hard fucking","ass","fuck","hentai",
];

function generateID(): number {
  return Math.ceil(Math.random() * 65536) + 1;
}

async function rpc(method: string, params: object): Promise<object> {
  const res = await fetch(ODYSEE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: generateID() }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data;
}

async function claimSearch(params: object): Promise<object[]> {
  const json = await rpc("claim_search", { no_totals: true, has_source: true, ...params });
  return (json as any).result?.items ?? [];
}

async function resolve(urls: string[]): Promise<object> {
  const json = await rpc("resolve", { urls, include_purchase_receipt: false });
  return (json as any).result ?? {};
}

async function getStreamUrl(claim: object): Promise<string> {
  const sdHash = (claim as any).value?.source?.sd_hash;
  const name = (claim as any).name;
  const id = (claim as any).claim_id;
  if (sdHash && name && id) {
    return `${PLAYER_CDN}/${encodeURIComponent(name)}/${id}/${sdHash.slice(0, 6)}.mp4`;
  }
  return `https://odysee.com/$/embed/${encodeURIComponent(name ?? "")}/${id}`;
}

function thumbnailUrl(url?: string): string {
  if (!url) return "";
  return `${THUMBNAIL_CDN}${encodeURIComponent(url)}`;
}

async function getTrending(page = 1, pageSize = 20): Promise<object[]> {
  // Essai 1 : langue fr + tags fr
  try {
    const items = await claimSearch({
      page, page_size: pageSize,
      claim_type: ["stream"],
      stream_types: ["video"],
      order_by: ["trending_group", "trending_mixed"],
      not_tags: NOT_TAGS_DEFAULT,
      any_languages: ["fr"],
      any_tags: FRENCH_TAGS,
    });
    if (items.length > 0) return items;
  } catch { /* continue */ }
  // Fallback : tags fr seulement
  return claimSearch({
    page, page_size: pageSize,
    claim_type: ["stream"],
    stream_types: ["video"],
    order_by: ["trending_group", "trending_mixed"],
    not_tags: NOT_TAGS_DEFAULT,
    any_tags: FRENCH_TAGS,
  });
}

async function getChannelVideos(channelId: string, page = 1, pageSize = 20): Promise<object[]> {
  return claimSearch({
    channel_ids: [channelId],
    page, page_size: pageSize,
    claim_type: ["stream"],
    stream_types: ["video"],
    order_by: ["release_time"],
  });
}

async function searchContent(query: string, page = 1, pageSize = 20): Promise<object[]> {
  if (!query.trim()) return [];
  // Lighthouse FR en priorité
  try {
    const [frRes, allRes] = await Promise.allSettled([
      fetch(`${LIGHTHOUSE_URL}?${new URLSearchParams({ s: query, size: String(pageSize), from: String((page-1)*pageSize), language: "fr" })}`),
      fetch(`${LIGHTHOUSE_URL}?${new URLSearchParams({ s: query, size: String(pageSize), from: String((page-1)*pageSize) })}`),
    ]);
    const extractIds = async (r: PromiseSettledResult<Response>): Promise<string[]> => {
      if (r.status !== "fulfilled" || !r.value.ok) return [];
      const items = await r.value.json() as { claimId?: string }[];
      return items.map(i => i.claimId).filter(Boolean) as string[];
    };
    const [frIds, allIds] = await Promise.all([extractIds(frRes), extractIds(allRes)]);
    const seen = new Set(frIds);
    const merged = [...frIds, ...allIds.filter(id => !seen.has(id))].slice(0, pageSize);
    if (merged.length > 0) {
      const json = await rpc("claim_search", { claim_ids: merged, page: 1, page_size: merged.length, no_totals: true });
      const map = new Map(((json as any).result?.items ?? []).map((c: any) => [c.claim_id, c]));
      return merged.map(id => map.get(id)).filter(Boolean) as object[];
    }
  } catch { /* fallback */ }
  // Fallback RPC
  const [frItems, allItems] = await Promise.allSettled([
    claimSearch({ any_tags: [query.toLowerCase(), ...FRENCH_TAGS], any_languages: ["fr"], page, page_size: pageSize, claim_type: ["stream", "channel"], order_by: ["release_time"], not_tags: NOT_TAGS_DEFAULT }),
    claimSearch({ text: query, page, page_size: pageSize, claim_type: ["stream", "channel"], order_by: ["release_time"], not_tags: NOT_TAGS_DEFAULT }),
  ]);
  const fr = frItems.status === "fulfilled" ? frItems.value : [];
  const all = allItems.status === "fulfilled" ? allItems.value : [];
  const seen = new Set(fr.map((c: any) => c.claim_id));
  return [...fr, ...all.filter((c: any) => !seen.has(c.claim_id))].slice(0, pageSize);
}

export default {
  ODYSEE_API,
  NOT_TAGS: NOT_TAGS_DEFAULT,
  FRENCH_TAGS,
  rpc,
  claimSearch,
  resolve,
  getStreamUrl,
  thumbnailUrl,
  getTrending,
  getChannelVideos,
  searchContent,
};
