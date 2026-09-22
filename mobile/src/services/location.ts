/**
 * location.ts — Location Service for React Native
 * Resolves current user coordinates with graceful fallback.
 */

import * as Location from "expo-location";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const locationService = {
  async getCurrentLocation(): Promise<Coordinates> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      }
    } catch (e) {
      console.log("Location access unavailable, using regional default:", e);
    }

    // Default: Chandigarh Tricity
    return {
      latitude: 30.7333,
      longitude: 76.7794,
    };
  },
};
