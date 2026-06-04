import type { FretSelection } from '../mockData';

export class FretboardInteractionController {
  private selectedFrets: FretSelection[] = [];

  selectFrets(selections: FretSelection[]): FretSelection[] {
    this.selectedFrets = selections;
    return this.selectedFrets;
  }

  getSelectedNotes(): string[] {
    return this.selectedFrets.map((selection) => selection.note);
  }
}
