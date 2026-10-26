"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: (SelectOption | { value: string; label: string })[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  name?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  buttonClassName = "",
  disabled = false,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Hidden input for form serialization if needed */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm text-left transition-all duration-200 cursor-pointer select-none ${
          isOpen
            ? "border-aviation-yellow ring-2 ring-aviation-yellow/25 bg-white shadow-sm"
            : "border-aviation-border bg-white hover:border-aviation-charcoal/40"
        } ${
          disabled ? "opacity-50 cursor-not-allowed bg-aviation-lightGray" : ""
        } ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate font-medium text-aviation-black">
          {selectedOption ? selectedOption.label : <span className="text-aviation-muted">{placeholder}</span>}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-aviation-charcoal shrink-0 transition-transform duration-200 ml-2 ${
            isOpen ? "rotate-180 text-aviation-yellowDeep" : ""
          }`}
        />
      </button>

      {/* Custom Brand Dropdown Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 py-1.5 bg-white border border-aviation-border rounded-xl shadow-[0_12px_30px_-4px_rgba(11,11,11,0.15)] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 origin-top"
        >
          <div className="max-h-64 overflow-y-auto overscroll-contain">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`px-3.5 py-2.5 mx-1.5 my-0.5 rounded-lg text-sm flex items-center justify-between transition-colors duration-150 cursor-pointer select-none ${
                    isSelected
                      ? "bg-aviation-yellow text-aviation-black font-bold shadow-2xs"
                      : "text-aviation-charcoal hover:bg-aviation-offWhite hover:text-aviation-black font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {"icon" in option && option.icon && (
                      <span className="shrink-0">{option.icon}</span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-aviation-black shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
