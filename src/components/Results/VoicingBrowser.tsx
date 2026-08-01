/* The Voicings section inside the chord info popup.

   It shows one shape at a time, users can scroll to see more, ordered so the
   shape a player is most likely to already know comes first (most common voicings). The button underneath
   puts that shape straight onto the fretboard, so its not just informative. Once there it can be heard, strummed, and added to a
   progression like anything else the user played/added themselves.

   The shapes are worked out for whatever tuning is currently selected, so this stays
   correct after the user changes tuning instead of showing shapes that no longer
   make that chord */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChordType, ChordVoicing, PitchClass, Tuning } from '../../types';
import { COLORS } from '../../styles/colors';
import { generateVoicings } from '../../engine/voicingGenerator';
import { VoicingDiagram } from './VoicingDiagram';

interface Props {
  rootPitchClass: PitchClass;
  chordType: ChordType;
  tuning: Tuning;
  onLoadVoicing: (voicing: ChordVoicing) => void;
  /* Tells the sheet above which shape is on screen right now. 
     That sheet can add this chord to the progression, and for a suggested chord the shape being looked
     at is the only shape there is to save, nothing was played on the fretboard for it. 
     Without this it had no way of knowing which of the eight was showing, which is needed to add to the progression */
  onVoicingChange?: (voicing: ChordVoicing | null) => void;
}

export function VoicingBrowser({
  rootPitchClass,
  chordType,
  tuning,
  onLoadVoicing,
  onVoicingChange,
}: Props) {
  // Working the shapes out takes a moment, so it only happens when the chord or the
  // tuning actually changes rather than on every render of the sheet
  const voicings = useMemo(
    () => generateVoicings(rootPitchClass, chordType, tuning),
    [rootPitchClass, chordType, tuning],
  );

  const [index, setIndex] = useState(0);

  /* The pager is a horizontal scroll view that snaps a shape at a time, so the shapes
     can be swiped through the way the rest of the apps horizontal strips work. 
     It needs to know how wide one page is to snap correctly, and that is only known once
     it has been laid out, the width is measured not assumed */
  const [pageWidth, setPageWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setPageWidth(event.nativeEvent.layout.width);
  }, []);

  // Back to the first (most common) shape whenever a different chord is opened:
  useEffect(() => {
    setIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [rootPitchClass, chordType, tuning]);

  // Which shape ended up under the finger once the swipe settles:
  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth <= 0) return;
      setIndex(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
    },
    [pageWidth],
  );

  // The arrows stay alongside the swiping, since a swipe is not obvious on its own
  const goTo = useCallback(
    (next: number) => {
      setIndex(next);
      scrollRef.current?.scrollTo({ x: next * pageWidth, animated: true });
    },
    [pageWidth],
  );

  /* The shape on screen right now. Worked out before the empty case below bails
     out, so the hook underneath it still runs every render the way hooks have to. */
  const current = voicings.length > 0 ? voicings[Math.min(index, voicings.length - 1)] : null;

  // Keep whoever is showing this section told which shape is being looked at
  useEffect(() => {
    onVoicingChange?.(current);
  }, [current, onVoicingChange]);

  if (voicings.length === 0 || !current) {
    return (
      <Text style={styles.emptyText}>
        No playable shape for this chord fits on the fretboard in this tuning.
      </Text>
    );
  }

  return (
    <View>
      <View style={styles.pager}>
        <Pressable
          onPress={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
          style={[styles.arrow, index === 0 && styles.arrowDisabled]}
          hitSlop={8}
        >
          <Text style={[styles.arrowText, index === 0 && styles.arrowTextDisabled]}>{'‹'}</Text>
        </Pressable>

        <View style={styles.diagramArea} onLayout={handleLayout}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            // Keeps a slightly diagonal swipe from being read as a vertical one and fighting the sheets own scrolling
            directionalLockEnabled
            nestedScrollEnabled
            onMomentumScrollEnd={handleScrollEnd}
          >
            {/* Only the shape being looked at and its immediate neighbours are actually
                drawn. A diagram is a few dozen views once the strings, frets and dots
                are counted, so building all eight up front was a visible pause when the
                sheet opened. The others keep their space in the row so the paging still
                lands in the right place, they just stay empty until swiped near.
                
                I havent found an issue with this on any tested devices (at least yet) */}
            {voicings.map((voicing, i) => (
              <View key={i} style={{ width: pageWidth, alignItems: 'center' }}>
                {Math.abs(i - index) <= 1 && (
                  <VoicingDiagram selections={voicing.selections} />
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <Pressable
          onPress={() => goTo(Math.min(voicings.length - 1, index + 1))}
          disabled={index >= voicings.length - 1}
          style={[styles.arrow, index >= voicings.length - 1 && styles.arrowDisabled]}
          hitSlop={8}
        >
          <Text
            style={[styles.arrowText, index >= voicings.length - 1 && styles.arrowTextDisabled]}
          >
            {'›'}
          </Text>
        </Pressable>
      </View>

      {/* Which shape of how many, and what it actually takes to play: how many fingers
          it needs and whether one of them has to lie flat across the strings. That is
          the part that decides whether someone can use this shape or not, it tests if it is realistically possible to play:
          
          This code is a little bit convoluted, but it works for the most part, I have not found an issue yet, and I did not want
          to spend too much time on it as it is not the most important part of the app, so I coded it logically rather than optimally for now*/}
      <Text style={styles.caption}>
        Shape {index + 1} of {voicings.length}
        {index === 0 ? '  ·  most common' : ''}
      </Text>
      <Text style={styles.difficulty}>
        {current.fingers === 0
          ? 'All open strings, no fingers needed'
          : `${current.fingers} finger${current.fingers === 1 ? '' : 's'}`}
        {current.hasBarre ? '  ·  barre' : ''}
        {current.hasOpenStrings && current.fingers > 0 ? '  ·  has open strings' : ''}
        {!current.isRootInBass ? '  ·  starts on a different note' : ''}
      </Text>

      {/* dots to make it obvious there is more than one shape to look at */}
      <View style={styles.dotsRow}>
        {voicings.map((_, i) => (
          <View key={i} style={[styles.pageDot, i === index && styles.pageDotActive]} />
        ))}
      </View>

      <Pressable
        onPress={() => onLoadVoicing(current)}
        style={({ pressed }) => [styles.loadButton, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.loadButtonText}>Load This Shape onto the Fretboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  diagramArea: {
    flex: 1,
    alignItems: 'center',
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.bgHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowDisabled: {
    backgroundColor: 'transparent',
  },
  arrowText: {
    color: COLORS.accentLight,
    fontSize: 22,
    fontWeight: '800',
    marginTop: -2,
  },
  arrowTextDisabled: {
    color: COLORS.textMuted,
  },
  caption: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  difficulty: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.bgHover,
  },
  pageDotActive: {
    backgroundColor: COLORS.accent,
  },
  loadButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
    alignItems: 'center',
  },
  loadButtonText: {
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
