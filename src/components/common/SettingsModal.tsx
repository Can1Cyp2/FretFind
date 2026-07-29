/* The options button:

   includes options for display switches: note spelling (sharps or flats) and octave labels (E2 instead
   of just E).Each setting is a tappable card that flips the value and shows the current
    choice underneath, so the user can see what they have picked at a glance. */

import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';
import { VolumeSlider } from './VolumeSlider';

interface Props {
  visible: boolean;
  onClose: () => void;
  showOctaves: boolean;          // whether note labels include the octave number
  preferFlats: boolean;          // whether notes are spelt with flats instead of sharps
  volume: number;                // audio volume from 0 to 1
  onToggleOctaves: () => void;   // flips the octave labels on or off
  onTogglePreferFlats: () => void; // flips between sharps and flats
  onVolumeChange: (value: number) => void; // moves the volume slider
  isAccountAvailable: boolean;   // false when the app was built without backend keys
  isSignedIn: boolean;
  accountEmail: string | null;
  onOpenAccount: () => void;     // opens the account sheet
}

export function SettingsModal({
  visible,
  onClose,
  showOctaves,
  preferFlats,
  volume,
  onToggleOctaves,
  onTogglePreferFlats,
  onVolumeChange,
  isAccountAvailable,
  isSignedIn,
  accountEmail,
  onOpenAccount,
}: Props) {
  // Close this sheet before opening the account one, so they do not stack up
  const openAccount = () => {
    onClose();
    onOpenAccount();
  };

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

          {/* Audio volume: turns every note the app plays up or down. This is a card
              you drag rather than tap, so it is not a Pressable like the others. The
              current level is shown as a percentage on the right. */}
          <View style={commonStyles.settingCard}>
            <View style={commonStyles.settingCardRow}>
              <Text style={commonStyles.settingTitle}>Audio volume</Text>
              <Text style={commonStyles.settingValue}>{Math.round(volume * 100)}%</Text>
            </View>
            <VolumeSlider value={volume} onChange={onVolumeChange} />
          </View>

          {/* Account: optional, and only there for saving progressions to the cloud.
              Hidden entirely if the app was built without backend keys.
              This is a proper account button rather than another settings card, since
              it opens a whole screen rather than flipping a value like the two above. */}
          {isAccountAvailable && (
            <Pressable
              onPress={openAccount}
              style={({ pressed }) => [commonStyles.accountButton, pressed && { opacity: 0.85 }]}
            >
              {/* The circle shows the first letter of the email when signed in, so the
                  account is recognisable at a glance, or a person outline when not */}
              <View style={[commonStyles.accountAvatar, isSignedIn && commonStyles.accountAvatarSignedIn]}>
                <Text style={commonStyles.accountAvatarText}>
                  {isSignedIn && accountEmail ? accountEmail[0].toUpperCase() : '👤'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={commonStyles.accountButtonTitle}>
                  {isSignedIn ? 'Account' : 'Sign in'}
                </Text>
                <Text style={commonStyles.accountButtonSubtitle} numberOfLines={1}>
                  {isSignedIn ? accountEmail : 'Optional, for cloud saved progressions'}
                </Text>
              </View>
              {isSignedIn && <View style={commonStyles.signedInDot} />}
              {/* Points to the fact that this opens another screen */}
              <Text style={commonStyles.accountChevron}>{'›'}</Text>
            </Pressable>
          )}

          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
