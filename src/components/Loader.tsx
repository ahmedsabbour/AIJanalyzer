
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-10">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-accent"></div>
      <p className="text-lg text-gray-300">Analyzing... The AI is thinking.</p>
    </div>
  );
};

export default Loader;
