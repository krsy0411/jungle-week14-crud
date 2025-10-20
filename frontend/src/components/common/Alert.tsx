import React from "react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
}) => {
  const colors = {
    success: {
      bg: "bg-success-50",
      border: "border-success-200",
      title: "text-success-900",
      message: "text-success-700",
      icon: "✅",
    },
    error: {
      bg: "bg-danger-50",
      border: "border-danger-200",
      title: "text-danger-900",
      message: "text-danger-700",
      icon: "❌",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      title: "text-yellow-900",
      message: "text-yellow-700",
      icon: "⚠️",
    },
    info: {
      bg: "bg-primary-50",
      border: "border-primary-200",
      title: "text-primary-900",
      message: "text-primary-700",
      icon: "ℹ️",
    },
  };

  const color = colors[type];

  return (
    <div
      className={`${color.bg} border ${color.border} rounded-lg p-4 flex justify-center items-center gap-3`}
      role="alert"
    >
      <span className={`text-xl flex-shrink-0 ${color.title}`}>
        {color.icon}
      </span>
      <div className="flex-1">
        {title && <h4 className={`font-semibold ${color.title}`}>{title}</h4>}
        <p className={color.message}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`text-3xl flex-shrink-0 ${color.title} hover:opacity-70`}
          aria-label="닫기"
        >
          ×
        </button>
      )}
    </div>
  );
};
