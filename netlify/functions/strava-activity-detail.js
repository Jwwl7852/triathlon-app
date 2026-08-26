import { json, requirePin, getActivities } from "./lib/strava-shared.js";

function sampleArray(arr, max = 900){
  if(!Array.isArray(arr)) return [];
  if(arr.length <= max) return arr;
  const step = arr.length / max;
  const out = [];
  for(let i=0;i<max;i++) out.push(arr[Math.floor(i*step)]);
  return out;
}

function compactLap(l){
  return {
    name: l.name,
    distance: l.distance,
    moving_time: l.moving_time,
    elapsed_time: l.elapsed_time,
    average_speed: l.average_speed,
    average_heartrate: l.average_heartrate,
    max_heartrate: l.max_heartrate,
    average_watts: l.average_watts,
    total_elevation_gain: l.total_elevation_gain,
    split: l.split
  };
}

function detailActivity(a){
  const streams = a.streams || {};
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    sport_type: a.sport_type,
    start_date: a.start_date,
    start_date_local: a.start_date_local,
    timezone: a.timezone,
    distance: a.distance,
    moving_time: a.moving_time,
    elapsed_time: a.elapsed_time,
    total_elevation_gain: a.total_elevation_gain,
    average_speed: a.average_speed,
    max_speed: a.max_speed,
    average_heartrate: a.average_heartrate,
    max_heartrate: a.max_heartrate,
    average_watts: a.average_watts,
    weighted_average_watts: a.weighted_average_watts,
    max_watts: a.max_watts,
    average_cadence: a.average_cadence,
    kilojoules: a.kilojoules,
    calories: a.calories,
    gear_id: a.gear_id,
    device_name: a.device_name,
    trainer: a.trainer,
    commute: a.commute,
    manual: a.manual,
    private: a.private,
    laps: Array.isArray(a.laps) ? a.laps.slice(0,80).map(compactLap) : [],
    splits_metric: Array.isArray(a.splits_metric) ? a.splits_metric.slice(0,80).map(compactLap) : [],
    streams: {
      time: sampleArray(streams.time, 900),
      distance: sampleArray(streams.distance, 900),
      latlng: sampleArray(streams.latlng, 900),
      altitude: sampleArray(streams.altitude, 900),
      velocity_smooth: sampleArray(streams.velocity_smooth, 900),
      heartrate: sampleArray(streams.heartrate, 900),
      cadence: sampleArray(streams.cadence, 900),
      watts: sampleArray(streams.watts, 900),
      temp: sampleArray(streams.temp, 900),
      moving: sampleArray(streams.moving, 900),
      grade_smooth: sampleArray(streams.grade_smooth, 900),
      error: streams.error
    },
    streamMeta: {
      originalPoints: Array.isArray(streams.time) ? streams.time.length : 0,
      returnedPoints: Array.isArray(streams.time) ? sampleArray(streams.time, 900).length : 0,
      sampled: Array.isArray(streams.time) && streams.time.length > 900
    },
    detail_error: a.detail_error || ""
  };
}

export async function handler(event){
  if(event.httpMethod === "OPTIONS") return { statusCode: 204, headers: { "Access-Control-Allow-Origin":"*" } };
  const pinError = requirePin(event);
  if(pinError) return pinError;

  try{
    const id = event.queryStringParameters?.id;
    if(!id) return json(400, { error: "Mangler id" });

    const activities = await getActivities();
    const activity = activities.find(a => String(a.id) === String(id));
    if(!activity) return json(404, { error: "Aktivitet ikke fundet" });

    return json(200, { activity: detailActivity(activity) });
  }catch(e){
    return json(500, { error: e.message });
  }
}
