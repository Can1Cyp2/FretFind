import { ChordAnalysisController } from '../controllers/ChordAnalysisController';
import { FretboardInteractionController } from '../controllers/FretboardInteractionController';
import { ProgressionController } from '../controllers/ProgressionController';
import {
  mockCandidateChord,
  mockFretSelections,
  mockProgression,
} from '../mockData';

// Tiny assertion helper so this deliverable can run without a full test framework.
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

// These are the three controller classes defined for the June 8 skeleton.
const fretboardController = new FretboardInteractionController();
const chordAnalysisController = new ChordAnalysisController();
const progressionController = new ProgressionController();

// Run each controller check separately so the output shows what passed.
testFretboardInteractionController();
testChordAnalysisController();
testProgressionController();

console.log('All basic controller mock tests passed.');

function testFretboardInteractionController(): void {
  // The fretboard controller receives the mock fret positions and returns note names
  fretboardController.selectFrets(mockFretSelections);
  const selectedNotes = fretboardController.getSelectedNotes();

  assert(
    selectedNotes.join('-') === 'C-E-G-C-E',
    'FretboardInteractionController should return the selected mock notes.'
  );

  console.log('FretboardInteractionController test passed.');
}

function testChordAnalysisController(): void {
  // The chord controller receives selected notes and returns the hardcoded C result.
  const selectedNotes = mockFretSelections.map((selection) => selection.note);
  const chordResult = chordAnalysisController.identifyChord(selectedNotes);

  assert(
    chordResult.bestMatch === 'C',
    'ChordAnalysisController should identify the mock notes as C.'
  );
  assert(
    chordResult.quality === 'perfect',
    'ChordAnalysisController should mark the mock C chord as a perfect match.'
  );
  assert(
    chordResult.formula === '1 - 3 - 5',
    'ChordAnalysisController should return the basic C major formula.'
  );

  console.log('ChordAnalysisController test passed.');
}

// The progression controller receives a mock progression and explains one candidate chord
function testProgressionController(): void {
  const progressionResult = progressionController.analyzeProgression(
    mockProgression,
    mockCandidateChord
  );

  assert(
    progressionResult.fits,
    'ProgressionController should say Em fits the mock C - Am - F - G progression.'
  );
  assert(
    progressionResult.reasons.length > 0,
    'ProgressionController should return at least one reason.'
  );
  assert(
    progressionResult.warnings.length > 0,
    'ProgressionController should return at least one warning.'
  );

  console.log('ProgressionController test passed.');
}
