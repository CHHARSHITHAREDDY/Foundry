"use client";

import React, { useState } from "react";

export function BudgetSlider({
  min = 10,
  max = 500,
  step = 10,
  initial = 50,
  onChange,
}: {
  min?: number;
  max?: number;
  step?: number;
  initial?: number;
  onChange?: (val: number) => void;
}) {
  const [val, setVal] = useState(initial);
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between font-mono text-xs">
        <span className="text-secondary">BUDGET:</span>
        <span className="font-bold text-on-surface">${val} USD</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => {
          const v = Number(e.target.value);
          setVal(v);
          onChange?.(v);
        }}
        className="w-full accent-primary cursor-pointer"
      />
    </div>
  );
}

