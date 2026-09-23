"use client";

import React from "react";
import Link from "next/link";

interface MedRouteLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showBadge?: boolean;
  variant?: "default" | "light";
  clickable?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 30, text: "text-lg", badge: "text-[9px] px-1.5 py-0.5", gap: "gap-2" },
  md: { icon: 38, text: "text-xl", badge: "text-[10px] px-2 py-0.5", gap: "gap-2.5" },
  lg: { icon: 48, text: "text-2xl", badge: "text-[11px] px-2.5 py-0.5", gap: "gap-3" },
  xl: { icon: 64, text: "text-3xl", badge: "text-xs px-3 py-1", gap: "gap-4" },
};

/**
 * MedRouteLogo — World-Class HealthTech Brand Logo
 * Combines an interlocking clinical cross, vital route waypoint ribbons,
 * and high-contrast modern typography.
 */
export default function MedRouteLogo({
  size = "md",
  showText = true,
  showBadge = false,
  variant = "default",
  clickable = true,
  className = "",
}: MedRouteLogoProps) {
  const currentSize = SIZE_MAP[size];
  const isLight = variant === "light";

  const content = (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      {/* Dynamic Emblem SVG */}
      <div 
        className="relative shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 80 80"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xs"
        >
          <defs>
            {/* Jewel Multi-tone Gradients */}
            <linearGradient id={`mr-plum-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8E3B95" />
              <stop offset="100%" stopColor="#581C87" />
            </linearGradient>

            <linearGradient id={`mr-teal-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id={`mr-rose-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>

            <linearGradient id={`mr-bg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isLight ? "#2D1F35" : "#FFFFFF"} />
              <stop offset="100%" stopColor={isLight ? "#1F1426" : "#F7EFF9"} />
            </linearGradient>

            <filter id={`mr-shadow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow 
                dx="0" 
                dy="2" 
                stdDeviation="2.5" 
                floodColor="#581C87" 
                floodOpacity={isLight ? "0.4" : "0.2"} 
              />
            </filter>
          </defs>

          {/* Squircle Tile Base */}
          <rect
            x="2"
            y="2"
            width="76"
            height="76"
            rx="20"
            fill={`url(#mr-bg-${size})`}
            stroke={isLight ? "#4A2F55" : "#E5D5E8"}
            strokeWidth="1.5"
            className="transition-colors duration-300"
          />

          {/* Interlocking Petal Cross (Navigation Waypoint & Clinical Care) */}
          <g filter={`url(#mr-shadow-${size})`}>
            {/* Left Petal: Teal Flow (Discovery & Routing) */}
            <path
              d="M 22 40 C 22 34 27 29 33 29 C 39 29 40 33 40 40 C 40 47 35 51 29 51 C 25 51 22 46 22 40 Z"
              fill={`url(#mr-teal-${size})`}
            />

            {/* Top Petal: Plum Beacon (Emergency & Triage) */}
            <path
              d="M 40 22 C 46 22 51 27 51 33 C 51 39 47 40 40 40 C 33 40 29 35 29 29 C 29 25 34 22 40 22 Z"
              fill={`url(#mr-plum-${size})`}
            />

            {/* Bottom Petal: Deep Violet Anchor (Hospital Infrastructure) */}
            <path
              d="M 40 58 C 34 58 29 53 29 47 C 29 41 33 40 40 40 C 47 40 51 45 51 51 C 51 55 46 58 40 58 Z"
              fill={`url(#mr-plum-${size})`}
            />

            {/* Right Petal: Coral Rose Outflow (Cashless & Action) */}
            <path
              d="M 58 40 C 58 46 53 51 47 51 C 41 51 40 47 40 40 C 40 33 45 29 51 29 C 55 29 58 34 58 40 Z"
              fill={`url(#mr-rose-${size})`}
            />

            {/* Translucent Central Bridge */}
            <path
              d="M 25 40 C 32 32 48 32 55 40 C 48 48 32 48 25 40 Z"
              fill="#FFFFFF"
              fillOpacity="0.25"
            />

            {/* Core Waypoint Node */}
            <circle cx="40" cy="40" r="5" fill="#FFFFFF" />
            <circle cx="40" cy="40" r="2.5" fill="#581C87" />
          </g>

          {/* Active Route Pulse Node */}
          <circle cx="62" cy="22" r="3.5" fill="#FB7185" />
          <circle cx="62" cy="22" r="6" stroke="#FB7185" strokeWidth="1" strokeOpacity="0.4" />
        </svg>
      </div>

      {/* Wordmark & Partner Badge */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight leading-none ${currentSize.text} ${
                isLight ? "text-white" : "text-[#1E1226]"
              }`}
            >
              Med<span className={isLight ? "text-[#D8BFD8]" : "text-[#7A3E85]"}>Route</span>
            </span>

            {showBadge && (
              <span
                className={`font-bold tracking-wide rounded-full border inline-flex items-center gap-1 ${currentSize.badge} ${
                  isLight
                    ? "bg-[#2D1F35] text-[#D8BFD8] border-[#7A3E85]/50"
                    : "bg-[#FAF5FB] text-[#7A3E85] border-[#E5D5E8]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A3E85] animate-pulse" />
                MediBuddy Partner
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" className="inline-block focus:outline-hidden focus:ring-2 focus:ring-[#7A3E85]/20 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
