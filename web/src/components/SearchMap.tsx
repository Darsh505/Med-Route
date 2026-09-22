"use client";

import dynamic from "next/dynamic";
import { MapHospital } from "./SearchMapLeaflet";

const SearchMapLeaflet = dynamic(() => import("./SearchMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] bg-surface-container-low animate-pulse rounded-2xl flex flex-col items-center justify-center text-on-surface-variant font-label-md gap-3 border border-surface-container-high">
      <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center text-secondary">
        <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
      </div>
      <div className="text-center">
        <div className="font-headline-sm text-primary font-bold text-sm">
          Initializing Clinical Radar Map
        </div>
        <div className="font-body-xs text-on-surface-variant text-xs mt-1">
          Loading live hospital telemetry &amp; regional ICU nodes...
        </div>
      </div>
    </div>
  ),
});

interface SearchMapProps {
  hospitals: MapHospital[];
  selectedHospitalId?: string | null;
  onSelectHospital?: (hospitalId: string) => void;
  userCoords?: { lat: number; lng: number } | null;
  onLocateMe?: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

export default function SearchMap({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  userCoords,
  onLocateMe,
  className = "",
}: SearchMapProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <SearchMapLeaflet
        hospitals={hospitals}
        selectedHospitalId={selectedHospitalId}
        onSelectHospital={onSelectHospital}
        userCoords={userCoords}
        onLocateMe={onLocateMe}
      />
    </div>
  );
}
