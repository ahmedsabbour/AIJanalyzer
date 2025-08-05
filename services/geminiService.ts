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
            let errorMessage = `API request failed with status ${response.status}`;
            try {
                // Try to parse a more specific error message from the backend.
                const errorBody = await response.json();
                if (errorBody.error) {
                    errorMessage = errorBody.error;
                }
            } catch (e) {
                // The response body was not JSON or was empty. The status text is a good fallback.
                errorMessage = response.statusText;
            }
            throw new Error(`Server error: ${errorMessage}`);
        }

        const result: AnalysisResultData = await response.json();
        
        // Client-side validation to ensure the data from the server is in the expected format.
        if (
            typeof result.isReplaceable !== 'boolean' ||
            typeof result.replacementConfidence !== 'number' ||
            typeof result.analysisSummary !== 'string' ||
            !Array.isArray(result.automationFlow)
        ) {
            throw new Error("Received malformed data structure from the server.");
        }

        return result;

    } catch (error) {
        console.error("Error calling analysis API endpoint:", error);
        // Re-throw a user-friendly error to be displayed in the UI.
        const errorMessage = error instanceof Error ? error.message : "An unknown communication error occurred.";
        throw new Error(`Failed to analyze job description. Details: ${errorMessage}`);
    }
};
