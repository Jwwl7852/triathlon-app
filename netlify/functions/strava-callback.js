import { exchangeCode, setTokens, html } from "./lib/strava-shared.js";

export async function handler(event){
  try{
    const code = event.queryStringParameters?.code;
    const error = event.queryStringParameters?.error;
    if(error) return html(400, `<h1>Strava afbrød</h1><pre>${error}</pre>`);
    if(!code) return html(400, "<h1>Mangler code fra Strava</h1>");
    const tokens = await exchangeCode(code);
    await setTokens(tokens);
    return html(200, `
      <h1>Strava er forbundet ✅</h1>
      <p>Du kan lukke dette vindue og gå tilbage til triathlon-appen.</p>
      <p>Tryk derefter “Tjek status”, “Synk seneste 365 dage” og “Importer synk til app”.</p>
    `);
  }catch(e){
    return html(500, `<h1>Strava callback fejl</h1><pre>${e.stack || e.message}</pre>`);
  }
}
