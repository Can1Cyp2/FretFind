import React, { memo } from 'react';
import { View } from 'react-native';
import { FretMarker } from './FretMarker';
import {
  fretboardStyles,
  STRING_SPACING,
  STRING_LEFT_PAD,
  FRET_ROW_HEIGHT,
  NUT_ROW_HEIGHT,
  FRETBOARD_CONTENT_WIDTH,
  FRET_WIRE_HEIGHT,
  NUT_WIRE_HEIGHT,
} from '../../styles/fretboardStyles';
import { COLORS } from '../../styles/colors';
import { FretSelection, PitchClass, StringIndex } from '../../types';
import { getPitchClassAtFret, pitchClassToName } from '../../engine/noteUtils';

interface Props {
  fret: number;
  isNut?: boolean;
  openNotes: PitchClass[];
  selections: (FretSelection | null)[];
  onFretPress: (stringIndex: StringIndex, fret: number) => void;
  baseMidi?: number[];
  showOctaves?: boolean;
  preferFlats?: boolean;
}

const SINGLE_DOT_FRETS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_DOT_FRETS = new Set([12]);
const INLAY_SIZE = 8;

// Left to right: low E (0) on left, high E (5) on right of fretboard (6 strings)
const STRING_RENDER_ORDER: StringIndex[] = [0, 1, 2, 3, 4, 5];

// Subtle wood grain pattern ratios: vary by fret so the wood looks natural
const GRAIN_RATIOS = [0.1, 0.22, 0.38, 0.55, 0.7, 0.85, 0.95];

function FretRowComponent({ fret, isNut, openNotes, selections, onFretPress, baseMidi, showOctaves, preferFlats }: Props) {
  const rowHeight = isNut ? NUT_ROW_HEIGHT : FRET_ROW_HEIGHT;

  return (
    <View style={isNut ? fretboardStyles.nutRow : fretboardStyles.fretRow}>
      {/* dark to light gradient overlay for depth on fretboard */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: rowHeight * 0.35,
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: isNut ? NUT_WIRE_HEIGHT : FRET_WIRE_HEIGHT,
          height: rowHeight * 0.25,
          backgroundColor: 'rgba(255, 200, 120, 0.02)',
        }}
      />

      {/* Wood grain texture has thin uneven lines (wood grain like a guitar) */}
      {GRAIN_RATIOS.map((ratio, i) => {
        const y = ratio * rowHeight + ((fret * 11 + i * 17) % 7 - 3);
        const isLight = (fret + i) % 4 < 2;
        return (
          <View
            key={`g${i}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: Math.max(0, Math.min(y, rowHeight - 2)),
              height: (fret * 3 + i * 5) % 3 === 0 ? 1 : 0.5,
              backgroundColor: isLight
                ? 'rgba(160, 110, 55, 0.06)'
                : 'rgba(0, 0, 0, 0.05)',
            }}
          />
        );
      })}

      {/* Edge shadow: darkens the left and right edges (makes the board look rounded) */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
        }}
      />

      {/* 3D Fret wire / Nut */}
      {isNut ? (
        <View style={fretboardStyles.nutWire}>
          {/* Nut highlight stripe */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 1,
              height: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
            }}
          />
        </View>
      ) : (
        <View style={fretboardStyles.fretWire}>
          {/* Crown highlight for metallic 3D look */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
          />
        </View>
      )}

      {/* Textured string lines with realistic gauge (visually like a real guitar, some strings are thicker than others) */}
      {STRING_RENDER_ORDER.map((si, visualIdx) => {
        const isWound = si <= 2; // Low E, A, D are wound (wrapped wire, thicker); G, B, high E are plain wire
        const thickness = isWound
          ? 3.0 + (2 - si) * 0.6  // thicker wound strings
          : 1.2 + (5 - si) * 0.25; // thinner plain strings
        const x = STRING_LEFT_PAD + visualIdx * STRING_SPACING;
        const totalWidth = thickness + 1.5;
        return (
          <View
            key={`s${si}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: isNut ? NUT_WIRE_HEIGHT : FRET_WIRE_HEIGHT,
              left: x - totalWidth / 2,
              width: totalWidth,
            }}
          >
            {/* String shadow */}
            <View style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: -0.5,
              width: totalWidth + 1,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: totalWidth,
            }} />
            {/* dark edge: gives the string a rounded 3D look */}
            <View style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: totalWidth,
              backgroundColor: isWound
                ? 'rgba(80, 55, 15, 0.45)'
                : 'rgba(100, 100, 115, 0.3)',
              borderRadius: totalWidth / 2,
            }} />
            {/* Main string body */}
            <View style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0.75,
              width: thickness,
              backgroundColor: isWound
                ? 'rgba(195, 160, 75, 0.9)'
                : 'rgba(210, 215, 225, 0.88)',
              borderRadius: thickness / 2,
            }} />

            {/* A bright shine running along the string */}
            <View style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: thickness * 0.28 + 0.75,
              width: Math.max(0.5, thickness * 0.18),
              backgroundColor: isWound
                ? 'rgba(255, 220, 130, 0.5)'
                : 'rgba(255, 255, 255, 0.55)',
            }} />
          </View>
        );
      })}

      {/* ROUNDED inlay dots */}
      {SINGLE_DOT_FRETS.has(fret) && (
        <View
          style={{
            position: 'absolute',
            left: FRETBOARD_CONTENT_WIDTH / 2 - INLAY_SIZE / 2,
            top: (rowHeight - INLAY_SIZE) / 2 - (isNut ? 0 : FRET_WIRE_HEIGHT / 2),
          }}
        >
          <View style={fretboardStyles.inlayDot}>
            <View style={fretboardStyles.inlayDotInner} />
          </View>
        </View>
      )}
      {DOUBLE_DOT_FRETS.has(fret) && (
        <>
          <View
            style={{
              position: 'absolute',
              left: STRING_LEFT_PAD + STRING_SPACING * 0.8,
              top: (rowHeight - INLAY_SIZE) / 2 - FRET_WIRE_HEIGHT / 2,
            }}
          >
            <View style={fretboardStyles.inlayDot}>
              <View style={fretboardStyles.inlayDotInner} />
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              left: STRING_LEFT_PAD + STRING_SPACING * 3.2,
              top: (rowHeight - INLAY_SIZE) / 2 - FRET_WIRE_HEIGHT / 2,
            }}
          >
            <View style={fretboardStyles.inlayDot}>
              <View style={fretboardStyles.inlayDotInner} />
            </View>
          </View>
        </>
      )}

      {/* Tappable markers at each string */}
      {STRING_RENDER_ORDER.map((si, visualIdx) => {
        const pc = getPitchClassAtFret(openNotes[si], fret);
        const isSelected = selections[si]?.fret === fret;
        const noteName = pitchClassToName(pc, preferFlats);
        const octave = baseMidi ? Math.floor((baseMidi[si] + fret) / 12) - 1 : undefined;
        const x = STRING_LEFT_PAD + visualIdx * STRING_SPACING - STRING_SPACING / 2;

        return (
          <View
            key={`m${si}`}
            style={[
              fretboardStyles.tapArea,
              isNut && fretboardStyles.tapAreaNut,
              { left: x },
            ]}
          >
            <FretMarker
              isSelected={isSelected}
              noteName={noteName}
              octave={octave}
              showOctaves={showOctaves}
              onPress={() => onFretPress(si, fret)}
            />
          </View>
        );
      })}
    </View>
  );
}

// Only redraws a row when something it actually shows has changed:
// The selections array is a ref on every tap, which would normally force every one of
// the 23 rows (each with wood grain, strings, and shadows, etc.) to redraw for a single tap. 
// A given row only cares whether one of ITS six markers flipped, so this check lets every other row skip re-rendering.
// Ultimately minimizing lag and freeizing
function fretRowPropsAreEqual(prev: Props, next: Props): boolean {
  if (
    prev.fret !== next.fret ||
    prev.isNut !== next.isNut ||
    prev.showOctaves !== next.showOctaves ||
    prev.preferFlats !== next.preferFlats ||
    prev.openNotes !== next.openNotes ||
    prev.baseMidi !== next.baseMidi ||
    prev.onFretPress !== next.onFretPress
  ) {
    return false;
  }
  // did any string's marker on this exact fret appear or disappear?:
  for (let i = 0; i < next.selections.length; i++) {
    const wasSelectedHere = prev.selections[i]?.fret === prev.fret;
    const isSelectedHere = next.selections[i]?.fret === next.fret;
    if (wasSelectedHere !== isSelectedHere) return false;
  }
  return true;
}

export const FretRow = memo(FretRowComponent, fretRowPropsAreEqual);
