
import React from 'react';

interface JobInputFormProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const JobInputForm: React.FC<JobInputFormProps> = ({
  jobDescription,
  onJobDescriptionChange,
  onAnalyze,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <textarea
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        placeholder="e.g., Paste a job description or a URL like https://jobs.example.com/software-engineer..."
        className="w-full h-64 p-4 bg-neutral-dark text-gray-300 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-colors duration-300 resize-y"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !jobDescription.trim()}
        className="w-full flex items-center justify-center gap-2 bg-brand-accent hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
      >
        Analyze
      </button>
    </form>
  );
};

export default JobInputForm;