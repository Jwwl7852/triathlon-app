import { json, requirePin } from "./lib/strava-shared.js";

export async function handler(event){
  if(event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "Access-Control-Allow-Origin":"*" } };
  }
  const pinError = requirePin(event);
  if(pinError) return pinError;
  return json(200, {
    ok: true,
    env: {
      STRAVA_CLIENT_ID: !!process.env.STRAVA_CLIENT_ID,
      STRAVA_CLIENT_SECRET: !!process.env.STRAVA_CLIENT_SECRET,
      STRAVA_REDIRECT_URI: process.env.STRAVA_REDIRECT_URI || null,
      APP_PIN: !!process.env.APP_PIN,
      NETLIFY_SITE_ID: !!process.env.NETLIFY_SITE_ID,
      NETLIFY_AUTH_TOKEN: !!process.env.NETLIFY_AUTH_TOKEN
    },
    note: "Secrets vises kun som true/false. Denne version bruger eksplicit getStore({ name, siteID, token })."
  });
}
