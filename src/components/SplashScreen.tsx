import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
  SharedValue,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logo = require("../../app/logo.png");

interface SplashScreenProps {
  onFinish: () => void;
}

const ACCENT = "#10B981";
const ACCENT_LIGHT = "#34D399";
const BG = "#065F46";
const BG_DARK = "#064E3B";

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // --- shared values ---

  // Background rings that expand outward
  const ring1Scale = useSharedValue(0);
  const ring1Opacity = useSharedValue(0.6);
  const ring2Scale = useSharedValue(0);
  const ring2Opacity = useSharedValue(0.4);
  const ring3Scale = useSharedValue(0);
  const ring3Opacity = useSharedValue(0.3);

  // Logo
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoGlowOpacity = useSharedValue(0);

  // Shimmer sweep
  const shimmerX = useSharedValue(-width);

  // Title — each word enters separately
  const word1Opacity = useSharedValue(0);
  const word1X = useSharedValue(-30);
  const word2Opacity = useSharedValue(0);
  const word2X = useSharedValue(30);

  // Tagline
  const taglineOpacity = useSharedValue(0);
  const taglineScale = useSharedValue(0.8);

  // Divider line grows from center
  const dividerWidth = useSharedValue(0);
  const dividerOpacity = useSharedValue(0);

  // Bottom tool icons float up
  const icon1Y = useSharedValue(40);
  const icon1Opacity = useSharedValue(0);
  const icon2Y = useSharedValue(40);
  const icon2Opacity = useSharedValue(0);
  const icon3Y = useSharedValue(40);
  const icon3Opacity = useSharedValue(0);
  const icon4Y = useSharedValue(40);
  const icon4Opacity = useSharedValue(0);
  const icon5Y = useSharedValue(40);
  const icon5Opacity = useSharedValue(0);

  // Progress bar
  const progressWidth = useSharedValue(0);
  const progressOpacity = useSharedValue(0);

  // Floating particles
  const particle1Y = useSharedValue(0);
  const particle2Y = useSharedValue(0);
  const particle3Y = useSharedValue(0);
  const particle4Y = useSharedValue(0);

  // Exit
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);

  useEffect(() => {
    // ── Phase 1: Ripple rings expand from center (0ms) ──
    const ringConfig = { duration: 1000, easing: Easing.out(Easing.cubic) };
    ring1Scale.value = withTiming(4, ringConfig);
    ring1Opacity.value = withTiming(0, { duration: 1000 });
    ring2Scale.value = withDelay(200, withTiming(4, ringConfig));
    ring2Opacity.value = withDelay(200, withTiming(0, { duration: 1000 }));
    ring3Scale.value = withDelay(400, withTiming(4, ringConfig));
    ring3Opacity.value = withDelay(400, withTiming(0, { duration: 1000 }));

    // ── Phase 2: Logo springs in with bounce (300ms) ──
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    logoScale.value = withDelay(
      300,
      withSpring(1, { damping: 8, stiffness: 120, mass: 0.8 }),
    );

    // Glow pulse behind logo
    logoGlowOpacity.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.15, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );

    // ── Phase 3: Shimmer sweep (800ms) ──
    shimmerX.value = withDelay(
      800,
      withTiming(width * 1.5, { duration: 900, easing: Easing.inOut(Easing.quad) }),
    );

    // ── Phase 4: Title words slide in from opposite sides (1000ms) ──
    const wordDuration = 500;
    const wordEasing = Easing.out(Easing.back(1.2));
    word1Opacity.value = withDelay(1000, withTiming(1, { duration: wordDuration }));
    word1X.value = withDelay(1000, withTiming(0, { duration: wordDuration, easing: wordEasing }));
    word2Opacity.value = withDelay(1150, withTiming(1, { duration: wordDuration }));
    word2X.value = withDelay(1150, withTiming(0, { duration: wordDuration, easing: wordEasing }));

    // ── Phase 5: Divider line (1400ms) ──
    dividerOpacity.value = withDelay(1400, withTiming(1, { duration: 300 }));
    dividerWidth.value = withDelay(1400, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // ── Phase 6: Tagline scales in (1600ms) ──
    taglineOpacity.value = withDelay(1600, withTiming(1, { duration: 500 }));
    taglineScale.value = withDelay(1600, withSpring(1, { damping: 12, stiffness: 100 }));

    // ── Phase 7: Tool icons float up staggered (1800ms) ──
    const iconEntries = [
      { y: icon1Y, o: icon1Opacity, delay: 1800 },
      { y: icon2Y, o: icon2Opacity, delay: 1900 },
      { y: icon3Y, o: icon3Opacity, delay: 2000 },
      { y: icon4Y, o: icon4Opacity, delay: 2100 },
      { y: icon5Y, o: icon5Opacity, delay: 2200 },
    ];
    iconEntries.forEach(({ y, o, delay }) => {
      o.value = withDelay(delay, withTiming(1, { duration: 400 }));
      y.value = withDelay(delay, withSpring(0, { damping: 10, stiffness: 90 }));
    });

    // ── Phase 8: Progress bar fills (2000ms) ──
    progressOpacity.value = withDelay(2000, withTiming(1, { duration: 300 }));
    progressWidth.value = withDelay(
      2200,
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.cubic) }),
    );

    // ── Floating particles (ambient, start at 600ms) ──
    const floatUp = (sv: SharedValue<number>, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-20, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          true,
        ),
      );
    };
    floatUp(particle1Y, 600);
    floatUp(particle2Y, 900);
    floatUp(particle3Y, 1200);
    floatUp(particle4Y, 1500);

    // ── Exit: scale down + fade (3600ms) ──
    containerOpacity.value = withDelay(
      3600,
      withTiming(0, { duration: 500, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
    containerScale.value = withDelay(
      3600,
      withTiming(1.1, { duration: 500, easing: Easing.in(Easing.cubic) }),
    );
  }, []);

  // --- animated styles ---

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const makeRingStyle = (scale: SharedValue<number>, opacity: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));

  const ring1Style = makeRingStyle(ring1Scale, ring1Opacity);
  const ring2Style = makeRingStyle(ring2Scale, ring2Opacity);
  const ring3Style = makeRingStyle(ring3Scale, ring3Opacity);

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: logoGlowOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
    opacity: interpolate(shimmerX.value, [-width, 0, width * 1.5], [0, 0.35, 0]),
  }));

  const word1Style = useAnimatedStyle(() => ({
    opacity: word1Opacity.value,
    transform: [{ translateX: word1X.value }],
  }));

  const word2Style = useAnimatedStyle(() => ({
    opacity: word2Opacity.value,
    transform: [{ translateX: word2X.value }],
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    opacity: dividerOpacity.value,
    transform: [{ scaleX: dividerWidth.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ scale: taglineScale.value }],
  }));

  const makeIconStyle = (y: SharedValue<number>, o: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: o.value,
      transform: [{ translateY: y.value }],
    }));

  const icon1Style = makeIconStyle(icon1Y, icon1Opacity);
  const icon2Style = makeIconStyle(icon2Y, icon2Opacity);
  const icon3Style = makeIconStyle(icon3Y, icon3Opacity);
  const icon4Style = makeIconStyle(icon4Y, icon4Opacity);
  const icon5Style = makeIconStyle(icon5Y, icon5Opacity);

  const progressBarStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }));

  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%` as any,
  }));

  const makeParticleStyle = (y: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      transform: [{ translateY: y.value }],
    }));

  const p1Style = makeParticleStyle(particle1Y);
  const p2Style = makeParticleStyle(particle2Y);
  const p3Style = makeParticleStyle(particle3Y);
  const p4Style = makeParticleStyle(particle4Y);

  const toolIcons = ["🔧", "⚡", "🔨", "🧱", "🎨"];

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* ── Floating particles ── */}
      <Animated.View style={[styles.particle, { top: "15%", left: "10%" }, p1Style]}>
        <View style={[styles.particleDot, { width: 6, height: 6 }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { top: "25%", right: "15%" }, p2Style]}>
        <View style={[styles.particleDot, { width: 4, height: 4 }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { bottom: "30%", left: "20%" }, p3Style]}>
        <View style={[styles.particleDot, { width: 5, height: 5 }]} />
      </Animated.View>
      <Animated.View style={[styles.particle, { bottom: "20%", right: "12%" }, p4Style]}>
        <View style={[styles.particleDot, { width: 3, height: 3 }]} />
      </Animated.View>

      {/* ── Ripple rings ── */}
      <Animated.View style={[styles.ring, ring1Style]} />
      <Animated.View style={[styles.ring, ring2Style]} />
      <Animated.View style={[styles.ring, ring3Style]} />

      {/* ── Logo glow ── */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* ── Logo ── */}
      <Animated.View style={[styles.logoWrapper, logoContainerStyle]}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          {/* Shimmer sweep */}
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      </Animated.View>

      {/* ── Title (split into two words) ── */}
      <View style={styles.titleRow}>
        <Animated.Text style={[styles.titleWord, styles.titleWord1, word1Style]}>
          Technician
        </Animated.Text>
        <Animated.Text style={[styles.titleWord, styles.titleWord2, word2Style]}>
          {" "}Finder
        </Animated.Text>
      </View>

      {/* ── Divider ── */}
      <Animated.View style={[styles.divider, dividerStyle]} />

      {/* ── Tagline ── */}
      <Animated.View style={taglineStyle}>
        <Text style={styles.tagline}>Find the perfect technician</Text>
      </Animated.View>

      {/* ── Tool icons ── */}
      <View style={styles.iconsRow}>
        {[icon1Style, icon2Style, icon3Style, icon4Style, icon5Style].map(
          (style, i) => (
            <Animated.View key={i} style={[styles.iconBubble, style]}>
              <Text style={styles.iconEmoji}>{toolIcons[i]}</Text>
            </Animated.View>
          ),
        )}
      </View>

      {/* ── Progress bar ── */}
      <Animated.View style={[styles.progressTrack, progressBarStyle]}>
        <Animated.View style={[styles.progressFill, progressFillStyle]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  /* Ripple rings */
  ring: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },
  /* Glow behind logo */
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: ACCENT,
  },
  /* Floating particles */
  particle: {
    position: "absolute",
  },
  particleDot: {
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  /* Logo */
  logoWrapper: {
    marginBottom: 24,
  },
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: 50,
    backgroundColor: "rgba(255,255,255,0.5)",
    transform: [{ skewX: "-20deg" }],
  },
  /* Title */
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  titleWord: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  titleWord1: {},
  titleWord2: {
    color: ACCENT_LIGHT,
  },
  /* Divider */
  divider: {
    width: 50,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: ACCENT,
    marginBottom: 12,
  },
  /* Tagline */
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
    marginBottom: 32,
  },
  /* Tool icons */
  iconsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 40,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  iconEmoji: {
    fontSize: 20,
  },
  /* Progress bar */
  progressTrack: {
    width: 160,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
});
