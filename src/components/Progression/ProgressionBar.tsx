/* The progression strip between the fretboard and the results.

It shows the chords the user has collected as a horizontal row of pills with a count and a
Clear button, and hides itself completely while the progression is empty so it
takes no space until it is actually being used. The pills scroll sideways when there are more than fit on screen. */

import React from 'react';
import { Alert, View, Text, ScrollView, Pressable } from 'react-native';
import { ProgressionChord } from '../../types';
import { ProgressionChordPill } from './ProgressionChordPill';
import { progressionStyles } from '../../styles/progressionStyles';

interface Props {
  progression: ProgressionChord[];
  maxLength: number;                    // shown in the count, for example 3/12, # of chords in the progression
  preferFlats?: boolean;
  onPillPress: (chord: ProgressionChord) => void; // recalls that chords shape onto the fretboard
  onRemove: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onClear: () => void;
  onShowFitChords: () => void;          // opens the 'chords that fit' view
}

export function ProgressionBar({
  progression,
  maxLength,
  preferFlats,
  onPillPress,
  onRemove,
  onReorder,
  onClear,
  onShowFitChords,
}: Props) {

  // if no progression, no strip: the screen stays exactly as it was before this feature
  if (progression.length === 0) return null;

  // Clearing throws away the whole strip in one tap, so check before doing it:
  const handleClear = () => {
    Alert.alert('Clear Progression', 'Are you sure? This removes every chord from the progression.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: onClear },
    ]);
  };

  return (
    <View style={progressionStyles.container}>
      <View style={progressionStyles.header}>
        <Text style={progressionStyles.label}>
          Progression ({progression.length}/{maxLength})
        </Text>
        <Pressable onPress={handleClear} style={progressionStyles.clearButton}>
          <Text style={progressionStyles.clearButtonText}>Clear</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={progressionStyles.scrollContent}
      >
        {progression.map((chord, i) => (
          <ProgressionChordPill
            key={chord.id}
            chord={chord}
            index={i}
            preferFlats={preferFlats}
            onPress={() => onPillPress(chord)}
            onRemove={() => onRemove(chord.id)}
            onMoveLeft={i > 0 ? () => onReorder(i, i - 1) : undefined}
            onMoveRight={i < progression.length - 1 ? () => onReorder(i, i + 1) : undefined}
          />
        ))}
      </ScrollView>

      {/* Opens the 'chords that fit' view: other chords in the same key as the progression */}
      <Pressable onPress={onShowFitChords} style={progressionStyles.fitButton}>
        <Text style={progressionStyles.fitButtonText}>
          See other chords that fit this progression
        </Text>
      </Pressable>
    </View>
  );
}
