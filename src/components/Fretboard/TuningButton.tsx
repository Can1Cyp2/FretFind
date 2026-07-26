/* The tuning button floats past the right edge of the fretboard, in line with the
   string label letters at the top, the same way the strum button floats past the
   right edge lower down. It opens the tuning popup, on the fork icon, right
   opposite the 'O' open notes button that sits on the left at the nut. */

import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../styles/colors';
import { FLOATING_BUTTON_REACH } from '../../styles/fretboardStyles';

interface Props {
  onPress: () => void;
}

// A small tuning fork drawn out of plain views:
function TuningForkIcon() {
  return (
    <View style={forkStyles.wrapper}>
      <View style={forkStyles.prongs}>
        <View style={forkStyles.prong} />
        <View style={forkStyles.prong} />
      </View>
      <View style={forkStyles.base} />
      <View style={forkStyles.stem} />
    </View>
  );
}

function TuningButtonComponent({ onPress }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        hitSlop={8}
      >
        <TuningForkIcon />
        <Text style={styles.label}>Tuning</Text>
      </Pressable>
    </View>
  );
}

const forkStyles = StyleSheet.create({
  wrapper: {
    width: 16,
    alignItems: 'center',
  },
  prongs: {
    flexDirection: 'row',
    gap: 5,
  },
  prong: {
    width: 2.5,
    height: 10,
    borderTopLeftRadius: 1.5,
    borderTopRightRadius: 1.5,
    backgroundColor: COLORS.accentLight,
  },
  base: {
    width: 10,
    height: 2.5,
    backgroundColor: COLORS.accentLight,
  },
  stem: {
    width: 2.5,
    height: 6,
    backgroundColor: COLORS.accentLight,
  },
});

// Floats just past the right edge of the fretboard, at the top by the string labels
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -FLOATING_BUTTON_REACH,
    top: 0,
    zIndex: 10,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonPressed: {
    backgroundColor: COLORS.bgHover,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 3,
  },
});

export const TuningButton = memo(TuningButtonComponent);
