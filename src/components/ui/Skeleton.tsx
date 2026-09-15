import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-[#e8efe9] rounded-[4px] ${className}`}
      {...props}
    />
  );
}
