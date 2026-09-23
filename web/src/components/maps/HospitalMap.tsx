"use client";

import dynamic from "next/dynamic";

const HospitalMapLeaflet = dynamic(() => import("./HospitalMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[340px] bg-surface-container-low animate-pulse rounded-xl flex flex-col items-center justify-center text-on-surface-variant font-label-md gap-3">
      <span className="material-symbols-outlined animate-spin text-3xl text-secondary">
        progress_activity
      </span>
      <span className="font-medium text-sm">Loading Interactive Map Radar...</span>
    </div>
  ),
});

interface HospitalMapProps {
  latitude: number;
  longitude: number;
  hospitalName: string;
  address: string;
  phone?: string;
  bedsIcuAvailable?: number;
  isPmjay?: boolean;
}

export default function HospitalMap({
  latitude,
  longitude,
  hospitalName,
  address,
  phone,
  bedsIcuAvailable,
  isPmjay,
}: HospitalMapProps) {
  const gmapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="rounded-2xl overflow-hidden border border-surface-container-high bg-surface-container-lowest shadow-sm">
      {/* Real Interactive Map Canvas */}
      <div className="relative w-full h-[340px] bg-surface-container-low overflow-hidden">
        <HospitalMapLeaflet
          latitude={latitude}
          longitude={longitude}
          hospitalName={hospitalName}
          address={address}
          phone={phone}
          bedsIcuAvailable={bedsIcuAvailable}
          isPmjay={isPmjay}
        />
      </div>

      {/* Hospital Coordinate & Dispatch Action Bar */}
      <div className="p-space-md bg-surface-container-lowest border-t border-surface-container-high/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-secondary-container/60 text-secondary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[20px]">location_on</span>
          </div>
          <div>
            <div className="font-label-md text-primary font-bold text-sm">
              {address}
            </div>
            <div className="font-body-xs text-on-surface-variant text-xs flex items-center gap-2 mt-0.5">
              <span>GPS: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</span>
              <span className="inline-block w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="text-secondary font-medium">Real-time Telemetry Enabled</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex-1 sm:flex-none py-2 px-3.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-low text-on-surface font-label-sm font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">call</span>
              <span>Desk</span>
            </a>
          )}
          <a
            href={gmapsDirUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-secondary hover:bg-secondary/90 text-white font-label-sm font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">directions</span>
            <span>Get Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
}
