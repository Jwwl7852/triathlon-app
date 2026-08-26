import { json, stravaGet, getActivities, setActivities, getActivityFull, getSyncState, setSyncState } from "./lib/strava-shared.js";

export const config = {
  // Små historikbidder hver 2. time, så vi ikke rammer Strava unødigt hårdt.
  schedule: "0 */2 * * *"
};

function isRateLimitError(e){
  return String(e?.message || e).includes("429") || String(e?.message || e).toLowerCase().includes("rate limit");
}

async function backfillStep(){
  const syncState = await getSyncState();
  const backfill = syncState.backfill || { days:365, page:1, done:false };
  if(backfill.done){
    return { ok:true, skipped:true, reason:"Backfill er allerede færdig.", backfill };
  }

  const days = Number(backfill.days || 365);
  const page = Math.max(1, Number(backfill.page || 1));
  const perPage = 2;
  const after = Math.floor((Date.now() - days*24*3600*1000)/1000);

  const summaries = await stravaGet(`https://www.strava.com/api/v3/athlete/activities?after=${after}&page=${page}&per_page=${perPage}`);

  if(!Array.isArray(summaries) || summaries.length === 0){
    syncState.backfill = { ...backfill, done:true, finishedAt:new Date().toISOString() };
    await setSyncState(syncState);
    return { ok:true, done:true, page, processed:0, count:(await getActivities()).length };
  }

  const existing = await getActivities();
  const byId = new Map(existing.map(a => [String(a.id), a]));
  let fetchedDetails = 0;
  const errors = [];

  for(const s of summaries){
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

  syncState.backfill = {
    days,
    page: summaries.length < perPage ? page : page + 1,
    done: summaries.length < perPage,
    lastRunAt:new Date().toISOString(),
    lastProcessed:summaries.length,
    count:activities.length,
    errors
  };
  await setSyncState(syncState);

  return {
    ok:true,
    done:syncState.backfill.done,
    page,
    nextPage:syncState.backfill.page,
    processed:summaries.length,
    fetchedDetails,
    count:activities.length,
    errors
  };
}

export async function handler(event){
  try{
    const result = await backfillStep();
    return json(200, result);
  }catch(e){
    const syncState = await getSyncState().catch(()=>({}));
    syncState.backfill = { ...(syncState.backfill || {days:365,page:1}), lastError:e.message, lastErrorAt:new Date().toISOString() };
    await setSyncState(syncState).catch(()=>{});
    return json(isRateLimitError(e) ? 429 : 500, { ok:false, rateLimited:isRateLimitError(e), error:e.message });
  }
}
