/**
 * ChatScreen.tsx — Mobile AI Clinical Dispatch Chatbot
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { api } from "../services/api";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  triage_level?: "emergency" | "urgent" | "routine";
  recommended_hospitals?: Array<{
    name: string;
    slug: string;
    address: string;
    distance_km?: number;
    beds_icu_available: number;
    is_pmjay_empanelled: boolean;
    emergency_phone?: string;
    cost_indicative?: string;
  }>;
  action_buttons?: Array<{
    type: string;
    label: string;
    value: string;
  }>;
  quick_suggestions?: string[];
  timestamp: string;
}

const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: "m-welcome",
    role: "assistant",
    content:
      "Hello! I am the MedRoute Clinical Dispatch AI. I can triage medical symptoms, locate available ICU beds, check PMJAY packages, and connect you with trauma centers.",
    triage_level: "routine",
    quick_suggestions: [
      "Chest pain & breathlessness in Mohali",
      "Knee replacement surgery under PMJAY",
      "Find free ICU beds near me",
      "Angioplasty costs in Chandigarh",
    ],
    timestamp: "Just now",
  },
];

export default function ChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || input).trim();
    if (!text || loading) return;

    setInput("");

    const userMsg: MessageItem = {
      id: "u-" + Date.now(),
      role: "user",
      content: text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendChatMessage(text, history);

      const aiMsg: MessageItem = {
        id: "a-" + Date.now(),
        role: "assistant",
        content: res.reply,
        triage_level: res.triage_level,
        recommended_hospitals: res.recommended_hospitals,
        action_buttons: res.action_buttons,
        quick_suggestions: res.quick_suggestions,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: MessageItem = {
        id: "a-" + Date.now(),
        role: "assistant",
        content:
          "I am currently operating in resilient offline triage mode. For life-threatening emergencies, please call ambulance 108 or proceed to the nearest trauma hospital.",
        triage_level: "emergency",
        action_buttons: [{ type: "call_emergency", label: "📞 Call 108", value: "108" }],
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: MessageItem }) => {
    const isUser = item.role === "user";
    const isEmergency = item.triage_level === "emergency";

    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
        {isEmergency && !isUser && (
          <View style={styles.emergencyBanner}>
            <Text style={styles.emergencyBannerText}>
              🚨 CRITICAL TRIAGE: Call 108 or proceed to emergency desk immediately!
            </Text>
          </View>
        )}

        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content}
          </Text>

          {/* Recommended Hospitals */}
          {item.recommended_hospitals && item.recommended_hospitals.length > 0 && (
            <View style={styles.hospitalList}>
              <Text style={styles.hospitalSectionTitle}>RECOMMENDED FACILITIES:</Text>
              {item.recommended_hospitals.map((hosp, idx) => (
                <View key={idx} style={styles.hospitalCard}>
                  <View style={styles.hospitalCardHeader}>
                    <Text style={styles.hospitalName} numberOfLines={1}>
                      {hosp.name}
                    </Text>
                    <View style={styles.icuBadge}>
                      <Text style={styles.icuBadgeText}>{hosp.beds_icu_available} ICU Free</Text>
                    </View>
                  </View>
                  <Text style={styles.hospitalAddress}>📍 {hosp.address}</Text>
                  {hosp.cost_indicative && (
                    <Text style={styles.hospitalCost}>💰 {hosp.cost_indicative}</Text>
                  )}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.detailsBtn}
                      onPress={() => navigation.navigate("HospitalDetail", { hospital: hosp })}
                    >
                      <Text style={styles.detailsBtnText}>View Hospital →</Text>
                    </TouchableOpacity>
                    {hosp.emergency_phone && (
                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => Linking.openURL(`tel:${hosp.emergency_phone}`)}
                      >
                        <Text style={styles.callBtnText}>📞 Call Desk</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          {item.action_buttons && item.action_buttons.length > 0 && (
            <View style={styles.actionsRow}>
              {item.action_buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.actionBtn,
                    btn.type === "call_emergency" ? styles.emergencyActionBtn : styles.standardActionBtn,
                  ]}
                  onPress={() => {
                    if (btn.type === "call_emergency" || btn.type === "call_hospital") {
                      Linking.openURL(`tel:${btn.value}`);
                    } else if (btn.value) {
                      navigation.navigate("HospitalDetail", { hospitalId: btn.value });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.actionBtnText,
                      btn.type === "call_emergency" && styles.emergencyActionBtnText,
                    ]}
                  >
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Suggestion Chips */}
        {item.quick_suggestions && item.quick_suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {item.quick_suggestions.map((sug, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionChip}
                onPress={() => handleSend(sug)}
              >
                <Text style={styles.suggestionText}>💬 {sug}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.aiStatusDot} />
          <Text style={styles.headerTitle}>Clinical Dispatch AI</Text>
          <View style={styles.geminiBadge}>
            <Text style={styles.geminiBadgeText}>Gemini 2.0</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Real-time ICU telemetry &amp; emergency triage</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type symptoms, hospital inquiry..."
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textInverse,
  },
  geminiBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  geminiBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textInverse,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.primaryLight,
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  aiWrapper: {
    alignItems: "flex-start",
  },
  emergencyBanner: {
    backgroundColor: colors.emergencyLight,
    borderColor: colors.emergencyBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    maxWidth: "92%",
  },
  emergencyBannerText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.emergency,
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: colors.textInverse,
  },
  aiText: {
    color: colors.textPrimary,
  },
  hospitalList: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    gap: 8,
  },
  hospitalSectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textTertiary,
    letterSpacing: 0.6,
  },
  hospitalCard: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hospitalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hospitalName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
    marginRight: 6,
  },
  icuBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderColor: colors.accentBorder,
    borderWidth: 1,
  },
  icuBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.accentDark,
  },
  hospitalAddress: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hospitalCost: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 6,
  },
  detailsBtn: {
    paddingVertical: 4,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  callBtn: {
    paddingVertical: 4,
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.emergency,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  standardActionBtn: {
    backgroundColor: colors.primaryLight,
  },
  emergencyActionBtn: {
    backgroundColor: colors.emergency,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  emergencyActionBtnText: {
    color: colors.textInverse,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    maxWidth: "95%",
  },
  suggestionChip: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 13,
  },
});
