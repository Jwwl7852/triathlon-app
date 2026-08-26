import { config, html } from "./lib/strava-shared.js";

export async function handler(event){
  if(event.httpMethod === "OPTIONS") return { statusCode: 204, headers: { "Access-Control-Allow-Origin":"*" } };
  try{
    const { clientId, redirectUri } = config();
    const url = new URL("https://www.strava.com/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("approval_prompt", "auto");
    url.searchParams.set("scope", "read,activity:read_all");
    return { statusCode: 302, headers: { Location: url.toString() }, body: "" };
  }catch(e){
    return html(500, `<h1>Strava config fejl</h1><pre>${e.message}</pre>`);
  }
}
