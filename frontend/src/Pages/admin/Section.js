import { useState } from 'react';

const Section = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="card bg-base-100 shadow-md mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between w-full 
             bg-[#4b4fa3] text-white 
             px-5 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-medium tracking-wide flex-grow">{title}</h2>
        <div className="flex items-center">
          {/* Arrow indicator */}
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          {/* Right-pointing triangle arrow */}
          
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? ' opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Section;