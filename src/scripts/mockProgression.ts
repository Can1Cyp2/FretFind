import { ChordAnalysisController } from '../controllers/ChordAnalysisController';
import { FretboardInteractionController } from '../controllers/FretboardInteractionController';
import { ProgressionController } from '../controllers/ProgressionController';
import {
  mockCandidateChord,
  mockFretSelections,
  mockProgression,
} from '../mockData';

const fretboardController = new FretboardInteractionController();
const chordAnalysisController = new ChordAnalysisController();
const progressionController = new ProgressionController();

fretboardController.selectFrets(mockFretSelections);

const selectedNotes = fretboardController.getSelectedNotes();
const chordResult = chordAnalysisController.identifyChord(selectedNotes);
const progressionResult = progressionController.analyzeProgression(
  mockProgression,
  mockCandidateChord
);

// console log to show the results of the mock analysis when running this script:
console.log('FretFind May 27 - June 8 Mock Result');
console.log('');
console.log(`Selected notes: ${chordResult.selectedNotes.join(' - ')}`);
console.log(`Best match: ${chordResult.bestMatch}`);
console.log(`Quality: ${chordResult.quality}`);
console.log(`Formula: ${chordResult.formula}`);
console.log(`Explanation: ${chordResult.explanation}`);
console.log('');
console.log(`Progression: ${progressionResult.progression.join(' - ')}`);
console.log(`Candidate chord: ${progressionResult.candidateChord}`);
console.log(`Fits: ${progressionResult.fits ? 'yes' : 'no'}`);
console.log(`Summary: ${progressionResult.summary}`);
console.log('Reasons:');
progressionResult.reasons.forEach((reason) => console.log(`- ${reason}`));
console.log('Warnings:');
progressionResult.warnings.forEach((warning) => console.log(`- ${warning}`));
