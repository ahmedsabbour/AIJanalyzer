// IMPORTANT: This file should be created at `api/analyze.ts`.
// This code is designed to run on a serverless backend (like Vercel or Netlify), NOT in the browser.

import { GoogleGenAI, Type } from "@google/genai";

// This check runs when the function is initialized on the server.
// It's a server-side file, so process.env is secure and private.
if (!process.env.API_KEY) {
    throw new Error("CRITICAL: API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        isReplaceable: {
            type: Type.BOOLEAN,
            description: "True if the job can be significantly automated or fully replaced by an AI agent, false otherwise.",
        },
        replacementConfidence: {
            type: Type.NUMBER,
            description: "A confidence score from 0.0 to 1.0 indicating the likelihood of replacement. 1.0 is a certain replacement.",
        },
        analysisSummary: {
            type: Type.STRING,
            description: "A brief, one or two-sentence summary of the reasoning behind the replaceability verdict.",
        },
        automationFlow: {
            type: Type.ARRAY,
            description: "A list of actionable steps for the suggested automation flow. This should be an empty array if isReplaceable is false.",
            items: {
                type: Type.STRING,
            },
        },
    },
    required: ["isReplaceable", "replacementConfidence", "analysisSummary", "automationFlow"],
};

// This function signature is compatible with modern serverless platforms like Vercel Edge Functions.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const jobDescription = body.jobDescription;

        if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
            return new Response(JSON.stringify({ error: "Job description is missing or invalid." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following job description and determine its potential for automation by an AI agent. \n\nJob Description:\n---\n${jobDescription}\n---`,
            config: {
                systemInstruction: "You are an expert AI and business process automation consultant. Your task is to analyze a job description, determine its potential for automation by an AI agent, and provide a clear, concise analysis in JSON format.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
             return new Response(JSON.stringify({ error: "The API returned an empty response. The job description might be too complex or ambiguous." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // The response from Gemini with a schema is already a stringified JSON.
        // We send it directly back to the client.
        return new Response(jsonText, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in serverless function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return new Response(JSON.stringify({ error: `An unexpected error occurred on the server. Details: ${errorMessage}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Optional: This configures the runtime for Vercel deployments.
export const runtime = 'edge';
