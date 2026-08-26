import { json, requirePin, getActivities } from "./lib/strava-shared.js";

export async function handler(event){
  if(event.httpMethod === "OPTIONS") return { statusCode: 204, headers: { "Access-Control-Allow-Origin":"*" } };
  const pinError = requirePin(event);
  if(pinError) return pinError;
  try{
    const activities = await getActivities();
    return json(200, { activities });
  }catch(e){
    return json(500, { error: e.message });
  }
}
