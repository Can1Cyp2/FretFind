/* A simple volume slider: a track with a filled portion and a round thumb that the
   user drags, or taps to jump to. It is built with PanResponder rather than a native
   slider so it needs no extra library and behaves the same on both platforms, the
   same approach the results panel uses for its drag handle.

   The value runs from 0 (silent) to 1 (full). The parent owns the value and is told
   about changes through onChange, so the slider itself holds no state except the
   track position it measures on layout.

   The touch position is read as an absolute screen coordinate (pageX) and turned
   into a value against the track's measured screen position. An earlier version used
   the touch's position within the element, but that is measured against whatever the
   finger is over, so once the finger crossed onto the thumb the reading was suddenly
   relative to the thumb and the value jumped to the ends, the thumb 'teleported'. The
   absolute position does not have that problem, since it never changes what it is
   measured against. */

import React, { useRef, useState } from 'react';
import { View, PanResponder, LayoutChangeEvent, GestureResponderEvent } from 'react-native';
import { COLORS } from '../../styles/colors';

interface Props {
  value: number;              // 0 to 1
  onChange: (value: number) => void;
}

const THUMB_SIZE = 22;
const TRACK_HEIGHT = 6;

export function VolumeSlider({ value, onChange }: Props) {
  // The track's width, so the filled portion and thumb can be positioned
  const [trackWidth, setTrackWidth] = useState(0);
  // The track's left edge and width in absolute screen coordinates, measured on
  // layout, so an absolute touch position can be turned into a 0 to 1 value
  const bounds = useRef({ left: 0, width: 0 });
  const containerRef = useRef<View>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
    // measureInWindow gives the position on the whole screen, which is what pageX
    // in the touch events is measured against too
    containerRef.current?.measureInWindow((x, _y, width) => {
      bounds.current = { left: x, width };
    });
  };

  // Turns an absolute screen x into a value, kept inside 0 to 1
  const valueFromPageX = (pageX: number): number => {
    const { left, width } = bounds.current;
    if (width <= 0) return 0;
    return Math.max(0, Math.min(1, (pageX - left) / width));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Claim the gesture even as it moves, so the parent sheet cannot steal it
      onMoveShouldSetPanResponderCapture: () => true,
      // A tap jumps the thumb straight to where the finger landed
      onPanResponderGrant: (event: GestureResponderEvent) => {
        onChange(valueFromPageX(event.nativeEvent.pageX));
      },
      // Dragging updates continuously as the finger moves along the track
      onPanResponderMove: (event: GestureResponderEvent) => {
        onChange(valueFromPageX(event.nativeEvent.pageX));
      },
    }),
  ).current;

  const filledWidth = trackWidth * value;

  return (
    // A tall, padded hit area so the thin track is easy to grab, with the visible
    // track centered inside it
    <View
      ref={containerRef}
      onLayout={handleLayout}
      style={{ height: THUMB_SIZE + 12, justifyContent: 'center' }}
      {...panResponder.panHandlers}
    >
      {/* The unfilled track */}
      <View
        style={{
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: COLORS.bgHover,
        }}
      />
      {/* The filled portion, from the left up to the current value */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          width: filledWidth,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: COLORS.accent,
        }}
      />
      {/* The thumb, centered on the current value (pulled left by half its size so
          it sits on the point rather than starting from it) */}
      <View
        style={{
          position: 'absolute',
          left: Math.max(0, Math.min(trackWidth - THUMB_SIZE, filledWidth - THUMB_SIZE / 2)),
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: COLORS.accentLight,
          borderWidth: 2,
          borderColor: COLORS.bg,
        }}
      />
    </View>
  );
}
