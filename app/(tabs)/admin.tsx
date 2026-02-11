import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TechnicianWithProfile } from "../../src/types";
import {
  getAllTechnicians,
  deleteTechnician,
  resetToSeedData,
} from "../../src/services/storage";
import {
  listAdmins,
  promoteToAdmin,
  demoteFromAdmin,
  AdminUser,
} from "../../src/services/appwrite";
import { skillColors } from "../../src/constants/colors";
import { EmptyState, LoadingSpinner } from "../../src/components";
import { useAuth } from "../../src/contexts/AuthContext";

type AdminTab = "technicians" | "admins";

export default function AdminScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAdmin, user } = useAuth();

  // ── Shared state ──
  const [activeTab, setActiveTab] = useState<AdminTab>("technicians");

  // ── Technicians state ──
  const [technicians, setTechnicians] = useState<TechnicianWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Admins state ──
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [demotingId, setDemotingId] = useState<string | null>(null);

  // ── Data loading ──
  const loadTechnicians = useCallback(async () => {
    try {
      const data = await getAllTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error("Error loading technicians:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const data = await listAdmins();
      setAdmins(data);
    } catch (error: any) {
      console.error("Error loading admins:", error);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        loadTechnicians();
        loadAdmins();
      }
    }, [isAdmin, loadTechnicians, loadAdmins]),
  );

  // ── Guard: non-admin users ──
  if (!isAdmin) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Ionicons name="lock-closed" size={48} color="#94A3B8" />
        <Text
          style={{
            fontSize: 16,
            color: "#64748B",
            marginTop: 12,
            textAlign: "center",
          }}
        >
          {t("admin.noAccess")}
        </Text>
      </View>
    );
  }

  // ── Technician handlers ──
  const handleRefresh = () => {
    setRefreshing(true);
    loadTechnicians();
  };

  const handleDelete = useCallback(
    (technician: TechnicianWithProfile) => {
      Alert.alert(
        t("admin.deleteTitle"),
        t("admin.deleteMessage", { name: technician.name }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: async () => {
              try {
                await deleteTechnician(technician.$id);
                loadTechnicians();
              } catch (error) {
                Alert.alert(t("common.error"), t("admin.deleteFailed"));
              }
            },
          },
        ],
      );
    },
    [t, loadTechnicians],
  );

  const handleReset = useCallback(() => {
    Alert.alert(t("admin.resetTitle"), t("admin.resetMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.reset"),
        style: "destructive",
        onPress: async () => {
          try {
            await resetToSeedData();
            loadTechnicians();
          } catch (error) {
            Alert.alert(t("common.error"), t("admin.resetFailed"));
          }
        },
      },
    ]);
  }, [t, loadTechnicians]);

  // ── Admin handlers ──
  const handlePromote = async () => {
    const email = promoteEmail.trim().toLowerCase();
    if (!email) return;

    setPromoting(true);
    try {
      await promoteToAdmin(email);
      setPromoteEmail("");
      await loadAdmins();
      Alert.alert(t("admin.promoteSuccess"), email);
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error?.message || t("admin.promoteFailed"),
      );
    } finally {
      setPromoting(false);
    }
  };

  const handleDemote = (admin: AdminUser) => {
    // Prevent self-demotion
    if (admin.$id === user?.$id) {
      Alert.alert(t("common.error"), t("admin.cannotDemoteSelf"));
      return;
    }
    Alert.alert(
      t("admin.demoteConfirmTitle"),
      t("admin.demoteConfirmMessage", { name: admin.name || admin.email }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("admin.demote"),
          style: "destructive",
          onPress: async () => {
            setDemotingId(admin.$id);
            try {
              await demoteFromAdmin(admin.$id);
              await loadAdmins();
            } catch (error: any) {
              Alert.alert(
                t("common.error"),
                error?.message || t("admin.demoteFailed"),
              );
            } finally {
              setDemotingId(null);
            }
          },
        },
      ],
    );
  };

  // ── Technician list renderers ──
  const renderTechnician = useCallback(
    ({ item }: { item: TechnicianWithProfile }) => {
      const color = skillColors[item.skills[0]];

      return (
        <View className="bg-surface mx-4 mb-3 rounded-xl p-4 flex-row items-center shadow-sm">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: color }}
              />
              <Text
                className="text-base font-medium text-text flex-1"
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
            <View className="flex-row items-center gap-3 flex-wrap">
              <View
                className="px-2 py-1 rounded-md"
                style={{ backgroundColor: `${color}15` }}
              >
                <Text className="text-xs font-semibold" style={{ color }}>
                  {item.skills.map((s) => t(`skills.${s}`)).join(", ")}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={12} color="#94A3B8" />
                <Text className="text-sm text-text-secondary">
                  {item.location}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text className="text-sm text-text-secondary">
                  {(item.rating ?? 0) > 0
                    ? item.rating.toFixed(1)
                    : t("common.new")}
                </Text>
              </View>
              <Text className="text-sm font-medium text-primary">
                {(item.hourlyRate ?? 0).toLocaleString()}{" "}
                {t("common.xafPerHour")}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2 ml-3">
            <TouchableOpacity
              className="w-10 h-10 rounded-lg bg-primary-muted items-center justify-center"
              onPress={() => router.push(`/edit-technician/${item.$id}`)}
            >
              <Ionicons name="pencil" size={18} color="#065F46" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-lg bg-danger-light items-center justify-center"
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [router, t, handleDelete],
  );

  const renderTechnicianHeader = () => (
    <View className="px-4 pt-2 pb-3 gap-3">
      <View className="bg-surface rounded-2xl p-5 shadow-md">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-semibold text-text">
              {t("admin.title")}
            </Text>
            <Text className="text-sm text-text-secondary mt-1">
              {t("admin.registered", { count: technicians.length })}
            </Text>
          </View>
          <View className="w-14 h-14 rounded-xl bg-primary-muted items-center justify-center">
            <Ionicons name="people" size={28} color="#065F46" />
          </View>
        </View>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center bg-primary rounded-xl py-3 gap-2 shadow-sm"
          onPress={() => router.push("/add-technician")}
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text className="text-base font-medium text-surface">
            {t("admin.addTechnician")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-12 h-12 rounded-xl bg-surface items-center justify-center border-[1.5px] border-primary"
          onPress={handleReset}
        >
          <Ionicons name="refresh" size={20} color="#065F46" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Segment control ──
  const renderSegmentControl = () => (
    <View
      className="flex-row mx-4 mt-4 mb-2 bg-surface rounded-xl p-1"
      style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
    >
      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg gap-1.5 ${
          activeTab === "technicians" ? "bg-primary" : ""
        }`}
        onPress={() => setActiveTab("technicians")}
        activeOpacity={0.8}
      >
        <Ionicons
          name="construct"
          size={16}
          color={activeTab === "technicians" ? "#FFFFFF" : "#64748B"}
        />
        <Text
          className={`text-sm font-semibold ${
            activeTab === "technicians" ? "text-white" : "text-text-secondary"
          }`}
        >
          {t("admin.tabTechnicians")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg gap-1.5 ${
          activeTab === "admins" ? "bg-primary" : ""
        }`}
        onPress={() => setActiveTab("admins")}
        activeOpacity={0.8}
      >
        <Ionicons
          name="shield"
          size={16}
          color={activeTab === "admins" ? "#FFFFFF" : "#64748B"}
        />
        <Text
          className={`text-sm font-semibold ${
            activeTab === "admins" ? "text-white" : "text-text-secondary"
          }`}
        >
          {t("admin.tabAdmins")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── Admin management view ──
  const renderAdminsView = () => (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Promote card */}
      <View
        className="bg-surface mx-4 mt-3 rounded-2xl p-5"
        style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
      >
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 rounded-full bg-primary-muted items-center justify-center">
            <Ionicons name="person-add" size={20} color="#065F46" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-text">
              {t("admin.addNewAdmin")}
            </Text>
            <Text className="text-xs text-text-secondary mt-0.5">
              {t("admin.addNewAdminDesc")}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 bg-background border-[1.5px] border-border rounded-xl px-4 py-2.5 text-sm text-text"
            value={promoteEmail}
            onChangeText={setPromoteEmail}
            placeholder={t("admin.emailPlaceholder")}
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!promoting}
          />
          <TouchableOpacity
            className={`bg-primary rounded-xl px-4 items-center justify-center ${
              promoting || !promoteEmail.trim() ? "opacity-50" : ""
            }`}
            onPress={handlePromote}
            disabled={promoting || !promoteEmail.trim()}
            activeOpacity={0.8}
          >
            {promoting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="arrow-up-circle" size={22} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Current admins */}
      <Text className="text-xs font-bold text-text-muted uppercase tracking-wider px-6 mt-6 mb-3">
        {t("admin.currentAdmins")} ({admins.length})
      </Text>

      {adminsLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator size="small" color="#065F46" />
        </View>
      ) : admins.length === 0 ? (
        <View
          className="bg-surface mx-4 rounded-2xl p-6 items-center"
          style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
        >
          <Text className="text-sm text-text-secondary">
            {t("admin.noAdmins")}
          </Text>
        </View>
      ) : (
        admins.map((admin) => (
          <View
            key={admin.$id}
            className="bg-surface mx-4 mb-2 rounded-xl p-4 flex-row items-center"
            style={{ borderWidth: 1, borderColor: "#E2E8F0" }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "#D1FAE5" }}
            >
              <Ionicons name="shield-checkmark" size={18} color="#065F46" />
            </View>
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-text"
                numberOfLines={1}
              >
                {admin.name || "—"}
              </Text>
              <Text
                className="text-xs text-text-secondary mt-0.5"
                numberOfLines={1}
              >
                {admin.email}
              </Text>
            </View>
            {admin.$id !== user?.$id ? (
              <TouchableOpacity
                className="w-9 h-9 rounded-lg bg-danger-light items-center justify-center"
                onPress={() => handleDemote(admin)}
                disabled={demotingId === admin.$id}
              >
                {demotingId === admin.$id ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Ionicons name="remove-circle" size={18} color="#DC2626" />
                )}
              </TouchableOpacity>
            ) : (
              <View
                className="px-2 py-1 rounded-md"
                style={{ backgroundColor: "#DBEAFE" }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: "#1D4ED8" }}
                >
                  {t("admin.you")}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-background">
      {renderSegmentControl()}

      {activeTab === "technicians" ? (
        technicians.length === 0 ? (
          <View style={{ flex: 1, paddingBottom: 100 }}>
            {renderTechnicianHeader()}
            <EmptyState
              icon="📋"
              title={t("admin.noTechniciansTitle")}
              message={t("admin.noTechniciansMessage")}
            />
          </View>
        ) : (
          <FlatList
            data={technicians}
            renderItem={renderTechnician}
            keyExtractor={(item) => item.$id}
            ListHeaderComponent={renderTechnicianHeader}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={8}
            windowSize={5}
            initialNumToRender={6}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#065F46"]}
                tintColor="#065F46"
              />
            }
          />
        )
      ) : (
        renderAdminsView()
      )}
    </View>
  );
}
