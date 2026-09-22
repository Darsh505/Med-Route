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
  { name: "Patiala", state: "Punjab", coords: { latitude: 30.3400, longitude: 76.3800 } },
  { name: "Bathinda", state: "Punjab", coords: { latitude: 30.2110, longitude: 74.9455 } },
  { name: "Pathankot", state: "Punjab", coords: { latitude: 32.2680, longitude: 75.6520 } },
  { name: "Shimla", state: "Himachal Pradesh", coords: { latitude: 31.1048, longitude: 77.1734 } },
  { name: "Jammu", state: "Jammu and Kashmir", coords: { latitude: 32.7266, longitude: 74.8570 } },
  { name: "Srinagar", state: "Jammu and Kashmir", coords: { latitude: 34.0837, longitude: 74.7973 } },
  { name: "Faridabad", state: "Haryana", coords: { latitude: 28.4089, longitude: 77.3178 } },
  { name: "Karnal", state: "Haryana", coords: { latitude: 29.6857, longitude: 76.9905 } },
  { name: "Ambala", state: "Haryana", coords: { latitude: 30.3782, longitude: 76.7767 } },
  { name: "Kanpur", state: "Uttar Pradesh", coords: { latitude: 26.4499, longitude: 80.3319 } },
  { name: "Varanasi", state: "Uttar Pradesh", coords: { latitude: 25.3176, longitude: 82.9739 } },
  { name: "Jodhpur", state: "Rajasthan", coords: { latitude: 26.2389, longitude: 73.0243 } },
  { name: "Surat", state: "Gujarat", coords: { latitude: 21.1702, longitude: 72.8311 }, isPopular: true },
  { name: "Vadodara", state: "Gujarat", coords: { latitude: 22.3072, longitude: 73.1812 } },
  { name: "Indore", state: "Madhya Pradesh", coords: { latitude: 22.7196, longitude: 75.8577 }, isPopular: true },
  { name: "Nagpur", state: "Maharashtra", coords: { latitude: 21.1458, longitude: 79.0882 } },
  { name: "Mangalore", state: "Karnataka", coords: { latitude: 12.9141, longitude: 74.8560 } },
  { name: "Coimbatore", state: "Tamil Nadu", coords: { latitude: 11.0168, longitude: 76.9558 } },
  { name: "Trivandrum", state: "Kerala", coords: { latitude: 8.5241, longitude: 76.9366 } },
  { name: "Visakhapatnam", state: "Andhra Pradesh", coords: { latitude: 17.6868, longitude: 83.2185 }, isPopular: true },
  { name: "Vijayawada", state: "Andhra Pradesh", coords: { latitude: 16.5062, longitude: 80.6480 } },
  { name: "Ranchi", state: "Jharkhand", coords: { latitude: 23.3441, longitude: 85.3096 } },
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
