import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { colors } from "../../src/constants/colors";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_CONFIG: {
  name: string;
  labelKey: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    name: "index",
    labelKey: "tabs.home",
    activeIcon: "home",
    inactiveIcon: "home-outline",
  },
  {
    name: "favorites",
    labelKey: "tabs.favorites",
    activeIcon: "heart",
    inactiveIcon: "heart-outline",
  },
  {
    name: "admin",
    labelKey: "tabs.manage",
    activeIcon: "construct",
    inactiveIcon: "construct-outline",
  },
];

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.barOuter,
        {
          paddingBottom:
            Platform.OS === "ios" ? Math.max(insets.bottom - 8, 6) : 10,
        },
      ]}
    >
      <View style={styles.barInner}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config = TAB_CONFIG[index];
          const label = t(config.labelKey);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          if (focused) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityState={{ selected: true }}
                accessibilityLabel={label}
              >
                <LinearGradient
                  colors={["#2563EB", "#1D4ED8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activePill}
                >
                  <Ionicons
                    name={config.activeIcon}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.activeLabel}>{label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.6}
              style={styles.inactiveTab}
              accessibilityRole="button"
              accessibilityState={{ selected: false }}
              accessibilityLabel={label}
            >
              <Ionicons name={config.inactiveIcon} size={23} color="#94A3B8" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  barInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 6,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
    width: "100%",
    maxWidth: 340,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 8,
  },
  activeLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  inactiveTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
});

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.surface,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen name="index" options={{ headerShown: false }} />
      <Tabs.Screen name="favorites" options={{ title: t("tabs.favorites") }} />
      <Tabs.Screen
        name="admin"
        options={{ title: t("screens.manageTechnicians") }}
      />
    </Tabs>
  );
}
