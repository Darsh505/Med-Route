/**
 * App.tsx — Med Route Mobile Main Entry Point with Multi-Language Support
 */

import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import "./src/i18n";
import { loadSavedLanguage } from "./src/i18n";

export default function App() {
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
