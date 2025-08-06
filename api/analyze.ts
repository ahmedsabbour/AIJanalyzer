// IMPORTANT: This file should be created at `api/analyze.ts`.
// This code is designed to run on a serverless backend (like Vercel or Netlify), NOT in the browser.

import { GoogleGenAI } from "@google/genai";

// This function signature is compatible with modern serverless platforms like Vercel Edge Functions.
export async function POST(request: Request) {
    // Explicitly check for the API key on every request.
    // This provides a clear error message if the environment variable is missing.
    if (!process.env.API_KEY) {
        console.error("CRITICAL: API_KEY environment variable is not set on the server.");
        return new Response(JSON.stringify({ error: "Configuration error: The API key is missing on the server. Please ensure the API_KEY environment variable is set in the Vercel project settings." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `You are an expert AI and business process automation consultant. Your task is to analyze a job description (which could be plain text or a URL), determine its potential for automation by an AI agent, and provide a clear, concise analysis.
You MUST respond with ONLY a valid JSON object and nothing else. Do not include any other text, explanations, or markdown formatting like \`\`\`json.
The JSON object must conform to this structure:
{
  "isReplaceable": boolean,
  "replacementConfidence": number,
  "analysisSummary": string,
  "automationFlow": string[]
}`;

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
            contents: `Analyze the following job description (which may be plain text or a URL) and determine its potential for automation by an AI agent. \n\nJob Description:\n---\n${jobDescription}\n---`,
            config: {
                systemInstruction: systemInstruction,
                tools: [{googleSearch: {}}],
                temperature: 0.2,
            },
        });
        
        if (!response || !response.candidates || response.candidates.length === 0) {
            console.error("Gemini API returned no candidates. Full Response:", JSON.stringify(response, null, 2));
            const blockReason = response?.promptFeedback?.blockReason;
            const errorMessage = blockReason
                ? `Request was blocked by the API. Reason: ${blockReason}`
                : "The AI model did not return a valid response. This might be a temporary issue or a problem with the prompt.";

            return new Response(JSON.stringify({ error: errorMessage }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks
            ?.map(chunk => chunk.web)
            .filter((web): web is { uri: string; title: string } => !!(web?.uri && web.title)) || [];

        let jsonText = response.text?.trim();

        if (!jsonText) {
             console.error("Gemini API returned empty text. Full response:", JSON.stringify(response, null, 2));
             return new Response(JSON.stringify({ error: "The API returned an empty response. The job description might be too complex or ambiguous." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.slice(7, -3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.slice(3, -3).trim();
        }
        
        try {
            const analysisResult = JSON.parse(jsonText);
            const responsePayload = {
                ...analysisResult,
                sources: sources,
            };
            return new Response(JSON.stringify(responsePayload), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (e) {
            console.error("Failed to parse JSON response from Gemini:", jsonText, "Error:", e);
            return new Response(JSON.stringify({ error: "The AI model returned a response that could not be understood. It might not be valid JSON." }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

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