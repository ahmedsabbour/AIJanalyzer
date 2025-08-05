import { AnalysisResultData } from '../types';

/**
 * Calls the backend serverless function to analyze the job description.
 * This approach is secure as the API key is handled on the server, not in the client.
 * @param jobDescription The job description string to be analyzed.
 * @returns A promise that resolves to the analysis result.
 */
export const analyzeJobDescription = async (jobDescription: string): Promise<AnalysisResultData> => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobDescription }),
        });

        if (!response.ok) {
            let errorMessage;
            // Try to get a specific error message from the JSON response body.
            try {
                const errorBody = await response.json();
                errorMessage = errorBody.error || `Server responded with status ${response.status}`;
            } catch (e) {
                // If the response isn't JSON, it's likely a fatal server error (e.g., crash, timeout).
                if (response.status === 500) {
                    errorMessage = "A critical server error occurred. This could be due to a misconfiguration (like a missing API key) on the server. Please check your project's environment variables on Vercel and the function logs for details.";
                } else {
                    errorMessage = `An unexpected error occurred. Server responded with status: ${response.status}`;
                }
            }
            throw new Error(errorMessage);
        }

        const result: AnalysisResultData = await response.json();
        
        // Client-side validation to ensure the data from the server is in the expected format.
        if (
            typeof result.isReplaceable !== 'boolean' ||
            typeof result.replacementConfidence !== 'number' ||
            typeof result.analysisSummary !== 'string' ||
            !Array.isArray(result.automationFlow)
        ) {
            throw new Error("Received malformed data from the server.");
        }

        return result;

    } catch (error) {
        console.error("Error in analyzeJobDescription:", error);
        // Re-throw the error to be handled by the UI component.
        // The message is already formatted, so we don't need to wrap it.
        throw error;
    }
};