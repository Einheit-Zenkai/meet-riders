import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme/colors';
import { searchLocation, LocationSearchResult } from '../api/location';

interface LocationSearchBarProps {
  placeholder?: string;
  onLocationSelect: (location: LocationSearchResult) => void;
  onClear?: () => void;
  initialValue?: string;
}

export const LocationSearchBar = ({
  placeholder = 'Search for a location...',
  onLocationSelect,
  onClear,
  initialValue = '',
}: LocationSearchBarProps): JSX.Element => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (text.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const locations = await searchLocation(text);
        setResults(locations);
        setShowResults(locations.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  const handleSelect = (location: LocationSearchResult) => {
    setQuery(location.name);
    setShowResults(false);
    Keyboard.dismiss();
    onLocationSelect(location);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    onClear?.();
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color={palette.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={palette.textSecondary}
          value={query}
          onChangeText={handleSearch}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {loading && (
          <ActivityIndicator size="small" color={palette.primary} style={styles.loadingIndicator} />
        )}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={palette.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                <Ionicons name="location" size={18} color={palette.primary} style={styles.resultIcon} />
                <View style={styles.resultContent}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.resultAddress} numberOfLines={2}>
                    {item.displayName}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyResult}>
                <Text style={styles.emptyText}>No locations found</Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

interface ActiveUsersIndicatorProps {
  count: number;
  onPress?: () => void;
}

export const ActiveUsersIndicator = ({ count, onPress }: ActiveUsersIndicatorProps): JSX.Element => {
  return (
    <TouchableOpacity 
      style={[styles.indicatorContainer, count > 0 && styles.indicatorContainerActive]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.indicatorDot}>
        <View style={[styles.indicatorDotInner, count > 0 && styles.indicatorDotActive]} />
      </View>
      <Text style={[styles.indicatorText, count > 0 && styles.indicatorTextActive]}>
        {count > 0 
          ? `${count} ${count === 1 ? 'rider' : 'riders'} nearby`
          : 'No riders nearby'
        }
      </Text>
    </TouchableOpacity>
  );
};

interface LocationMarkerDisplayProps {
  latitude: number;
  longitude: number;
  label?: string;
  type?: 'meetup' | 'destination';
}

export const LocationMarkerDisplay = ({
  latitude,
  longitude,
  label,
  type = 'meetup',
}: LocationMarkerDisplayProps): JSX.Element => {
  return (
    <View style={styles.markerDisplay}>
      <View style={[styles.markerIcon, type === 'destination' && styles.markerIconDestination]}>
        <Ionicons 
          name={type === 'meetup' ? 'location' : 'flag'} 
          size={16} 
          color={palette.textPrimary} 
        />
      </View>
      <View style={styles.markerInfo}>
        {label && <Text style={styles.markerLabel}>{label}</Text>}
        <Text style={styles.markerCoords}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: palette.textPrimary,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: palette.surface,
    borderRadius: 16,
    marginTop: 8,
    maxHeight: 280,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.outline,
  },
  resultIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 18,
  },
  emptyResult: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  indicatorContainerActive: {
    borderColor: palette.primary,
    backgroundColor: palette.muted,
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  indicatorDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.textSecondary,
  },
  indicatorDotActive: {
    backgroundColor: '#22c55e',
  },
  indicatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  indicatorTextActive: {
    color: palette.textPrimary,
  },
  markerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  markerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  markerIconDestination: {
    backgroundColor: '#22c55e',
  },
  markerInfo: {
    flex: 1,
  },
  markerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  markerCoords: {
    fontSize: 12,
    color: palette.textSecondary,
    fontFamily: 'monospace',
  },
});

export default {
  LocationSearchBar,
  ActiveUsersIndicator,
  LocationMarkerDisplay,
};
