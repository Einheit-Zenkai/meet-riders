import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { mobileMenuItems } from '../constants/menuItems';

const ridePreferences = ['On Foot', 'Auto', 'Cab', 'Bus', 'SUV'] as const;
const expiryOptions = ['10', '15', '20', '30', '60'] as const;

type RidePreference = (typeof ridePreferences)[number];

type HostPartyScreenProps = NativeStackScreenProps<RootStackParamList, 'HostParty'>;

const HostPartyScreen = ({ navigation }: HostPartyScreenProps): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [meetupPoint, setMeetupPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [connectionsOnly, setConnectionsOnly] = useState(false);
  const [showUniversity, setShowUniversity] = useState(true);
  const [maxPartySize, setMaxPartySize] = useState(2);
  const [comments, setComments] = useState('');
  const [ridePreference, setRidePreference] = useState<RidePreference>('On Foot');
  const [expiry, setExpiry] = useState<'10' | '15' | '20' | '30' | '60'>('10');

  const handleStartParty = (): void => {
    Alert.alert('Party saved', 'Ride hosting will be wired soon.');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
          </Pressable>
          <Text style={styles.screenTitle}>Host a Party</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Meetup point (address)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the full meeting address"
              placeholderTextColor={palette.textSecondary}
              value={meetupPoint}
              onChangeText={setMeetupPoint}
            />
          </View>

          <View style={styles.mapSection}>
            <Text style={styles.label}>Select meetup on map</Text>
            <View style={styles.mapFrame}>
              <Text style={styles.mapPlaceholder}>Map preview coming soon</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Final Destination (address)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your final destination address"
              placeholderTextColor={palette.textSecondary}
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={styles.privacyBlock}>
              <Text style={styles.label}>Privacy</Text>
              <View style={styles.toggleRow}>
                <Switch
                  value={connectionsOnly}
                  onValueChange={setConnectionsOnly}
                  trackColor={{ false: palette.surfaceAlt, true: palette.primary }}
                  thumbColor={palette.textPrimary}
                />
                <Text style={styles.toggleLabel}>Connections only (Private Party)</Text>
              </View>
              <View style={styles.toggleRow}>
                <Switch
                  value={showUniversity}
                  onValueChange={setShowUniversity}
                  trackColor={{ false: palette.surfaceAlt, true: palette.primary }}
                  thumbColor={palette.textPrimary}
                />
                <Text style={styles.toggleLabel}>Display my university on this party</Text>
              </View>
            </View>

            <View style={styles.partySizeBlock}>
              <Text style={styles.label}>Max party size</Text>
              <View style={styles.partySizeControl}>
                <TouchableOpacity
                  onPress={() => setMaxPartySize((value) => Math.max(1, value - 1))}
                  style={styles.sizeButton}
                >
                  <Ionicons name="remove" size={20} color={palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.partySizeValue}>{maxPartySize}</Text>
                <TouchableOpacity
                  onPress={() => setMaxPartySize((value) => Math.min(8, value + 1))}
                  style={styles.sizeButton}
                >
                  <Ionicons name="add" size={20} color={palette.textPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.partySizeHint}>Invites include you.</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Comments (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any special instructions, notes, or comments"
              placeholderTextColor={palette.textSecondary}
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ideal ride from destination</Text>
            <View style={styles.chipRow}>
              {ridePreferences.map((option) => {
                const active = ridePreference === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setRidePreference(option)}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Expire party request in</Text>
            <View style={styles.chipRow}>
              {expiryOptions.map((option) => {
                const active = expiry === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.radiusChip, active && styles.radiusChipActive]}
                    onPress={() => setExpiry(option)}
                  >
                    <View style={[styles.radioDot, active && styles.radioDotActive]} />
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option} min</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelLabel}>Cancel Party</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartParty}>
            <Text style={styles.primaryLabel}>Start Party!</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={menuOpen} animationType="fade" transparent>
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuPanel}>
            {mobileMenuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  if (item.label === 'Home') {
                    navigation.navigate('Home', { email: '' });
                    return;
                  }
                  if (item.label === 'Host Party') {
                    return;
                  }
                  Alert.alert(item.label, 'Navigation coming soon.');
                }}
              >
                <Ionicons name={item.icon} size={22} color={palette.textPrimary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    paddingVertical: 24,
  },
  container: {
    width: '90%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: palette.backgroundAlt,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  menuStripe: {
    width: 22,
    height: 3,
    backgroundColor: palette.textPrimary,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 2,
  },
  screenTitle: {
    marginLeft: 16,
    fontSize: 22,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollArea: {
    paddingBottom: 140,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  mapSection: {
    marginBottom: 24,
  },
    marginBottom: 16,
  mapFrame: {
    height: 180,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
    marginBottom: 16,
  mapPlaceholder: {
    color: palette.textSecondary,
    fontStyle: 'italic',
  },
  rowGroup: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  privacyBlock: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    padding: 20,
    marginRight: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    color: palette.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  partySizeBlock: {
    width: 150,
    backgroundColor: palette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    padding: 20,
    alignItems: 'center',
  },
  partySizeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partySizeValue: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  partySizeHint: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.outline,
    marginRight: 10,
    marginBottom: 10,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: palette.textPrimary,
  },
  radiusChip: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.outline,
    marginRight: 10,
    marginBottom: 10,
  },
  radiusChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: palette.textSecondary,
  },
  radioDotActive: {
    backgroundColor: palette.textPrimary,
    borderColor: palette.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.outline,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.surface,
    marginRight: 16,
  },
  cancelLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryLabel: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 20,
    position: 'relative',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  menuPanel: {
    width: 260,
    backgroundColor: palette.surface,
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: palette.outline,
    zIndex: 1,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default HostPartyScreen;
