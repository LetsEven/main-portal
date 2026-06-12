import React from "react";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  showRetry = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-red-400">
      <div className="flex items-center mb-3">
        <AlertCircleIcon className="w-5 h-5 text-red-500 mr-2" />
        <h3 className="text-xs uppercase tracking-widest font-medium text-red-600">
          Error
        </h3>
      </div>

      <p className="text-xs text-red-500 text-center mb-4 max-w-md uppercase tracking-widest">
        {message}
      </p>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center px-4 py-2 bg-[#023828] text-[#82E657] text-xs uppercase tracking-widest hover:bg-[#034d38] transition-colors"
        >
          <RefreshCwIcon className="w-3.5 h-3.5 mr-2" />
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
