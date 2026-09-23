/**
 * ChatScreen.tsx — Mobile AI Clinical Care & Dispatch Chatbot (Clinical Architecture Health)
 */

import React, { useState, useRef } from "react";
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
  ScrollView,
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
      "Hello! I am your **Medi Route Clinical AI Assistant**.\n\nI can help you check **live ICU bed telemetry**, calculate **cashless pre-authorization**, or route **emergency ambulance admission** with ₹0 upfront deposit.",
    triage_level: "routine",
    quick_suggestions: [
      "Check live ICU beds in Bangalore",
      "Calculate cashless pre-auth under Star Health",
      "Need emergency cardiac ambulance dispatch",
      "NABH accredited orthopedics hospitals",
    ],
    timestamp: "Just now",
  },
];

export default function ChatScreen({ navigation }: any) {
  const [messages, setMessages] = useState<MessageItem[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: MessageItem = {
      id: "u-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendChatMessage(textToSend, history);
      if (res.success && res.data) {
        const aiMessage: MessageItem = {
          id: "a-" + Date.now(),
          role: "assistant",
          content: res.data.reply,
          triage_level: res.data.triage_level,
          recommended_hospitals: res.data.recommended_hospitals,
          action_buttons: res.data.action_buttons,
          quick_suggestions: res.data.quick_suggestions,
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Chatbot API response error");
      }
    } catch {
      const fallbackResponse = generateClientSideNLP(textToSend);
      setMessages((prev) => [...prev, fallbackResponse]);
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
              🚨 CRITICAL TRIAGE: Call 1800-MEDI-ROUTE immediately!
            </Text>
          </View>
        )}

        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.bubbleText, isUser ? styles.userBubbleText : styles.aiBubbleText]}>
            {item.content}
          </Text>

          {item.recommended_hospitals && item.recommended_hospitals.length > 0 && (
            <View style={styles.hospitalsContainer}>
              <Text style={styles.hospitalsHeader}>Recommended Network Facilities:</Text>
              {item.recommended_hospitals.map((hosp, idx) => (
                <View key={idx} style={styles.hospitalMiniCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.miniCardName}>{hosp.name}</Text>
                    {hosp.distance_km && (
                      <Text style={styles.miniCardDist}>{hosp.distance_km} km</Text>
                    )}
                  </View>
                  <Text style={styles.miniCardAddress}>📍 {hosp.address}</Text>

                  <View style={styles.miniCardMeta}>
                    <Text style={styles.miniCardIcu}>● {hosp.beds_icu_available} ICU Beds Free</Text>
                    {hosp.is_pmjay_empanelled && (
                      <Text style={styles.miniCardPmjay}>✓ 100% Cashless</Text>
                    )}
                  </View>

                  <View style={styles.miniCardActions}>
                    <TouchableOpacity
                      style={styles.miniCardViewBtn}
                      onPress={() => navigation.navigate("SOS")}
                    >
                      <Text style={styles.miniCardViewBtnText}>Reserve Bed</Text>
                    </TouchableOpacity>

                    {hosp.emergency_phone && (
                      <TouchableOpacity
                        style={styles.miniCardCallBtn}
                        onPress={() => Linking.openURL(`tel:${hosp.emergency_phone}`)}
                      >
                        <Text style={styles.miniCardCallBtnText}>Call Desk</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {item.action_buttons && item.action_buttons.length > 0 && (
            <View style={styles.actionsContainer}>
              {item.action_buttons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.actionBtn}
                  onPress={() => {
                    if (btn.type === "sos") {
                      navigation.navigate("SOS");
                    } else if (btn.type === "compare") {
                      navigation.navigate("Compare");
                    }
                  }}
                >
                  <Text style={styles.actionBtnText}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

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
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 18 }}>🩺</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.headerTitle}>Medi Route Clinical AI</Text>
              <View style={styles.partnerBadge}>
                <Text style={styles.partnerBadgeText}>TPA Verified</Text>
              </View>
            </View>
            <View style={styles.headerStatusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.headerSubtitle}>Online • Clinical Triage &amp; Bed Telemetry</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Category Bar */}
      <View style={styles.quickBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBarScroll}>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => handleSend("Explain Medi Route 20-minute cashless guarantee")}
          >
            <Text style={styles.quickPillText}>🛡️ Cashless Pre-Auth</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => handleSend("Show hospitals in Bangalore with free ICU beds")}
          >
            <Text style={styles.quickPillText}>🛏️ Live ICU Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => handleSend("Nearest accredited cardiac emergency hubs")}
          >
            <Text style={styles.quickPillText}>⚡ Emergency Hubs</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Connecting to clinical database...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about hospital pre-auth, ICU beds, room rent..."
            placeholderTextColor={colors.textTertiary}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function generateClientSideNLP(text: string): MessageItem {
  const q = text.toLowerCase();
  const isEmergency =
    q.includes("chest pain") ||
    q.includes("heart attack") ||
    q.includes("stroke") ||
    q.includes("breathing") ||
    q.includes("accident");

  if (isEmergency) {
    return {
      id: "a-" + Date.now(),
      role: "assistant",
      content:
        "🚨 **CRITICAL TRIAGE: CALL 1800-MEDI-ROUTE IMMEDIATELY**\n\nYour query indicates acute distress. Emergency telemetry recommends immediate routing to Level-1 cardiac facility.",
      triage_level: "emergency",
      recommended_hospitals: [
        {
          name: "Sakra World Hospital",
          slug: "sakra",
          address: "Outer Ring Rd, Marathahalli",
          distance_km: 1.2,
          beds_icu_available: 6,
          is_pmjay_empanelled: true,
          emergency_phone: "080-4969-4969",
        },
        {
          name: "Manipal Hospital",
          slug: "manipal",
          address: "Old Airport Road, Kodihalli",
          distance_km: 2.4,
          beds_icu_available: 9,
          is_pmjay_empanelled: true,
          emergency_phone: "080-2502-4444",
        },
      ],
      action_buttons: [
        { type: "sos", label: "🚨 Launch Emergency SOS", value: "/emergency-cashless" },
        { type: "compare", label: "⚖️ Compare Hospitals", value: "/compare" },
      ],
      timestamp: "Just now",
    };
  }

  return {
    id: "a-" + Date.now(),
    role: "assistant",
    content:
      "Medi Route partners with 10,000+ accredited hospitals. Direct TPA API sync clears pre-authorizations in under 20 minutes with zero upfront deposit.",
    triage_level: "routine",
    recommended_hospitals: [
      {
        name: "Manipal Hospital",
        slug: "manipal",
        address: "HAL Airport Road, Bangalore",
        distance_km: 5.2,
        beds_icu_available: 10,
        is_pmjay_empanelled: true,
        emergency_phone: "080-2502-4444",
      },
      {
        name: "Apollo Hospital",
        slug: "apollo",
        address: "Bannerghatta Rd, Bangalore",
        distance_km: 11.4,
        beds_icu_available: 14,
        is_pmjay_empanelled: true,
        emergency_phone: "080-2630-4050",
      },
    ],
    action_buttons: [
      { type: "compare", label: "⚖️ Compare Hospitals", value: "/compare" },
      { type: "sos", label: "🛡️ Pre-Auth Terminal", value: "/emergency-cashless" },
    ],
    timestamp: "Just now",
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  partnerBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  partnerBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.badgeCashless,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: "500",
  },
  quickBar: {
    backgroundColor: colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingVertical: 8,
  },
  quickBarScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickPill: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSurface,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  messageList: {
    padding: 12,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginVertical: 5,
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  aiWrapper: {
    alignItems: "flex-start",
  },
  emergencyBanner: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    maxWidth: "92%",
  },
  emergencyBannerText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.error,
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderTopLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userBubbleText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  aiBubbleText: {
    color: colors.onSurface,
  },
  hospitalsContainer: {
    marginTop: 10,
    gap: 8,
  },
  hospitalsHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  hospitalMiniCard: {
    backgroundColor: colors.canvas,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  miniCardName: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.onSurface,
  },
  miniCardDist: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: "700",
  },
  miniCardAddress: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  miniCardMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  miniCardIcu: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.badgeCashless,
  },
  miniCardPmjay: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  miniCardActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  miniCardViewBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: "center",
  },
  miniCardViewBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  miniCardCallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceIce,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  miniCardCallBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceIce,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    maxWidth: "90%",
  },
  suggestionChip: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  suggestionText: {
    fontSize: 11,
    color: colors.onSurface,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  loadingText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
