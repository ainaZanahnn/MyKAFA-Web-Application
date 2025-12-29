/** @format */

import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  showTooltip?: boolean;
  onRulesChange?: (unmet: string[]) => void;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  required = false,
  showTooltip = false,
  onRulesChange,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Simple validation rules
  const rules = [
    { test: /.{8,}/, message: "Sekurang-kurangnya 8 aksara" },
    { test: /[A-Z]/, message: "Mengandungi huruf besar (A-Z)" },
    { test: /[a-z]/, message: "Mengandungi huruf kecil (a-z)" },
    { test: /[0-9]/, message: "Mengandungi nombor (0-9)" },
    { test: /[^A-Za-z0-9]/, message: "Mengandungi simbol khas (!@#$%^&*)" },
  ];

  const failedRules = rules.filter((rule) => !rule.test.test(value));
  const allValid = failedRules.length === 0; // ✅ define this

  // notify parent when validity changes
  useEffect(() => {
    if (onRulesChange) {
      onRulesChange(failedRules.map((r) => r.message));
    }
  }, [value]);

  // Close popover if click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={popoverRef}>
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        {showTooltip && (
          <button
            type="button"
            onClick={() => setShowPopover(!showPopover)}
            className={`${
              allValid ? "text-green-600" : "text-red-600"
            } absolute left-16 bg-transparent hover:opacity-80`}
          >
            <Info size={16} />
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          className={`${
            !allValid && value.length > 0
              ? "border-red-500 focus:ring-red-500"
              : ""
          }`}
        />

        {/* Toggle Eye */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 bg-transparent hover:text-gray-700 focus:outline-none"
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {/* Popover (only appears when clicked) */}
      {showTooltip && showPopover && (
        <div
          className={`absolute left-0 mt-2 w-72 border shadow-lg rounded-md text-sm p-3 space-y-1 z-10
              ${
                allValid
                  ? "bg-green-50 border-green-400 text-green-700"
                  : "bg-red-50 border-red-400 text-red-700"
              }`}
        >
          <p className="font-medium text-gray-700">Kata laluan mesti:</p>
          {rules.map((rule, idx) => (
            <p
              key={idx}
              className={
                rule.test.test(value) ? "text-green-600" : "text-red-500"
              }
            >
              • {rule.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
