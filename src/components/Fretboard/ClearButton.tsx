/* The clear fretboard notes button: Empties every selected note in one tap instead of
   having to untap each one and only shows once there is actually something selected. 
   It is deliberately not the same shape or colour as the progression strips Clear button and does not ask for confirmation but has an undo button

   Placement mirrors the strum button but on the opposite side, on the left of the
   fretboard above the results panel. However, on a narrow screen the boards own width moves to the right side instead */

import React, { memo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../../styles/colors';
import { FLOATING_BUTTON_REACH, NEEDS_RESERVED_SPACE } from '../../styles/fretboardStyles';

interface Props {
  mode: 'clear' | 'undo';
  visible: boolean;
  onPress: () => void;
}

function ClearButtonComponent({ mode, visible, onPress }: Props) {
  if (!visible) return null;

  const isUndo = mode === 'undo';

  return (
    <View style={NEEDS_RESERVED_SPACE ? styles.containerRight : styles.containerLeft}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          isUndo && styles.buttonUndo,
          pressed && styles.buttonPressed,
        ]}
        hitSlop={8}
      >
        {/* X emoji, and undo */}
        <Text style={[styles.icon, isUndo && styles.iconUndo]}>{isUndo ? '↺' : '❌'}</Text>
        <Text style={styles.label}>{isUndo ? 'Undo' : 'Clear'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // First choice: floats past the left edge, mirroring the strum butto's height
  containerLeft: {
    position: 'absolute',
    left: -FLOATING_BUTTON_REACH,
    bottom: 10,
    zIndex: 10,
  },

  containerRight: {
    position: 'absolute',
    right: -FLOATING_BUTTON_REACH,
    top: '50%',
    marginTop: -22,
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
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  // The undo offer gets the accent tint so it visibly differs from the everyday
  // Clear look, not just its icon
  buttonUndo: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  buttonPressed: {
    backgroundColor: COLORS.bgHover,
  },
  icon: {
    fontSize: 15,
    lineHeight: 17,
  },
  // The undo arrow needs an explicit colour (see the comment above where it is
  // used), this is the same accent lavender the tuning fork icon uses, which
  // already reads clearly against both this button's dark background and its own
  // accentDim tint above
  iconUndo: {
    color: COLORS.accentLight,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});

export const ClearButton = memo(ClearButtonComponent);
