/* Chord matches under the fretboard in a panel: 
   Updates in real time as the user taps notes. With fewer than two notes it shows a short hint to click more notes, 
   otherwise it lists the matching chords from best to worst, with a small count of how many of
   them are perfect matches. The panel height is adjustable by dragging the handle
   at the top resizes it, so the user can give more room to the results or to the
   fretboard, and on release it snaps to a small, medium, or large size

   This is also helpful for different screen sizes

   Tapping a result opens the music theory breakdown for that chord */

import React, { useCallback, useRef, useState } from 'react';
import { View, Text, FlatList, PanResponder, Dimensions } from 'react-native';
import { ChordMatch } from '../../types';
import { ChordResultCard } from './ChordResultCard';
import { ChordDetailModal } from './ChordDetailModal';
import { resultStyles } from '../../styles/resultStyles';

// The three sizes the panel snaps to: small (just a peek at the results),
// medium (the default), and large (over half the screen, but the fretboard stays usable)
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_HEIGHT = 120;
const MED_HEIGHT = 300;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.55;
const DEFAULT_HEIGHT = MED_HEIGHT;
const SNAP_POINTS = [MIN_HEIGHT, MED_HEIGHT, MAX_HEIGHT];

// Tracking the drag of the results panel to adjust accordingly: how far a finger moves before it counts as a drag instead of a tap, 
// how small a drag falls back to where it started, and how close to the middle size a
// release has to be for the panel to settle there.
const DRAG_START_THRESHOLD = 10;
const SNAP_DEADZONE = 20;
const MID_LOCK_ZONE = 44;
// These are set based on my own testing on a Samsung S20

interface Props {
  matches: ChordMatch[];
  activeCount: number;   // how many notes are currently selected on the fretboard
  preferFlats?: boolean;
}

export function ResultsPanel({ matches, activeCount, preferFlats }: Props) {
  const perfectCount = matches.filter(m => m.matchQuality === 'perfect').length;

  // The chord the user tapped to read about (null when the theory breakdown is closed)
  const [selectedMatch, setSelectedMatch] = useState<ChordMatch | null>(null);

  // The panel's current height, plus two refs the drag callbacks read from:
  // the height the drag started at and the snap size the panel last settled on.

  // They are refs (not state) because PanResponder keeps the callbacks it was
  // created with, because plain state would go stale inside them.
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);
  const dragStartHeight = useRef(DEFAULT_HEIGHT);
  const settledHeight = useRef(DEFAULT_HEIGHT);

  // Keep the height inside the allowed range while dragging:
  const clampHeight = useCallback((value: number) => {
    return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, value));
  }, []);

  // Which of the three snap sizes is closest to where the drag ended:
  const getNearestSnap = useCallback((height: number) => {
    let nearest = SNAP_POINTS[0];
    let minDist = Math.abs(height - SNAP_POINTS[0]);
    for (const point of SNAP_POINTS) {
      const dist = Math.abs(height - point);
      if (dist < minDist) {
        minDist = dist;
        nearest = point;
      }
    }
    return nearest;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      // Only claim the gesture once the finger is clearly moving vertically,
      // so ordinary taps and sideways swipes still work properly
      // (This was a bug I faced so I found this format works)
      onMoveShouldSetPanResponder: (_, g) => {
        const verticalIntent = Math.abs(g.dy) > Math.abs(g.dx) * 1.3;
        return verticalIntent && Math.abs(g.dy) > DRAG_START_THRESHOLD;
      },
      onMoveShouldSetPanResponderCapture: (_, g) => {
        const verticalIntent = Math.abs(g.dy) > Math.abs(g.dx) * 1.3;
        return verticalIntent && Math.abs(g.dy) > DRAG_START_THRESHOLD;
      },

      // The panel always rests on a snap size, so that is where a new drag starts from
      onPanResponderGrant: () => {
        dragStartHeight.current = settledHeight.current;
      },

      // Dragging up (negative dy) makes the panel taller, dragging down makes it shorter
      onPanResponderMove: (_, g) => {
        setPanelHeight(clampHeight(dragStartHeight.current - g.dy));
      },
      onPanResponderRelease: (_, g) => {
        const currentHeight = clampHeight(dragStartHeight.current - g.dy);
        const distanceMoved = Math.abs(currentHeight - dragStartHeight.current);

        // A tiny, slow drag counts as no move at all: settle back where the panel was
        if (distanceMoved < SNAP_DEADZONE && Math.abs(g.vy) < 0.25) {
          setPanelHeight(settledHeight.current);
          return;
        }

        // Released near the middle size with no real speed: settle on the middle
        if (Math.abs(currentHeight - MED_HEIGHT) <= MID_LOCK_ZONE && Math.abs(g.vy) < 0.5) {
          setPanelHeight(MED_HEIGHT);
          settledHeight.current = MED_HEIGHT;
          return;
        }

        // Fast flick up: fully expand
        if (g.vy < -0.55) {
          setPanelHeight(MAX_HEIGHT);
          settledHeight.current = MAX_HEIGHT;

        // Fast flick down: fully collapse
        } else if (g.vy > 0.55) {
          setPanelHeight(MIN_HEIGHT);
          settledHeight.current = MIN_HEIGHT;

        // Slow drag: snap to whichever of the three sizes is closest
        } else {
          const nearest = getNearestSnap(currentHeight);
          setPanelHeight(nearest);
          settledHeight.current = nearest;
        }
      },
    }),
  ).current;

  return (
    <View style={[resultStyles.container, { height: panelHeight }]}>
      {/* The drag handle: 
          The little arrow hints which way there is room to go. */}
      <View style={resultStyles.dragHandleRow} {...panResponder.panHandlers}>
        <View style={resultStyles.dragHandleBar} />
        <Text style={resultStyles.dragHandleHint}>
          {panelHeight <= MIN_HEIGHT ? '▲' : '▼'}
        </Text>
      </View>

      {activeCount < 2 ? (
        // Fewer than two notes is not a chord yet, so show a hint instead of results:
        <Text style={resultStyles.emptyText}>
          Tap at least 2 notes on the fretboard to find matching chords
        </Text>
      ) : matches.length === 0 ? (
        // Two or more notes, but nothing in the chord table fits them
        <Text style={resultStyles.emptyText}>No matching chords found</Text>
      ) : (
        <>
          <View style={resultStyles.header}>
            <Text style={resultStyles.title}>Results</Text>
            <Text style={resultStyles.count}>
              {perfectCount > 0 ? `${perfectCount} perfect · ` : ''}{matches.length} total
            </Text>
          </View>
          <FlatList
            data={matches}
            keyExtractor={(item, index) => `${item.fullName}-${index}`}
            renderItem={({ item }) => (
              <ChordResultCard
                match={item}
                preferFlats={preferFlats}
                onPress={() => setSelectedMatch(item)}
              />
            )}
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        </>
      )}

      {/* The music theory breakdown for the tapped chord (its own sheet over the app) */}
      <ChordDetailModal
        match={selectedMatch}
        visible={selectedMatch !== null}
        onClose={() => setSelectedMatch(null)}
        preferFlats={preferFlats}
      />
    </View>
  );
}
