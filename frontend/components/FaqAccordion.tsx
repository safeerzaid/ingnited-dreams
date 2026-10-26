"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  // Default first item (index 0) open, exactly matching reference image 2
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-3.5 max-w-3xl lg:max-w-4xl mx-auto w-full select-none">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const numberStr = String(idx + 1).padStart(2, "0");

        return (
          <div
            key={idx}
            onClick={() => handleToggle(idx)}
            className={`cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden ${
              isOpen
                ? "bg-[#163a2b] text-white p-5 sm:p-6 lg:p-7 border-2 border-[#F5C400]/40 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                : "bg-[#122e22] border border-[#1e4d39] hover:border-[#F5C400]/50 text-white p-4 sm:p-5 hover:bg-[#163a2b]"
            }`}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleToggle(idx);
              }
            }}
          >
            {/* Header Area */}
            <div className="w-full flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 sm:gap-4.5 min-w-0">
                {/* Number Badge */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                    isOpen
                      ? "border-2 border-[#F5C400] text-[#F5C400] bg-transparent"
                      : "bg-white/10 text-slate-200"
                  }`}
                >
                  {numberStr}
                </div>

                {/* Question Text */}
                <h4
                  className={`font-bold text-base sm:text-[18px] lg:text-[19px] tracking-tight leading-snug transition-colors ${
                    isOpen ? "text-white" : "text-white"
                  }`}
                >
                  {item.q}
                </h4>
              </div>

              {/* Toggle Circle */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isOpen
                    ? "bg-[#F5C400] text-[#0e271d]"
                    : "bg-white/10 text-white group-hover:text-[#F5C400]"
                }`}
              >
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                )}
              </div>
            </div>

            {/* Answer Content (Visible when Open) */}
            {isOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="pt-4 mt-4 border-t border-white/10 cursor-text select-text animate-in fade-in duration-200"
              >
                <p className="text-sm sm:text-[15px] text-slate-100 leading-relaxed font-normal">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
