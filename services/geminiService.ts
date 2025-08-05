
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResultData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
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

export const analyzeJobDescription = async (jobDescription: string): Promise<AnalysisResultData> => {
    try {
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
            throw new Error("The API returned an empty response. The job description might be too complex or ambiguous.");
        }
        
        const parsedResult = JSON.parse(jsonText);

        // Basic validation of the parsed object
        if (typeof parsedResult.isReplaceable !== 'boolean' || typeof parsedResult.replacementConfidence !== 'number' || typeof parsedResult.analysisSummary !== 'string' || !Array.isArray(parsedResult.automationFlow)) {
            throw new Error("Received malformed data structure from the API.");
        }
        
        return parsedResult as AnalysisResultData;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('json')) {
             throw new Error("The model returned a response that could not be parsed. Please try rephrasing the job description.");
        }
        throw new Error("An unexpected error occurred while communicating with the AI. Please try again later.");
    }
};
