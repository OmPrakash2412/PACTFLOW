import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}) => {
  const variantStyles = {
    text: "rounded-md h-4 w-full",
    rectangular: "rounded-xl w-full",
    circular: "rounded-full aspect-square",
  };

  return (
    <div
      className={`animate-pulse bg-stone-200/80 backdrop-blur-sm ${variantStyles[variant]} ${className}`}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};
