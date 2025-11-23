import React from "react";

interface PHIGaugeProps {
  value: number;
  size?: number;
  label: string;
}

const PHIGauge: React.FC<PHIGaugeProps> = ({ value, size = 160, label }) => {
  const percentage = value / 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20}>
        <defs>
          <linearGradient id={`g-${label}`} x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          } ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          } ${size / 2}`}
          fill="none"
          stroke={`url(#g-${label})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          className="text-3xl font-bold fill-gray-900"
        >
          {value}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 15}
          textAnchor="middle"
          className="text-xs fill-gray-600"
        >
          {label}
        </text>
      </svg>
    </div>
  );
};

export default PHIGauge;
