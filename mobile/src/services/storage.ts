/**
 * storage.ts — Persistent local storage wrapper for mobile
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  COMPARE_IDS: "medroute_compare_ids",
  FAVORITES: "medroute_favorites",
  USER_INFO: "medroute_user",
};

export const storage = {
  async getCompareIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.COMPARE_IDS);
      return data ? JSON.parse(data) : ["hosp-1", "hosp-2"];
    } catch {
      return ["hosp-1", "hosp-2"];
    }
  },

  async toggleCompare(id: string): Promise<string[]> {
    try {
      let ids = await this.getCompareIds();
      if (ids.includes(id)) {
        ids = ids.filter((item) => item !== id);
      } else {
        if (ids.length >= 4) {
          return ids;
        }
        ids.push(id);
      }
      await AsyncStorage.setItem(KEYS.COMPARE_IDS, JSON.stringify(ids));
      return ids;
    } catch {
      return ["hosp-1", "hosp-2"];
    }
  },

  async getFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async toggleFavorite(id: string): Promise<boolean> {
    try {
      const favs = await this.getFavorites();
      const exists = favs.includes(id);
      const updated = exists ? favs.filter((item) => item !== id) : [...favs, id];
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updated));
      return !exists;
    } catch {
      return false;
    }
  },
};
