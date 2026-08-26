import { json, requirePin, refreshTokensIfNeeded } from "./lib/strava-shared.js";

export async function handler(event){
  if(event.httpMethod === "OPTIONS") return { statusCode: 204, headers: { "Access-Control-Allow-Origin":"*" } };
  const pinError = requirePin(event);
  if(pinError) return pinError;
  try{
    const tokens = await refreshTokensIfNeeded();
    return json(200, {
      connected: true,
      athleteId: tokens.athlete?.id,
      athleteName: [tokens.athlete?.firstname, tokens.athlete?.lastname].filter(Boolean).join(" "),
      expires_at: tokens.expires_at,
      scope: tokens.scope
    });
  }catch(e){
    return json(200, { connected: false, error: e.message });
  }
}
