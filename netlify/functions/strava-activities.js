import { json, requirePin, getActivities } from "./lib/strava-shared.js";

function compactActivity(a){
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
    detail_error: a.detail_error || "",
    hasStreams: !!(a.streams && (
      (a.streams.time && a.streams.time.length) ||
      (a.streams.heartrate && a.streams.heartrate.length) ||
      (a.streams.watts && a.streams.watts.length)
    ))
  };
}

export async function handler(event){
  if(event.httpMethod === "OPTIONS") return { statusCode: 204, headers: { "Access-Control-Allow-Origin":"*" } };
  const pinError = requirePin(event);
  if(pinError) return pinError;

  try{
    const activities = await getActivities();

    // Standard: send kompakt liste, så Netlify ikke rammer ResponseSizeTooLarge.
    // Tunge felter som streams, raw, segment_efforts, best_efforts og laps bliver liggende i Blobs.
    const limit = Math.min(500, Math.max(1, Number(event.queryStringParameters?.limit || 300)));
    const offset = Math.max(0, Number(event.queryStringParameters?.offset || 0));
    const compact = String(event.queryStringParameters?.full || "") !== "1";

    const slice = activities.slice(offset, offset + limit);
    const payloadActivities = compact ? slice.map(compactActivity) : slice;

    return json(200, {
      activities: payloadActivities,
      total: activities.length,
      offset,
      limit,
      compact,
      hasMore: offset + limit < activities.length
    });
  }catch(e){
    return json(500, { error: e.message });
  }
}
