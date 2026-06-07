import type { ProgressionAnalysisResult } from '../mockData';

export class ProgressionController {
  analyzeProgression(
    progression: string[],
    candidateChord: string
  ): ProgressionAnalysisResult {
    // This is intentionally hardcoded for the first deliverable proof:

    // The progression controller receives a mock progression and explains one candidate chord
    const fitsMockProgression =
      progression.join('-') === 'C-Am-F-G' && candidateChord === 'Em';

    return {
      progression,
      candidateChord,
      fits: fitsMockProgression,
      summary: fitsMockProgression
        ? 'Em can work inside this C major progression.'
        : 'This skeleton only explains Em against C - Am - F - G.',
      reasons: fitsMockProgression
        ? [
            'Em belongs naturally to the C major key area.',
            'Em shares E and G with C.',
            'Shared tones can make chord movement sound smoother.',
          ]
        : [],
      warnings: [
        'This is hardcoded mock logic for the first project skeleton only.',
      ],
    };
  }
}
