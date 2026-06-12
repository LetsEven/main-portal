import React from "react";
import { RefreshCwIcon } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message = "Cargando...",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <RefreshCwIcon
        className={`${sizeClasses[size]} text-[#023828] animate-spin`}
      />
      {message && (
        <p className="mt-2 text-xs uppercase tracking-widest text-[#023828]/50">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
