import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme/colors';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet = ({ visible, onClose, title, children }: BottomSheetProps): JSX.Element => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'default',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps): JSX.Element => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity
              style={[styles.dialogButton, styles.dialogButtonSecondary]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.dialogButtonTextSecondary}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dialogButton,
                confirmStyle === 'danger' ? styles.dialogButtonDanger : styles.dialogButtonPrimary,
                loading && styles.dialogButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={styles.dialogButtonText}>{loading ? 'Loading...' : confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const RatingStars = ({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onRatingChange,
}: RatingStarsProps): JSX.Element => {
  const stars = Array.from({ length: maxRating }, (_, index) => {
    const filled = index < Math.floor(rating);
    const halfFilled = !filled && index < rating;
    
    return (
      <TouchableOpacity
        key={index}
        disabled={!interactive}
        onPress={() => onRatingChange?.(index + 1)}
        activeOpacity={interactive ? 0.7 : 1}
      >
        <Ionicons
          name={filled ? 'star' : halfFilled ? 'star-half' : 'star-outline'}
          size={size}
          color={filled || halfFilled ? '#fbbf24' : palette.textSecondary}
        />
      </TouchableOpacity>
    );
  });

  return <View style={styles.starsContainer}>{stars}</View>;
};

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Badge = ({ text, variant = 'primary', icon }: BadgeProps): JSX.Element => {
  const variantStyle = {
    primary: styles.badgePrimary,
    secondary: styles.badgeSecondary,
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    danger: styles.badgeDanger,
  }[variant];

  return (
    <View style={[styles.badge, variantStyle]}>
      {icon && <Ionicons name={icon} size={12} color={palette.textPrimary} style={styles.badgeIcon} />}
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

interface CrownBadgeProps {
  size?: number;
  showLabel?: boolean;
}

export const CrownBadge = ({ size = 16, showLabel = false }: CrownBadgeProps): JSX.Element => {
  return (
    <View style={styles.crownContainer}>
      <View style={[styles.crownCircle, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
        <Text style={[styles.crownIcon, { fontSize: size }]}>👑</Text>
      </View>
      {showLabel && <Text style={styles.crownLabel}>Host</Text>}
    </View>
  );
};

interface AvatarProps {
  name: string;
  size?: number;
  imageUrl?: string | null;
  showCrown?: boolean;
}

export const Avatar = ({ name, size = 48, imageUrl, showCrown = false }: AvatarProps): JSX.Element => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <View style={styles.avatarWrapper}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initials}</Text>
      </View>
      {showCrown && (
        <View style={styles.avatarCrown}>
          <Text style={styles.avatarCrownIcon}>👑</Text>
        </View>
      )}
    </View>
  );
};

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon = 'alert-circle-outline', title, message, actionLabel, onAction }: EmptyStateProps): JSX.Element => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={64} color={palette.textSecondary} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Bottom Sheet
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: palette.outline,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.outline,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Dialog
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 15,
    color: palette.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogButtonPrimary: {
    backgroundColor: palette.primary,
  },
  dialogButtonSecondary: {
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  dialogButtonDanger: {
    backgroundColor: palette.danger,
  },
  dialogButtonDisabled: {
    opacity: 0.6,
  },
  dialogButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  dialogButtonTextSecondary: {
    color: palette.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },

  // Rating Stars
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  badgePrimary: {
    backgroundColor: palette.primary,
  },
  badgeSecondary: {
    backgroundColor: palette.surfaceAlt,
  },
  badgeSuccess: {
    backgroundColor: '#22c55e',
  },
  badgeWarning: {
    backgroundColor: '#f59e0b',
  },
  badgeDanger: {
    backgroundColor: palette.danger,
  },

  // Crown Badge
  crownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crownCircle: {
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownIcon: {
    lineHeight: 20,
  },
  crownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
  },

  // Avatar
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.outline,
  },
  avatarText: {
    fontWeight: '700',
    color: palette.textPrimary,
  },
  avatarCrown: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCrownIcon: {
    fontSize: 12,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyAction: {
    backgroundColor: palette.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  emptyActionText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default {
  BottomSheet,
  ConfirmDialog,
  RatingStars,
  Badge,
  CrownBadge,
  Avatar,
  EmptyState,
};
