/*  strum button at the right of the fretboard. 
It only appearsonce two or more notes are selected (a single note is not a chord to strum), */

import React, { memo, useRef, useCallback } from 'react';
import { Pressable, Text, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../../styles/colors';

interface Props {
  visible: boolean;   // shown only when there is a chord worth strumming
  onStrum: () => void;
}

function StrumButtonComponent({ visible, onStrum }: Props) {
  // The press animation: shrink a little on press, spring back on release (makes it feel real)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  }, [scaleAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onStrum}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        hitSlop={8}
      >
        <Text style={styles.icon}>{'▶'}</Text>
        <Text style={styles.label}>Strum</Text>
      </Pressable>
    </Animated.View>
  );
}

// Floats just past the right edge of the fretboard, above the results
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -52,
    bottom: 10,
    zIndex: 10,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: COLORS.accentLight,
  },
  buttonPressed: {
    backgroundColor: COLORS.accentLight,
  },
  icon: {
    color: COLORS.textOnAccent,
    fontSize: 14,
    marginTop: -1,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export const StrumButton = memo(StrumButtonComponent);
