import { json, html, requirePin, stravaGet, getActivities, setActivities, getActivityFull } from "./lib/strava-shared.js";

function isRateLimitError(e){
  return String(e?.message || e).includes("429") || String(e?.message || e).toLowerCase().includes("rate limit");
}
function nextQuarterHourText(){
  const d = new Date();
  const mins = d.getMinutes();
  const add = 15 - (mins % 15);
  d.setMinutes(mins + add, 5, 0);
  return d.toLocaleTimeString("da-DK", { hour:"2-digit", minute:"2-digit" });
}

async function doSyncPage(days, page, perPage){
  const after = Math.floor((Date.now() - days*24*3600*1000)/1000);

  let summaries;
  try{
    summaries = await stravaGet(`https://www.strava.com/api/v3/athlete/activities?after=${after}&page=${page}&per_page=${perPage}`);
  }catch(e){
    if(isRateLimitError(e)){
      const existing = await getActivities();
      return { ok:false, rateLimited:true, done:false, page, nextPage:page, processed:0, fetchedDetails:0, count:existing.length, retryAfterText:nextQuarterHourText(), error:e.message };
    }
    throw e;
  }

  if(!Array.isArray(summaries) || summaries.length === 0){
    const existing = await getActivities();
    return {
      ok: true,
      done: true,
      page,
      nextPage: null,
      processed: 0,
      fetchedDetails: 0,
      count: existing.length,
      message: "Ingen flere aktiviteter."
    };
  }

  const existing = await getActivities();
  const byId = new Map(existing.map(a => [String(a.id), a]));

  let fetchedDetails = 0;
  const errors = [];

  for(const s of summaries){
    try{
      const full = await getActivityFull(s.id);
      byId.set(String(full.id), full);
      fetchedDetails++;
    }catch(e){
      if(isRateLimitError(e)){
        const activities = [...byId.values()].sort((a,b)=>String(b.start_date || "").localeCompare(String(a.start_date || "")));
        await setActivities(activities);
        return { ok:false, rateLimited:true, done:false, page, nextPage:page, processed:fetchedDetails, fetchedDetails, count:activities.length, retryAfterText:nextQuarterHourText(), error:e.message, errors };
      }
      byId.set(String(s.id), { ...s, detail_error: e.message });
      errors.push({ id: s.id, error: e.message });
    }
  }

  const activities = [...byId.values()].sort((a,b)=>String(b.start_date || "").localeCompare(String(a.start_date || "")));
  await setActivities(activities);

  return {
    ok: true,
    done: summaries.length < perPage,
    page,
    nextPage: summaries.length < perPage ? null : page + 1,
    processed: summaries.length,
    fetchedDetails,
    count: activities.length,
    errors
  };
}

export async function handler(event){
  if(event.httpMethod === "OPTIONS") return { statusCode: 204, headers: { "Access-Control-Allow-Origin":"*" } };
  const pinError = requirePin(event);
  if(pinError) return pinError;

  try{
    let body = {};
    try { body = event.body ? JSON.parse(event.body) : {}; } catch(e) {}
    const days = Number(event.queryStringParameters?.days || body.days || 365);
    const page = Math.max(1, Number(event.queryStringParameters?.page || body.page || 1));
    const perPage = Math.min(2, Math.max(1, Number(event.queryStringParameters?.perPage || body.perPage || 2)));

    const result = await doSyncPage(days, page, perPage);

    const accept = event.headers.accept || "";
    if(event.httpMethod === "GET" && accept.includes("text/html")){
      return html(200, `
        <h1>Strava sync side ${page} færdig ✅</h1>
        <pre>${JSON.stringify(result,null,2)}</pre>
        ${result.done ? "<p>Der er ikke flere sider. Gå tilbage til appen og tryk “Importer synk til app”.</p>" : `<p>Næste side: <a href="/.netlify/functions/strava-sync-page?days=${days}&page=${result.nextPage}&perPage=${perPage}">sync side ${result.nextPage}</a></p>`}
      `);
    }

    return json(200, result);
  }catch(e){
    return json(500, { ok:false, error:e.message, stack:e.stack });
  }
}
