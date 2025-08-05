
import React from 'react';
import { AnalysisResultData } from '../types';
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from './icons';

interface AnalysisResultProps {
  result: AnalysisResultData;
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onReset }) => {
  const confidencePercentage = (result.replacementConfidence * 100).toFixed(0);
  const confidenceColor =
    result.replacementConfidence > 0.75
      ? 'text-green-400'
      : result.replacementConfidence > 0.4
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <div className={`flex items-center gap-4 p-4 rounded-lg ${result.isReplaceable ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'} border`}>
          {result.isReplaceable ? (
            <CheckCircleIcon className="w-12 h-12 text-green-400 flex-shrink-0" />
          ) : (
            <XCircleIcon className="w-12 h-12 text-red-400 flex-shrink-0" />
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">
              {result.isReplaceable ? 'High Potential for AI Automation' : 'Low Potential for AI Automation'}
            </h2>
            <p className="text-gray-300">{result.analysisSummary}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-4 text-center">
            <span className="text-gray-400">Confidence Score:</span>
            <span className={`text-xl font-bold ${confidenceColor}`}>{confidencePercentage}%</span>
            <div className="w-48 bg-gray-700 rounded-full h-2.5">
                <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${confidencePercentage}%` }}></div>
            </div>
        </div>
      </div>

      {result.isReplaceable && result.automationFlow.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">Suggested Automation Flow:</h3>
          <ol className="space-y-3">
            {result.automationFlow.map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-1.5 flex items-center justify-center w-6 h-6 bg-brand-secondary text-white font-bold rounded-full text-sm">
                  {index + 1}
                </span>
                <p className="text-gray-300">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
      
      <div className="text-center pt-4 border-t border-gray-700">
        <button
          onClick={onReset}
          className="bg-brand-accent hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center gap-2 mx-auto"
        >
          Analyze Another Job <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AnalysisResult;
