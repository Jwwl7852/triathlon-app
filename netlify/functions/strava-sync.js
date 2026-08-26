import { json, html, requirePin, stravaGet, getActivities, setActivities, getActivityFull } from "./lib/strava-shared.js";

async function doSync(days){
  const after = Math.floor((Date.now() - days*24*3600*1000)/1000);
  let page = 1;
  const perPage = 50;
  const summaries = [];
  while(page <= 10){
    const list = await stravaGet(`https://www.strava.com/api/v3/athlete/activities?after=${after}&page=${page}&per_page=${perPage}`);
    if(!Array.isArray(list) || list.length === 0) break;
    summaries.push(...list);
    if(list.length < perPage) break;
    page++;
  }
  const existing = await getActivities();
  const byId = new Map(existing.map(a => [String(a.id), a]));
  let fetchedDetails = 0;
  for(const s of summaries){
    try{
      const full = await getActivityFull(s.id);
      byId.set(String(full.id), full);
      fetchedDetails++;
    }catch(e){
      byId.set(String(s.id), { ...s, detail_error: e.message });
    }
  }
  const activities = [...byId.values()].sort((a,b)=>String(b.start_date || "").localeCompare(String(a.start_date || "")));
  await setActivities(activities);
  return { ok:true, count:activities.length, fetchedSummaries:summaries.length, fetchedDetails };
}

export async function handler(event){
  if(event.httpMethod === "OPTIONS") return { statusCode: 204, headers: { "Access-Control-Allow-Origin":"*" } };
  const pinError = requirePin(event);
  if(pinError) return pinError;
  try{
    const days = Number(event.queryStringParameters?.days || 365);
    const result = await doSync(days);
    const accept = event.headers.accept || "";
    if(event.httpMethod === "GET" && accept.includes("text/html")){
      return html(200, `<h1>Strava sync færdig ✅</h1><pre>${JSON.stringify(result,null,2)}</pre><p>Gå tilbage til appen og tryk “Importer synk til app”.</p>`);
    }
    return json(200, result);
  }catch(e){
    return json(500, { ok:false, error:e.message, stack:e.stack });
  }
}
