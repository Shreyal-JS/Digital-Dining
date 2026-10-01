import React, { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable, children, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden",
          hoverable && "transition-shadow hover:shadow-md",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
