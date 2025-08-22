"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

interface SliderProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value = [0],
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      ...props
    },
    ref,
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [parseFloat(event.target.value)];
      onValueChange?.(newValue);
    };

    const currentValue = value[0] ?? 0;
    const percentage = ((currentValue - min) / (max - min)) * 100;

    return (
      <div className="relative flex w-full touch-none items-center select-none">
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          className={cn(
            "bg-secondary relative h-2 w-full cursor-pointer appearance-none rounded-lg",
            className,
          )}
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--secondary)) ${percentage}%, hsl(var(--secondary)) 100%)`,
          }}
          {...props}
        />
        <div
          className="bg-primary absolute h-2 w-2 rounded-full shadow-lg"
          style={{ left: `${percentage}%`, transform: "translateX(-50%)" }}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
