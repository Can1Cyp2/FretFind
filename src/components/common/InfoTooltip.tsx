/* A small centered popup for the theory explanations */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../styles/colors';

interface Props {
  visible: boolean;
  title: string;
  text: string;
  onClose: () => void;
}

export function InfoTooltip({ visible, title, text, onClose }: Props) {
  if (!visible) return null;

  return (
    /* box-none lets the parts of this that are just layout pass touches through to the
       backdrop underneath them, so only the backdrop and the card itself take taps.

       zIndex covers iOS / elevation Android, both are needed for this to reliably
       paint above the onscreen content rather than behind it. */
    <View style={styles.root} pointerEvents="box-none">
      {/* Tapping the dark area outside the card closes it */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.centerer} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{text}</Text>
          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  centerer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 24,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: COLORS.border,
    // Lifts the card above its own backdrop on Android, which goes by elevation rather than by which order the views are written in
    elevation: 4,
  },
  title: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: COLORS.textOnAccent,
    fontSize: 14,
    fontWeight: '700',
  },
});
