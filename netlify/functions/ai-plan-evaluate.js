import OpenAI from "openai";
import { json, requirePin, corsHeaders } from "./lib/strava-shared.js";

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    coachSummary: { type: "string" },
    readinessColor: { type: "string", enum: ["green", "yellow", "red"] },
    overallAssessment: { type: "string" },
    keyRisks: { type: "array", items: { type: "string" } },
    next14DaysFocus: { type: "array", items: { type: "string" } },
    suggestedAdjustments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: "string" },
          discipline: { type: "string" },
          titleIncludes: { type: "string" },
          newPlanMinutes: { type: ["number", "null"] },
          newPlanKm: { type: ["number", "null"] },
          intensity: { type: "string" },
          reason: { type: "string" }
        },
        required: ["date", "discipline", "titleIncludes", "newPlanMinutes", "newPlanKm", "intensity", "reason"]
      }
    },
    nutritionAndWeightNote: { type: "string" },
    warning: { type: "string" }
  },
  required: ["coachSummary", "readinessColor", "overallAssessment", "keyRisks", "next14DaysFocus", "suggestedAdjustments", "nutritionAndWeightNote", "warning"]
};

export async function handler(event){
  if(event.httpMethod === "OPTIONS") return { statusCode: 204, headers: corsHeaders, body: "" };
  const pinError = requirePin(event);
  if(pinError) return pinError;

  try{
    if(event.httpMethod !== "POST") return json(405, { error: "Brug POST" });
    if(!process.env.OPENAI_API_KEY){
      return json(500, { error: "Mangler OPENAI_API_KEY i Netlify environment variables." });
    }

    const body = JSON.parse(event.body || "{}");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-5";

    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content:
            "Du er en erfaren dansk triatloncoach. Brug data konservativt. " +
            "Målet er Copenhagen Marathon 2027, Køge 1/2 Ironman 2027 og IRONMAN Copenhagen 2027. " +
            "Prioritér skadesforebyggelse, rolig progression og realistisk træning. " +
            "Giv konkrete forslag til næste 14 dage. Justér ikke afsluttede træninger. " +
            "Hvis data er sparsomme, skriv det tydeligt og lav få, forsigtige forslag. Returnér kun JSON."
        },
        {
          role: "user",
          content: JSON.stringify(body)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "triathlon_ai_plan",
          strict: false,
          schema
        }
      }
    });

    let result;
    try{
      result = JSON.parse(response.output_text || "{}");
    }catch(e){
      result = {
        coachSummary: response.output_text || "AI svarede ikke i JSON-format.",
        readinessColor: "yellow",
        overallAssessment: "Kunne ikke parse struktureret AI-svar.",
        keyRisks: [],
        next14DaysFocus: [],
        suggestedAdjustments: [],
        nutritionAndWeightNote: "",
        warning: "Ingen automatiske ændringer lavet."
      };
    }

    return json(200, { ok: true, model, result });
  }catch(e){
    return json(500, { ok: false, error: e.message, stack: e.stack });
  }
}
