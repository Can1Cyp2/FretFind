/* The options button:

   includes options for display switches: note spelling (sharps or flats) and octave labels (E2 instead
   of just E).Each setting is a tappable card that flips the value and shows the current
    choice underneath, so the user can see what they have picked at a glance. */

import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

interface Props {
  visible: boolean;
  onClose: () => void;
  showOctaves: boolean;          // whether note labels include the octave number
  preferFlats: boolean;          // whether notes are spelt with flats instead of sharps
  onToggleOctaves: () => void;   // flips the octave labels on or off
  onTogglePreferFlats: () => void; // flips between sharps and flats
}

export function SettingsModal({
  visible,
  onClose,
  showOctaves,
  preferFlats,
  onToggleOctaves,
  onTogglePreferFlats,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>

      {/* Tapping the dark area outside the sheet closes it, taps inside the sheet stay */}
      <Pressable style={commonStyles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[commonStyles.modalContent, { maxHeight: '70%' }]}
          onPress={event => event.stopPropagation()}
        >
          <View style={commonStyles.modalHandle} />
          <View style={commonStyles.modalHeader}>
            <Text style={commonStyles.modalTitle}>Settings</Text>
            <Pressable onPress={onClose} style={commonStyles.modalCloseButton}>
              <Text style={commonStyles.modalCloseText}>{'✕'}</Text>
            </Pressable>
          </View>

          {/* Note spelling: flips between sharps (C#) and flats (Db). They are the same
              sounding notes, just written differently (for theory purposes, but not crucial for the average player), 
              so this is purely a display preference. The two spellings sit side by side on the right with the one in use lit up. */}
          <Pressable onPress={onTogglePreferFlats} style={commonStyles.settingCard}>
            <View style={commonStyles.settingCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={commonStyles.settingTitle}>Note spelling</Text>
                <Text style={commonStyles.settingValue}>
                  {preferFlats ? 'Flats (Db, Eb, Ab)' : 'Sharps (C#, D#, G#)'}
                </Text>
              </View>
              <View style={commonStyles.spellingChoiceRow}>
                <View style={[commonStyles.spellingChoice, !preferFlats && commonStyles.spellingChoiceActive]}>
                  <Text style={[commonStyles.spellingChoiceText, !preferFlats && commonStyles.spellingChoiceTextActive]}>
                    C#
                  </Text>
                </View>
                <View style={[commonStyles.spellingChoice, preferFlats && commonStyles.spellingChoiceActive]}>
                  <Text style={[commonStyles.spellingChoiceText, preferFlats && commonStyles.spellingChoiceTextActive]}>
                    Db
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Octave labels: adds the octave number to every note label (C4 instead of just C),
              so the user can tell apart the same note in different octaves. The button turns green when the labels are on. */}
          <Pressable onPress={onToggleOctaves} style={commonStyles.settingCard}>
            <View style={commonStyles.settingCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={commonStyles.settingTitle}>Octave labels</Text>
                <Text style={commonStyles.settingValue}>
                  {showOctaves ? 'On (C4, E3, G3...)' : 'Off (C, E, G...)'}
                </Text>
              </View>
              <View style={[commonStyles.switchTrack, showOctaves && commonStyles.switchTrackOn]}>
                <View style={[commonStyles.switchThumb, showOctaves && commonStyles.switchThumbOn]} />
              </View>
            </View>
          </Pressable>

          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
