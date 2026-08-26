import { json, stravaGet, getActivities, setActivities, getActivityFull, getSyncState, setSyncState } from "./lib/strava-shared.js";

export const config = {
  // Kører dagligt 03:10 UTC. Det er typisk tidlig morgen dansk tid.
  schedule: "10 3 * * *"
};

function isRateLimitError(e){
  return String(e?.message || e).includes("429") || String(e?.message || e).toLowerCase().includes("rate limit");
}

async function syncLatest(){
  const days = 7;
  const after = Math.floor((Date.now() - days*24*3600*1000)/1000);
  const perPage = 2;
  const summaries = await stravaGet(`https://www.strava.com/api/v3/athlete/activities?after=${after}&page=1&per_page=${perPage}`);

  const existing = await getActivities();
  const byId = new Map(existing.map(a => [String(a.id), a]));
  let fetchedDetails = 0;
  const errors = [];

  for(const s of summaries || []){
    try{
      const already = byId.get(String(s.id));
      if(already && already.streams && already.raw) continue;
      const full = await getActivityFull(s.id);
      byId.set(String(full.id), full);
      fetchedDetails++;
    }catch(e){
      if(isRateLimitError(e)) throw e;
      byId.set(String(s.id), { ...s, detail_error: e.message });
      errors.push({ id:s.id, error:e.message });
    }
  }

  const activities = [...byId.values()].sort((a,b)=>String(b.start_date || "").localeCompare(String(a.start_date || "")));
  await setActivities(activities);
  const syncState = await getSyncState();
  syncState.lastDailySyncAt = new Date().toISOString();
  syncState.lastDailySyncResult = { count:activities.length, fetchedSummaries:(summaries||[]).length, fetchedDetails, errors };
  await setSyncState(syncState);

  return { ok:true, count:activities.length, fetchedSummaries:(summaries||[]).length, fetchedDetails, errors };
}

export async function handler(event){
  try{
    const result = await syncLatest();
    return json(200, result);
  }catch(e){
    const syncState = await getSyncState().catch(()=>({}));
    syncState.lastDailySyncAt = new Date().toISOString();
    syncState.lastDailySyncError = e.message;
    await setSyncState(syncState).catch(()=>{});
    return json(isRateLimitError(e) ? 429 : 500, { ok:false, rateLimited:isRateLimitError(e), error:e.message });
  }
}
