/**
 * FloatingSOSButton.tsx — Persistent Emergency Floating Action Button
 * Prompt 7: "Floating SOS button: Large red circle with white 'SOS' text,
 * positioned at bottom-right, with animated pulse rings"
 */

import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from "react-native";
import { colors } from "../theme/colors";
import { shadows } from "../theme/spacing";

interface FloatingSOSButtonProps {
  onPress: () => void;
}

export default function FloatingSOSButton({ onPress }: FloatingSOSButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Outer pulsing ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.25],
              outputRange: [0.6, 0],
            }),
          },
        ]}
      />
      {/* Main SOS button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.button}
      >
        <Text style={styles.icon}>🚨</Text>
        <Text style={styles.text}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  pulseRing: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.emergency,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.emergency,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.floatingButton,
  },
  icon: {
    fontSize: 14,
  },
  text: {
    color: colors.textInverse,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
