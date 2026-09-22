"use client";

import dynamic from "next/dynamic";

const SosDispatchMapLeaflet = dynamic(() => import("./SosDispatchMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] sm:h-[320px] bg-error-container/20 animate-pulse rounded-xl flex flex-col items-center justify-center text-error font-label-md gap-2 border border-error/30">
      <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
      <span className="text-xs font-bold uppercase tracking-wider">
        Establishing Emergency GIS Corridor...
      </span>
    </div>
  ),
});

interface SosDispatchMapProps {
  userCoords: { lat: number; lng: number };
  hospitalCoords: { lat: number; lng: number };
  hospitalName: string;
  hospitalAddress: string;
  distanceKm: number;
  estimatedMinutes: number;
  bedsIcuAvailable: number;
}

export default function SosDispatchMap(props: SosDispatchMapProps) {
  return <SosDispatchMapLeaflet {...props} />;
}
