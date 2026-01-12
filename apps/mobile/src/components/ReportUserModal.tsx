import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme/colors';
import { BottomSheet } from './SharedComponents';
import { submitReport, blockUser, REPORT_REASONS, ReportReason } from '../api/report';

interface ReportUserModalProps {
  visible: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
  partyId?: string;
}

export const ReportUserModal = ({
  visible,
  onClose,
  reportedUserId,
  reportedUserName,
  partyId,
}: ReportUserModalProps): JSX.Element => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [blockAfterReport, setBlockAfterReport] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Select a reason', 'Please select a reason for your report.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitReport({
        reportedUserId,
        reason: selectedReason,
        details: details.trim() || undefined,
        partyId,
      });

      if (!result.success) {
        Alert.alert('Report Failed', result.error || 'Unable to submit report. Please try again.');
        setSubmitting(false);
        return;
      }

      if (blockAfterReport) {
        const blockResult = await blockUser(reportedUserId);
        if (!blockResult.success) {
          console.warn('Failed to block user:', blockResult.error);
        }
      }

      Alert.alert(
        'Report Submitted',
        `Thank you for your report. Our team will review it and take appropriate action.${blockAfterReport ? ' The user has been blocked.' : ''}`,
        [{ text: 'OK', onPress: handleClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDetails('');
    setBlockAfterReport(false);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={`Report ${reportedUserName}`}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Help us understand what happened. Your report will be reviewed by our team.
        </Text>

        <Text style={styles.sectionLabel}>Reason for report</Text>
        <View style={styles.reasonsList}>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={[
                styles.reasonItem,
                selectedReason === reason.value && styles.reasonItemSelected,
              ]}
              onPress={() => setSelectedReason(reason.value)}
            >
              <View style={styles.reasonRadio}>
                {selectedReason === reason.value && (
                  <View style={styles.reasonRadioFilled} />
                )}
              </View>
              <View style={styles.reasonContent}>
                <Text style={styles.reasonLabel}>{reason.label}</Text>
                <Text style={styles.reasonDescription}>{reason.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Additional details (optional)</Text>
        <TextInput
          style={styles.detailsInput}
          placeholder="Provide any additional information that might help us understand the situation..."
          placeholderTextColor={palette.textSecondary}
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.blockOption}
          onPress={() => setBlockAfterReport(!blockAfterReport)}
        >
          <View style={[styles.checkbox, blockAfterReport && styles.checkboxChecked]}>
            {blockAfterReport && <Ionicons name="checkmark" size={14} color={palette.textPrimary} />}
          </View>
          <View style={styles.blockContent}>
            <Text style={styles.blockLabel}>Also block this user</Text>
            <Text style={styles.blockDescription}>
              They won't be able to see your parties or contact you
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={submitting}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !selectedReason}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={palette.textPrimary} />
            ) : (
              <>
                <Ionicons name="flag" size={18} color={palette.textPrimary} />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    maxHeight: 500,
  },
  subtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 12,
  },
  reasonsList: {
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
  },
  reasonItemSelected: {
    borderColor: palette.primary,
    backgroundColor: palette.muted,
  },
  reasonRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: palette.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  reasonRadioFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },
  reasonContent: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  reasonDescription: {
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 18,
  },
  detailsInput: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.outline,
    minHeight: 100,
    marginBottom: 20,
  },
  blockOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: palette.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  blockContent: {
    flex: 1,
  },
  blockLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  blockDescription: {
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: palette.danger,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textPrimary,
  },
});

export default ReportUserModal;
