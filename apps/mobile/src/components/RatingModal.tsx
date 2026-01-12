import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme/colors';
import { BottomSheet, RatingStars } from './SharedComponents';
import { submitRating } from '../api/rating';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  ratedUserId: string;
  ratedUserName: string;
  partyId: string;
  onRatingSubmitted?: () => void;
}

export const RatingModal = ({
  visible,
  onClose,
  ratedUserId,
  ratedUserName,
  partyId,
  onRatingSubmitted,
}: RatingModalProps): JSX.Element => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Select a rating', 'Please tap the stars to rate your experience.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitRating({
        ratedUserId,
        partyId,
        score: rating,
        comment: comment.trim() || undefined,
      });

      if (result.error) {
        Alert.alert('Rating Failed', result.error.message || 'Unable to submit rating. Please try again.');
        setSubmitting(false);
        return;
      }

      Alert.alert('Thank You!', `Your rating for ${ratedUserName} has been submitted.`, [
        {
          text: 'OK',
          onPress: () => {
            handleClose();
            onRatingSubmitted?.();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={`Rate ${ratedUserName}`}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          How was your ride experience with {ratedUserName}? Your feedback helps the community.
        </Text>

        <View style={styles.ratingSection}>
          <RatingStars
            rating={rating}
            size={40}
            interactive
            onRatingChange={setRating}
          />
          {rating > 0 && (
            <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
          )}
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.sectionLabel}>Comment (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share more about your experience..."
            placeholderTextColor={palette.textSecondary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipButton} onPress={handleClose} disabled={submitting}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, (submitting || rating === 0) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={palette.textPrimary} />
            ) : (
              <>
                <Ionicons name="star" size={18} color={palette.textPrimary} />
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Ratings are anonymous and help other riders make informed decisions.
        </Text>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 20,
  },
  ratingLabel: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#fbbf24',
  },
  commentSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 10,
  },
  commentInput: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.outline,
    minHeight: 80,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textSecondary,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: palette.primary,
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
  disclaimer: {
    fontSize: 12,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default RatingModal;
