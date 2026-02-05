import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, shadows, spacing, borderRadius, typography } from '../constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large', message }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size={size} color={colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing['2xl'],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing['3xl'],
    alignItems: 'center',
    ...shadows.md,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});

export default LoadingSpinner;
