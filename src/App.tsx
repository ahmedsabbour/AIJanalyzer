import React, { useState, useCallback } from 'react';
import { AnalysisResultData } from './types';
import { analyzeJobDescription } from './services/geminiService';
import JobInputForm from './components/JobInputForm';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';
import { RobotIcon } from './components/icons';

const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = useCallback(async () => {
    if (!jobDescription.trim()) {
      setError('Job description cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeJobDescription(jobDescription);
      setAnalysisResult(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [jobDescription]);

  const handleReset = useCallback(() => {
    setJobDescription('');
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-dark text-neutral-light flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-2">
            <RobotIcon className="w-12 h-12 text-brand-accent" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              AI Job Automation Analyzer
            </h1>
          </div>
          <p className="text-lg text-gray-400">
            Paste a job description below to see if an AI agent could take over.
          </p>
        </header>

        <main className="bg-neutral-medium p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/30 border border-gray-700">
          {!analysisResult && !isLoading && (
            <JobInputForm
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              onAnalyze={handleAnalysis}
              isLoading={isLoading}
            />
          )}
          
          {isLoading && <Loader />}

          {error && (
             <div className="text-center">
                <p className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</p>
                <button
                    onClick={handleReset}
                    className="mt-6 bg-brand-accent hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
                >
                    Try Again
                </button>
            </div>
          )}

          {analysisResult && !isLoading && (
            <AnalysisResult result={analysisResult} onReset={handleReset} />
          )}
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm space-y-1">
            <p>Powered by Google Gemini</p>
            <p>
                All rights reserved to <a href="https://nrg-digital.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300 transition-colors">Nrg Digital</a>
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
