/* A small centered popup for the theory explanations. It fades in over whatever
   is open, shows a title and a short plain-language text, and closes from the
   'Got it' button or a tap anywhere outside it. */

import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { COLORS } from '../../styles/colors';

interface Props {
  visible: boolean;
  title: string;
  text: string;
  onClose: () => void;
}

export function InfoTooltip({ visible, title, text, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Tapping the dark area outside the popup closes it, taps inside stay put */}
      <Pressable
        style={{
          flex: 1,
          backgroundColor: COLORS.overlay,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: COLORS.bgCard,
            borderRadius: 16,
            padding: 24,
            maxWidth: '85%',
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
          onPress={event => event.stopPropagation()}
        >
          <Text style={{ color: COLORS.accent, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            {title}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 }}>
            {text}
          </Text>
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: COLORS.accent,
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 20,
              marginTop: 20,
              alignSelf: 'center',
            }}
          >
            <Text style={{ color: COLORS.textOnAccent, fontSize: 14, fontWeight: '700' }}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
