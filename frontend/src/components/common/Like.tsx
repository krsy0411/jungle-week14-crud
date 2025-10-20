import React from "react";

interface LikeProps {
  isLiked: boolean;
  likeCount: number;
  onToggle: () => void;
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Like: React.FC<LikeProps> = ({
  isLiked,
  likeCount,
  onToggle,
  isLoading = false,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 transition-colors ${
        sizeClasses[size]
      } ${
        isLiked
          ? "text-red-500 hover:text-red-600"
          : "text-secondary-500 hover:text-red-500"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className="transition-transform hover:scale-110">
        {isLiked ? "❤️" : "🤍"}
      </span>
      <span className="font-medium">{likeCount}</span>
    </button>
  );
};
