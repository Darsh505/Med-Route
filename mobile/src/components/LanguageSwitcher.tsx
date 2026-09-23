/**
 * mobile/src/components/LanguageSwitcher.tsx
 * Accessible Modal Language Switcher for Med Route Mobile
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../theme/colors";
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  changeLanguage,
} from "../i18n";

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLang = (i18n.language || "en") as SupportedLanguage;

  const currentItem =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
    SUPPORTED_LANGUAGES[0];

  const handleSelect = async (code: SupportedLanguage) => {
    await changeLanguage(code);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.button, compact && styles.buttonCompact]}
        activeOpacity={0.8}
      >
        <Text style={styles.globeIcon}>🌐</Text>
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>{compact ? currentItem.code.toUpperCase() : currentItem.nativeName}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language / भाषा चुनें / ਭਾਸ਼ਾ ਚੁਣੋ</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {SUPPORTED_LANGUAGES.map((item) => {
                const isSelected = item.code === currentLang;
                return (
                  <TouchableOpacity
                    key={item.code}
                    onPress={() => handleSelect(item.code)}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                  >
                    <View style={styles.optionLeft}>
                      <Text style={styles.optionNative}>{item.nativeName}</Text>
                      <Text style={styles.optionEnglish}>{item.label}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceIce || "#EBF5FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle || "#E2E8F0",
    gap: 4,
    flexShrink: 0,
  },
  buttonCompact: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
    minHeight: 28,
    alignSelf: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  globeIcon: {
    fontSize: 13,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary || "#0052cc",
  },
  buttonTextCompact: {
    fontSize: 11,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "700",
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  optionItemSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: colors.primary || "#0052cc",
  },
  optionLeft: {
    flexDirection: "column",
  },
  optionNative: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  optionEnglish: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary || "#0052cc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
