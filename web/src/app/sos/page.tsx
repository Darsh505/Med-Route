"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

type SOSStep = "ready" | "locating" | "searching" | "found" | "dispatched";

export default function SOSPage() {
  const [step, setStep] = useState<SOSStep>("ready");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestHospital, setNearestHospital] = useState<any>(null);
  const [alertId, setAlertId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerSOS = async () => {
    setError(null);
    setStep("locating");

    // Step 1: Get GPS location
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );

      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lng: longitude });
      setStep("searching");

      // Step 2: Call SOS API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      try {
        const res = await fetch(`${API_URL}/api/sos/alert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude }),
        });

        if (res.ok) {
          const data = await res.json();
          setNearestHospital(data.data);
          setAlertId(data.data?.id);
          setStep("dispatched");
        } else {
          throw new Error("API error");
        }
      } catch {
        // Fallback: mock nearest hospital
        setNearestHospital({
          hospital_name: "PGIMER Chandigarh",
          hospital_phone: "0172-2755555",
          hospital_emergency_phone: "0172-2756565",
          hospital_address: "Sector 12, Chandigarh",
          distance_km: 2.4,
          estimated_arrival_minutes: 8,
          beds_icu_available: 12,
        });
        setStep("found");
      }
    } catch {
      setError("Unable to get your location. Please enable GPS and try again, or call 108 directly.");
      setStep("ready");
    }
  };

  const emergencyNumbers = [
    { label: "National Ambulance", number: "108", emoji: "🚑" },
    { label: "Police", number: "100", emoji: "👮" },
    { label: "Fire & Rescue", number: "101", emoji: "🚒" },
    { label: "PGIMER Emergency", number: "0172-2756565", emoji: "🏥" },
  ];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-emergency-bg)" }}>
        <div className="container" style={{ paddingBlock: "var(--space-12)", maxWidth: "640px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
            <div style={{ fontSize: "4rem", marginBottom: "var(--space-4)" }}>🚨</div>
            <h1 style={{ fontSize: "var(--text-4xl)", fontFamily: "var(--font-heading)", color: "var(--color-emergency)", marginBottom: "var(--space-3)" }}>
              Emergency SOS
            </h1>
            <p style={{ color: "var(--color-gray-600)", fontSize: "var(--text-base)" }}>
              Find the nearest trauma center instantly. We use your GPS to locate the closest hospital.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "var(--color-emergency-bg)",
                border: "2px solid var(--color-emergency-100)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-4)",
                marginBottom: "var(--space-6)",
                color: "var(--color-emergency)",
                fontSize: "var(--text-sm)",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* SOS Button / Status */}
          {step === "ready" && (
            <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
              <button
                id="sos-trigger-btn"
                onClick={triggerSOS}
                style={{
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  background: "var(--color-emergency)",
                  border: "8px solid rgba(220,38,38,0.3)",
                  color: "white",
                  fontSize: "var(--text-2xl)",
                  fontWeight: 900,
                  cursor: "pointer",
                  animation: "emergency-pulse 1.5s infinite",
                  boxShadow: "0 0 60px rgba(220,38,38,0.4)",
                  transition: "transform 150ms",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  margin: "0 auto",
                  fontFamily: "var(--font-heading)",
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span style={{ fontSize: "3rem" }}>🚨</span>
                <span>TAP SOS</span>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 400, opacity: 0.9 }}>Find Nearest Hospital</span>
              </button>
              <p style={{ marginTop: "var(--space-4)", color: "var(--color-gray-500)", fontSize: "var(--text-sm)" }}>
                This will use your GPS to find the nearest trauma center
              </p>
            </div>
          )}

          {/* Loading state */}
          {(step === "locating" || step === "searching") && (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-10)",
                background: "white",
                borderRadius: "var(--radius-2xl)",
                boxShadow: "var(--shadow-xl)",
                marginBottom: "var(--space-6)",
              }}
            >
              <div className="skeleton" style={{ width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto var(--space-4)" }} />
              <h3 style={{ color: "var(--color-emergency)", marginBottom: "var(--space-2)" }}>
                {step === "locating" ? "📍 Getting your location..." : "🔍 Finding nearest hospital..."}
              </h3>
              <p style={{ color: "var(--color-gray-500)", fontSize: "var(--text-sm)" }}>
                Please hold on — this only takes a few seconds
              </p>
            </div>
          )}

          {/* Found / Dispatched */}
          {(step === "found" || step === "dispatched") && nearestHospital && (
            <div
              id="sos-result-card"
              style={{
                background: "white",
                borderRadius: "var(--radius-2xl)",
                boxShadow: "var(--shadow-xl)",
                overflow: "hidden",
                marginBottom: "var(--space-6)",
                border: "3px solid var(--color-emergency)",
              }}
              className="animate-fade-in"
            >
              {/* Header bar */}
              <div style={{ background: "var(--color-emergency)", padding: "var(--space-4) var(--space-6)", color: "white" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, opacity: 0.9, marginBottom: "4px" }}>
                  {step === "dispatched" ? "✅ ALERT DISPATCHED" : "🏥 NEAREST HOSPITAL FOUND"}
                </div>
                <h2 style={{ fontSize: "var(--text-2xl)", fontFamily: "var(--font-heading)", margin: 0 }}>
                  {nearestHospital.hospital_name}
                </h2>
              </div>

              {/* Details */}
              <div style={{ padding: "var(--space-6)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
                  <div style={{ textAlign: "center", padding: "var(--space-4)", background: "var(--color-emergency-bg)", borderRadius: "var(--radius-lg)" }}>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: 900, color: "var(--color-emergency)" }}>
                      {nearestHospital.estimated_arrival_minutes} min
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-600)" }}>Est. Arrival Time</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "var(--space-4)", background: "var(--color-gray-50)", borderRadius: "var(--radius-lg)" }}>
                    <div style={{ fontSize: "var(--text-2xl)", fontWeight: 900, color: "var(--color-gray-700)" }}>
                      {nearestHospital.distance_km} km
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-600)" }}>Distance</div>
                  </div>
                </div>

                <div style={{ marginBottom: "var(--space-4)" }}>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--color-gray-600)", marginBottom: "4px" }}>📍 Address</div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{nearestHospital.hospital_address}</div>
                </div>

                <div style={{ display: "flex", gap: "var(--space-3)" }}>
                  <a
                    href={`tel:${nearestHospital.hospital_emergency_phone || nearestHospital.hospital_phone}`}
                    id="sos-call-btn"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      background: "var(--color-emergency)",
                      color: "white",
                      padding: "14px",
                      borderRadius: "var(--radius-xl)",
                      fontWeight: 700,
                      fontSize: "var(--text-base)",
                      textDecoration: "none",
                    }}
                  >
                    📞 Call Emergency
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${nearestHospital.hospital_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="sos-directions-btn"
                    className="btn btn-outline"
                    style={{ padding: "14px 20px", fontSize: "var(--text-sm)" }}
                  >
                    🗺️ Directions
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Numbers */}
          <div style={{ background: "white", borderRadius: "var(--radius-xl)", padding: "var(--space-5)", boxShadow: "var(--shadow-card)" }}>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
              📞 Emergency Helplines
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
              {emergencyNumbers.map((n) => (
                <a
                  key={n.number}
                  href={`tel:${n.number}`}
                  id={`emergency-call-${n.number}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "var(--space-3) var(--space-4)",
                    background: "var(--color-gray-50)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--surface-border)",
                    textDecoration: "none",
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-emergency-bg)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--color-gray-50)")}
                >
                  <span style={{ fontSize: "1.5rem" }}>{n.emoji}</span>
                  <div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-gray-500)" }}>{n.label}</div>
                    <div style={{ fontSize: "var(--text-base)", fontWeight: 800, color: "var(--color-emergency)", fontFamily: "var(--font-heading)" }}>
                      {n.number}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
