import { getStore } from "@netlify/blobs";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,x-app-pin",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

export function json(statusCode, data){
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
}

export function html(statusCode, body){
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    body
  };
}

export function requirePin(event){
  const expected = process.env.APP_PIN || "";
  if(!expected) return null;
  const supplied = event.queryStringParameters?.pin || event.headers["x-app-pin"] || event.headers["X-App-Pin"] || "";
  if(supplied !== expected){
    return json(401, { error: "Mangler eller forkert APP_PIN" });
  }
  return null;
}

export function config(){
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  if(!clientId || !clientSecret || !redirectUri){
    throw new Error("Mangler STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET eller STRAVA_REDIRECT_URI i Netlify environment variables.");
  }
  return { clientId, clientSecret, redirectUri };
}

export const store = getStore("triathlon-strava");

export async function getTokens(){
  return await store.get("tokens", { type: "json" });
}
export async function setTokens(tokens){
  await store.setJSON("tokens", tokens);
}
export async function getActivities(){
  return (await store.get("activities", { type: "json" })) || [];
}
export async function setActivities(activities){
  await store.setJSON("activities", activities);
}

export async function exchangeCode(code){
  const { clientId, clientSecret } = config();
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code"
  });
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  if(!res.ok) throw new Error(`Token exchange failed ${res.status}: ${await res.text()}`);
  return await res.json();
}

export async function refreshTokensIfNeeded(){
  const { clientId, clientSecret } = config();
  const tokens = await getTokens();
  if(!tokens?.refresh_token) throw new Error("Ingen Strava refresh token. Forbind Strava først.");
  const now = Math.floor(Date.now()/1000);
  if(tokens.access_token && tokens.expires_at && tokens.expires_at > now + 120){
    return tokens;
  }
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token
  });
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  if(!res.ok) throw new Error(`Token refresh failed ${res.status}: ${await res.text()}`);
  const fresh = await res.json();
  const merged = { ...tokens, ...fresh, athlete: fresh.athlete || tokens.athlete };
  await setTokens(merged);
  return merged;
}

export async function stravaGet(url){
  const tokens = await refreshTokensIfNeeded();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  if(!res.ok) throw new Error(`Strava GET failed ${res.status}: ${await res.text()}`);
  return await res.json();
}

function streamArray(streams, key){
  return streams?.[key]?.data || [];
}

export async function getActivityFull(activityId){
  const activity = await stravaGet(`https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=true`);
  let streams = {};
  try {
    streams = await stravaGet(`https://www.strava.com/api/v3/activities/${activityId}/streams?keys=time,distance,latlng,altitude,velocity_smooth,heartrate,cadence,watts,temp,moving,grade_smooth&key_by_type=true`);
  } catch (e) {
    streams = { error: e.message };
  }
  return {
    id: activity.id,
    name: activity.name,
    type: activity.type,
    sport_type: activity.sport_type,
    start_date: activity.start_date,
    start_date_local: activity.start_date_local,
    timezone: activity.timezone,
    distance: activity.distance,
    moving_time: activity.moving_time,
    elapsed_time: activity.elapsed_time,
    total_elevation_gain: activity.total_elevation_gain,
    average_speed: activity.average_speed,
    max_speed: activity.max_speed,
    average_heartrate: activity.average_heartrate,
    max_heartrate: activity.max_heartrate,
    average_watts: activity.average_watts,
    weighted_average_watts: activity.weighted_average_watts,
    max_watts: activity.max_watts,
    average_cadence: activity.average_cadence,
    kilojoules: activity.kilojoules,
    calories: activity.calories,
    gear_id: activity.gear_id,
    device_name: activity.device_name,
    trainer: activity.trainer,
    commute: activity.commute,
    manual: activity.manual,
    private: activity.private,
    laps: activity.laps || [],
    splits_metric: activity.splits_metric || [],
    splits_standard: activity.splits_standard || [],
    best_efforts: activity.best_efforts || [],
    segment_efforts: activity.segment_efforts || [],
    streams: {
      time: streamArray(streams, "time"),
      distance: streamArray(streams, "distance"),
      latlng: streamArray(streams, "latlng"),
      altitude: streamArray(streams, "altitude"),
      velocity_smooth: streamArray(streams, "velocity_smooth"),
      heartrate: streamArray(streams, "heartrate"),
      cadence: streamArray(streams, "cadence"),
      watts: streamArray(streams, "watts"),
      temp: streamArray(streams, "temp"),
      moving: streamArray(streams, "moving"),
      grade_smooth: streamArray(streams, "grade_smooth"),
      error: streams.error
    },
    raw: activity
  };
}
