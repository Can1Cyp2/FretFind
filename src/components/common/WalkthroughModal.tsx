/* The in-app walkthrough, opened from the Settings screen.

   Aimed at someone opening FretFind for the first time: it steps through what
   each part of the screen actually does, in plain language, one idea at a
   time, so the workflow (especially building and reusing a progression)
   doesn't have to be worked out by trial and error.

   This is about the app's own features, not music theory, the interval and
   chord explanations already elsewhere in the app cover that side of things.

   Each step gets a small mock-up of the real thing built from plain Views
   rather than a screenshot, so it never goes stale if a screen's colours or
   spacing change later, and it stays a consistent size inside the sheet. */

import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../../styles/colors';
import { commonStyles } from '../../styles/commonStyles';

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Step {
  title: string;
  body: string;
  illustration: React.ReactNode;
}

// A few notes lit up on a mini fretboard, standing in for tapping frets to build a chord
function MiniFretboard() {
  return (
    <View style={styles.fretboardBox}>
      <View style={styles.fretboardStringsRow}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={styles.fretboardStringCol}>
            <View style={styles.fretboardString} />
          </View>
        ))}
      </View>
      <View style={[styles.fretboardFretLine, { top: '38%' }]} />
      <View style={[styles.fretboardFretLine, { top: '74%' }]} />
      <View style={[styles.fretboardDot, { left: '6%', top: '24%' }]}>
        <Text style={styles.fretboardDotText}>E</Text>
      </View>
      <View style={[styles.fretboardDot, { left: '56%', top: '58%' }]}>
        <Text style={styles.fretboardDotText}>G</Text>
      </View>
    </View>
  );
}

// Two result cards, standing in for the Perfect / Partial badges under the fretboard
function MiniResultCards() {
  return (
    <View style={styles.mockStack}>
      <View style={[styles.mockCard, { backgroundColor: COLORS.perfectBg, borderColor: COLORS.perfectBorder }]}>
        <Text style={styles.mockCardTitle}>C</Text>
        <View style={[styles.mockBadge, { backgroundColor: COLORS.perfectBg, borderColor: COLORS.perfectBorder }]}>
          <Text style={[styles.mockBadgeText, { color: COLORS.perfect }]}>Perfect</Text>
        </View>
      </View>
      <View style={[styles.mockCard, { backgroundColor: COLORS.partialBg, borderColor: COLORS.partialBorder }]}>
        <Text style={styles.mockCardTitle}>Em</Text>
        <View style={[styles.mockBadge, { backgroundColor: COLORS.partialBg, borderColor: COLORS.partialBorder }]}>
          <Text style={[styles.mockBadgeText, { color: COLORS.partial }]}>Partial</Text>
        </View>
      </View>
    </View>
  );
}

// Three shape chips with the first one picked, standing in for the Shapes section of a chord's breakdown
function MiniShapes() {
  return (
    <View>
      <View style={styles.mockRow}>
        {['Shape 1', 'Shape 2', 'Shape 3'].map((label, i) => (
          <View key={label} style={[styles.mockChip, i === 0 && styles.mockChipActive]}>
            <Text style={[styles.mockChipText, i === 0 && styles.mockChipTextActive]}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.mockLoadButton}>
        <Text style={styles.mockLoadButtonText}>Load onto fretboard</Text>
      </View>
    </View>
  );
}

// Three numbered pills, standing in for the progression strip above the results
function MiniProgression() {
  return (
    <View style={styles.mockRow}>
      {['C', 'Am', 'F'].map((name, i) => (
        <View key={name} style={styles.mockPill}>
          <Text style={styles.mockPillIndex}>{i + 1}</Text>
          <Text style={styles.mockPillText}>{name}</Text>
          <View style={styles.mockPillClose}>
            <Text style={styles.mockPillCloseText}>{'×'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// A key chip and two of its diatonic chords, standing in for the Chords That Fit sheet
function MiniFitChords() {
  return (
    <View>
      <View style={styles.mockRow}>
        <View style={[styles.mockChip, styles.mockChipActive]}>
          <Text style={[styles.mockChipText, styles.mockChipTextActive]}>C Major</Text>
        </View>
        <View style={styles.mockChip}>
          <Text style={styles.mockChipText}>A Minor</Text>
        </View>
      </View>
      {[{ numeral: 'IV', name: 'F' }, { numeral: 'V', name: 'G' }].map(row => (
        <View key={row.numeral} style={styles.mockNumeralRow}>
          <View style={styles.mockNumeralBadge}>
            <Text style={styles.mockNumeralText}>{row.numeral}</Text>
          </View>
          <Text style={styles.mockNumeralName}>{row.name}</Text>
        </View>
      ))}
    </View>
  );
}

// A saved progression row, standing in for the Progressions sheets saved list
function MiniSaved() {
  return (
    <View style={styles.mockSavedRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.mockSavedName}>Verse Idea</Text>
        <Text style={styles.mockSavedMeta}>4 chords</Text>
      </View>
      <View style={styles.mockCloudIcon}>
        <Text style={styles.mockCloudIconText}>{'☁'}</Text>
      </View>
      <View style={styles.mockLoadPill}>
        <Text style={styles.mockLoadPillText}>Load</Text>
      </View>
    </View>
  );
}

// Two setting rows, standing in for this screen's own display options
function MiniSettingsPreview() {
  return (
    <View>
      <View style={styles.mockToggleRow}>
        <Text style={styles.mockToggleLabel}>Octave labels</Text>
        <View style={[styles.mockSwitchTrack, styles.mockSwitchTrackOn]}>
          <View style={[styles.mockSwitchThumb, styles.mockSwitchThumbOn]} />
        </View>
      </View>
      <View style={styles.mockToggleRow}>
        <Text style={styles.mockToggleLabel}>Note spelling</Text>
        <View style={styles.mockRow}>
          <View style={styles.mockSpellingChip}>
            <Text style={styles.mockSpellingChipText}>C#</Text>
          </View>
          <View style={[styles.mockSpellingChip, styles.mockSpellingChipActive]}>
            <Text style={[styles.mockSpellingChipText, styles.mockSpellingChipTextActive]}>Db</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const STEPS: Step[] = [
  {
    title: 'Welcome to FretFind',
    body:
      'Tap frets on the fretboard to enter notes, exactly like fretting a string on a real guitar. As soon as two or more notes are selected, FretFind works out every chord they could make and lists them below.',
    illustration: <MiniFretboard />,
  },
  {
    title: "See what you're playing",
    body:
      'Every match gets a badge for how well it fits. Perfect means every note lines up, Partial means most of them do. Tap any card to see its full breakdown: notes, formula, and intervals, explained in plain language.',
    illustration: <MiniResultCards />,
  },
  {
    title: 'Explore other ways to play it',
    body:
      "Open a chord's breakdown and scroll to Shapes to see other ways to play the same chord elsewhere on the neck. Tap Load on any shape to put it straight onto the fretboard so it can be seen and strummed.",
    illustration: <MiniShapes />,
  },
  {
    title: 'Build a progression',
    body:
      'Tap the + on a chord card (or Add to Progression in its breakdown) to add it to the progression strip above the results. Tap a pill any time to recall the exact shape that chord was played with, use the arrows to reorder it, and the x to remove it.',
    illustration: <MiniProgression />,
  },
  {
    title: 'Find the next chord',
    body:
      "Once a progression has a couple of chords in it, tap 'See other chords that fit this progression' underneath the strip. FretFind works out the most likely key and lists the other chords built from it, a shortlist worth trying next, alongside the roman numeral each one plays.",
    illustration: <MiniFitChords />,
  },
  {
    title: 'Save your work',
    body:
      'Tap Save in the header for a quick save, or open Progressions to name it properly, rename or delete anything saved, and reload it later. Signing in is optional, and backs progressions up to an account too, so they follow to another device.',
    illustration: <MiniSaved />,
  },
  {
    title: 'Make it your own',
    body:
      'This screen holds the display options: sharps or flats spelling, whether octave numbers show on note labels, and the audio volume. The tuning name above the fretboard opens the tuning picker, including building a custom one.',
    illustration: <MiniSettingsPreview />,
  },
];

export function WalkthroughModal({ visible, onClose }: Props) {
  const [stepIndex, setStepIndex] = useState(0);

  // The width of one page, measured off the sheet itself so every step is exactly
  // as wide as the space it swipes across, whatever the phone's screen size is
  const [pageWidth, setPageWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Every time this sheet is opened fresh, start back at the beginning, and jump
  // the pager there too without the slide animation (this is a fresh open, not someone paging back to the start)
  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      scrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [visible]);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  // Moves both the step shown and the pager together, so the Back / Next buttons
  // and a swipe always agree on what step is current
  const goToStep = (index: number) => {
    setStepIndex(index);
    if (pageWidth > 0) scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
  };

  const handleNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    goToStep(stepIndex + 1);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setPageWidth(event.nativeEvent.layout.width);
  };

  // Fires once a swipe settles on a page, so the step counter, title and dots catch
  // up with wherever the finger left it
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* The dark backdrop sits behind the sheet rather than wrapped around it, the
          same reasoning as the other list sheets: closing on an outside tap should
          never fight with scrolling the step text */}
      <View style={commonStyles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[commonStyles.modalContent, { maxHeight: '85%' }]}>
          <View style={commonStyles.modalHandle} />
          <View style={commonStyles.modalHeader}>
            <Text style={commonStyles.modalTitle}>How FretFind Works</Text>
            <Pressable onPress={onClose} style={commonStyles.modalCloseButton}>
              <Text style={commonStyles.modalCloseText}>{'✕'}</Text>
            </Pressable>
          </View>

          {/* One vertical scroll for the sheet, with the steps sitting side by side
              inside it, so swiping sideways moves between them and anything too tall
              for the screen still scrolls up and down the ordinary way.

              The pages themselves are plain views on purpose. A scroll view needs a
              known height to work, and nested in here there is nothing to give it
              one, which left the steps either cut off or refusing to scroll at all.
              Letting the outer scroll handle the up and down, and each page just be
              as tall as its own content, avoids the problem entirely */}

          {/* flexShrink: the dots and the buttons below are siblings of this, and without it 
          this view insists on its full content height and simply overflows the sheet instead of scrolling, 
          which reads as the page being stuck rather than as there being more to see. */}
          <ScrollView style={{ flexShrink: 1 }} showsVerticalScrollIndicator={false}>
            <View onLayout={handleLayout}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleMomentumScrollEnd}
              >
                {/* Held back until the width has actually been measured, so the
                    pages are never laid out at zero width first and reflowed after */}
                {pageWidth > 0 &&
                  STEPS.map((s, i) => (
                    <View key={s.title} style={{ width: pageWidth }}>
                      <Text style={styles.stepCounter}>
                        STEP {i + 1} OF {STEPS.length}
                      </Text>
                      {s.illustration}
                      <Text style={styles.stepTitle}>{s.title}</Text>
                      <Text style={styles.stepBody}>{s.body}</Text>
                      <View style={{ height: 12 }} />
                    </View>
                  ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* One dot per step lights up to show progress, the same idea as the page dots on a phones home screen */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === stepIndex && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.navRow}>
            <Pressable
              onPress={() => goToStep(Math.max(0, stepIndex - 1))}
              disabled={isFirst}
              style={[styles.navButton, isFirst && styles.navButtonDisabled]}
            >
              <Text style={[styles.navButtonText, isFirst && styles.navButtonTextDisabled]}>Back</Text>
            </Pressable>
            <Pressable onPress={handleNext} style={[styles.navButton, styles.navButtonPrimary]}>
              <Text style={styles.navButtonPrimaryText}>{isLast ? 'Done' : 'Next'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  stepCounter: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 16,
    marginBottom: 8,
  },
  stepBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  // The little fretboard mock-up on the welcome step:
  fretboardBox: {
    height: 110,
    borderRadius: 12,
    backgroundColor: COLORS.fretboardBg,
    borderWidth: 1,
    borderColor: COLORS.fretboardEdge,
    overflow: 'hidden',
  },
  fretboardStringsRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  fretboardStringCol: {
    flex: 1,
    alignItems: 'center',
  },
  fretboardString: {
    width: 2,
    height: '100%',
    backgroundColor: COLORS.stringColor,
  },
  fretboardFretLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.fretWire,
  },
  fretboardDot: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fretboardDotText: {
    color: COLORS.textOnAccent,
    fontSize: 11,
    fontWeight: '800',
  },

  // Shared row and chip pieces reused by a few of the mock-ups above
  mockRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mockStack: {
    gap: 8,
  },
  mockChip: {
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mockChipActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  mockChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  mockChipTextActive: {
    color: COLORS.accentLight,
  },

  // The two result cards on the second step
  mockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mockCardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  mockBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // The 'Load onto fretboard' button under the shape chips
  mockLoadButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mockLoadButtonText: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: '700',
  },

  // The progression pills on the fourth step
  mockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentDim,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 6,
  },
  mockPillIndex: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginRight: 6,
  },
  mockPillText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  mockPillClose: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockPillCloseText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '600',
  },

  // The roman numeral rows on the Chords That Fit step
  mockNumeralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  mockNumeralBadge: {
    width: 32,
  },
  mockNumeralText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '800',
  },
  mockNumeralName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },

  // The saved progression row on the sixth step
  mockSavedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  mockSavedName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  mockSavedMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  mockCloudIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.accentDim,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  mockCloudIconText: {
    color: COLORS.accentLight,
    fontSize: 13,
  },
  mockLoadPill: {
    backgroundColor: COLORS.accentDim,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mockLoadPillText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },

  // The two setting rows on the last step
  mockToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgElevated,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  mockToggleLabel: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  mockSwitchTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    padding: 3,
    backgroundColor: COLORS.bgHover,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'center',
  },
  mockSwitchTrackOn: {
    backgroundColor: COLORS.perfectBg,
    borderColor: COLORS.perfectBorder,
  },
  mockSwitchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.textMuted,
    alignSelf: 'flex-start',
  },
  mockSwitchThumbOn: {
    backgroundColor: COLORS.perfect,
    alignSelf: 'flex-end',
  },
  mockSpellingChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    backgroundColor: COLORS.bgHover,
  },
  mockSpellingChipActive: {
    backgroundColor: COLORS.accentDim,
    borderColor: COLORS.accent,
  },
  mockSpellingChipText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  mockSpellingChipTextActive: {
    color: COLORS.accentLight,
  },

  // Progress dots and the Back / Next row at the bottom of the sheet
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.borderLight,
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.accent,
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  navButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  navButtonPrimary: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  navButtonPrimaryText: {
    color: COLORS.textOnAccent,
    fontSize: 14,
    fontWeight: '700',
  },
});
