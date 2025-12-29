/** @format */

// src/components/ui/custome/select.tsx
import * as React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ children, className = "", ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
    >
      {children}
    </select>
  );
}

export interface SelectItemProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({ value, children, ...props }: SelectItemProps) {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
}
