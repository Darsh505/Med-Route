/**
 * location.ts — Location Service for React Native
 * Resolves user coordinates and selected city with AsyncStorage persistence
 * and auto-selected seamless boot.
 */

import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CityLocation {
  name: string;
  state: string;
  coords: Coordinates;
  isPopular?: boolean;
}

export const INDIAN_CITIES: CityLocation[] = [
  { name: "Hoshiarpur", state: "Punjab", coords: { latitude: 31.5305, longitude: 75.9125 }, isPopular: true },
  { name: "Chandigarh", state: "Chandigarh", coords: { latitude: 30.7333, longitude: 76.7794 }, isPopular: true },
  { name: "Mohali", state: "Punjab", coords: { latitude: 30.7046, longitude: 76.7179 }, isPopular: true },
  { name: "Panchkula", state: "Haryana", coords: { latitude: 30.6942, longitude: 76.8606 }, isPopular: true },
  { name: "Ludhiana", state: "Punjab", coords: { latitude: 30.9010, longitude: 75.8573 }, isPopular: true },
  { name: "Jalandhar", state: "Punjab", coords: { latitude: 31.3260, longitude: 75.5762 } },
  { name: "Amritsar", state: "Punjab", coords: { latitude: 31.6340, longitude: 74.8723 } },
  { name: "Delhi", state: "Delhi", coords: { latitude: 28.6139, longitude: 77.2090 }, isPopular: true },
  { name: "Gurugram", state: "Haryana", coords: { latitude: 28.4595, longitude: 77.0266 }, isPopular: true },
  { name: "Noida", state: "Uttar Pradesh", coords: { latitude: 28.5355, longitude: 77.3910 } },
  { name: "Jaipur", state: "Rajasthan", coords: { latitude: 26.9124, longitude: 75.7873 }, isPopular: true },
  { name: "Lucknow", state: "Uttar Pradesh", coords: { latitude: 26.8467, longitude: 80.9462 }, isPopular: true },
  { name: "Mumbai", state: "Maharashtra", coords: { latitude: 19.0760, longitude: 72.8777 }, isPopular: true },
  { name: "Pune", state: "Maharashtra", coords: { latitude: 18.5204, longitude: 73.8567 }, isPopular: true },
  { name: "Ahmedabad", state: "Gujarat", coords: { latitude: 23.0225, longitude: 72.5714 } },
  { name: "Bengaluru", state: "Karnataka", coords: { latitude: 12.9716, longitude: 77.5946 }, isPopular: true },
  { name: "Chennai", state: "Tamil Nadu", coords: { latitude: 13.0827, longitude: 80.2707 }, isPopular: true },
  { name: "Hyderabad", state: "Telangana", coords: { latitude: 17.3850, longitude: 78.4867 }, isPopular: true },
  { name: "Kolkata", state: "West Bengal", coords: { latitude: 22.5726, longitude: 88.3639 }, isPopular: true },
  { name: "Vellore", state: "Tamil Nadu", coords: { latitude: 12.9165, longitude: 79.1325 } },
  { name: "Rishikesh", state: "Uttarakhand", coords: { latitude: 30.0869, longitude: 78.2676 } },
  { name: "Bhopal", state: "Madhya Pradesh", coords: { latitude: 23.2599, longitude: 77.4126 } },
  { name: "Patna", state: "Bihar", coords: { latitude: 25.5941, longitude: 85.1376 } },
  { name: "Kochi", state: "Kerala", coords: { latitude: 9.9312, longitude: 76.2673 } },
  { name: "Bhubaneswar", state: "Odisha", coords: { latitude: 20.2961, longitude: 85.8245 } },
  { name: "Guwahati", state: "Assam", coords: { latitude: 26.1445, longitude: 91.7362 } },
];

const STORAGE_KEY_CITY = "@medroute_selected_city";
const STORAGE_KEY_COORDS = "@medroute_selected_coords";

export const locationService = {
  async getSelectedCity(): Promise<{ city: string; coords: Coordinates; isAuto: boolean }> {
    try {
      const savedCity = await AsyncStorage.getItem(STORAGE_KEY_CITY);
      const savedCoords = await AsyncStorage.getItem(STORAGE_KEY_COORDS);

      if (savedCity && savedCoords) {
        return {
          city: savedCity,
          coords: JSON.parse(savedCoords),
          isAuto: false,
        };
      }
    } catch {}

    // Default auto-select: Hoshiarpur
    return {
      city: "Hoshiarpur",
      coords: { latitude: 31.5305, longitude: 75.9125 },
      isAuto: true,
    };
  },

  async setSelectedCity(city: string, coords: Coordinates): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CITY, city);
      await AsyncStorage.setItem(STORAGE_KEY_COORDS, JSON.stringify(coords));
    } catch (e) {
      console.log("Failed to save location preference:", e);
    }
  },

  async detectGPSLocation(): Promise<{ city: string; coords: Coordinates } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Reverse geocode to find city
        let detectedCity = "Detected Location";
        try {
          const rev = await Location.reverseGeocodeAsync(coords);
          if (rev && rev.length > 0) {
            detectedCity = rev[0].city || rev[0].subregion || rev[0].region || "Detected Location";
          }
        } catch {}

        await this.setSelectedCity(detectedCity, coords);
        return { city: detectedCity, coords };
      }
    } catch (e) {
      console.log("GPS detection failed:", e);
    }
    return null;
  },

  async getCurrentLocation(): Promise<Coordinates> {
    const current = await this.getSelectedCity();
    return current.coords;
  },
};
