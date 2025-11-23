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

  // Determinar color plano según el valor
  const getColor = (val: number) => {
    if (val < 40) return "#dc2626"; // Rojo
    if (val < 70) return "#f59e0b"; // Amarillo
    return "#16a34a"; // Verde
  };

  const color = getColor(value);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20}>
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
          stroke={color}
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
