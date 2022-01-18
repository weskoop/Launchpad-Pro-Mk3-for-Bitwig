/**
 * LaunchPad Pro Mk3 for Bitwig
 * 
 * by slow wild (inspo/code bits from fannon, respect. https://github.com/Fannon/)
 *
 * This file is part of the LaunchPad Pro Mk3 for Bitwig distribution (https://github.com/weskoop/LaunchPad-Pro-Mk3-for-Bitwig).
 * 
 * This program is free software: you can redistribute it and/or modify  
 * it under the terms of the GNU General Public License as published by  
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License 
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
enum CellMode {
  Empty,
  Playing,
  Stopped,
  Recording,
};

class CellState {
  protected static ledMode = {
    solid: 144,
    flash: 145,
    pulse: 146,
  }

  public mixNote: number;
  public arrangeNote: number;

  private cellMode: CellMode = CellMode.Empty;
  private isQueued: boolean = false;
  private colour: Colour = new Colour();
  protected isSelected: boolean = false;

  protected cacheStr: string = "";

  constructor(mixNote: number, arrangeNote: number) {
    this.mixNote = mixNote;
    this.arrangeNote = arrangeNote;
  }

  public setColour(colour: Colour): CellState {
    this.colour = colour;
    return this;
  }

  public setSelected(enabled: boolean): CellState {
    this.isSelected = enabled;
    return this;
  }

  public setEmpty(isArmed: boolean): CellState {
    this.cellMode = CellMode.Empty;
    this.isQueued = isArmed;
    return this;
  }
  public setPlaying(isQueued: boolean): CellState {
    this.cellMode = CellMode.Playing;
    this.isQueued = isQueued;
    return this;
  }
  public setStopped(isQueued: boolean): CellState {
    this.cellMode = CellMode.Stopped;
    this.isQueued = isQueued;
    return this;
  }
  public setRecording(isQueued: boolean): CellState {
    this.cellMode = CellMode.Recording;
    this.isQueued = isQueued;
    return this;
  }

  public clearCache(): CellState {
    this.cacheStr = "";
    return this;
  }

  public draw(o: Orientation) {
    const note = (o == Orientation.Mix) ? this.mixNote : this.arrangeNote;
    let colour, ledMode;
    switch (this.cellMode) {
      case CellMode.Empty: {
        colour = this.isQueued ? Colours.RecordArmDim.idx : (this.isSelected ? 1 : 0);
        ledMode = this.isSelected ? CellState.ledMode.pulse : CellState.ledMode.solid;
        break;
      }
      case CellMode.Playing: {
        ledMode = this.isQueued ? CellState.ledMode.flash : CellState.ledMode.pulse;
        colour = Colours.Play.idx;
        break;
      }
      case CellMode.Recording: {
        ledMode = this.isQueued ? CellState.ledMode.flash : CellState.ledMode.pulse;
        colour = Colours.Record.idx
        break;
      }
      case CellMode.Stopped: {
        ledMode = (this.isQueued) ? CellState.ledMode.flash : (this.isSelected ? CellState.ledMode.pulse : CellState.ledMode.solid);
        colour = this.colour.idx;
        break;
      }
    }

    const newCacheStr: string = `${note},${colour},${ledMode}`;
    if (newCacheStr.localeCompare(this.cacheStr) != 0) {
      ext.midiDawOut.sendMidi(ledMode, note, colour);
      this.cacheStr = newCacheStr;
    }
  }
}

interface GridPosition {
  trackIdx: number;
  slotIdx: number;
}

class Grid {
  private cells: CellState[] = [];

  constructor() {
    for (let trackIdx = 0; trackIdx < 8; trackIdx++) {
      for (let slotIdx = 0; slotIdx < 8; slotIdx++) {
        const mixNote = Grid.mixPositionToNote(trackIdx, slotIdx);
        const arrangeNote = Grid.arrangePositionToNote(trackIdx, slotIdx);
        // Indexed by their actual note value.
        this.cells[mixNote] = new CellState(mixNote, arrangeNote);
      }
    }
  }

  public getCell(mixNote: number): CellState {
    return this.cells[mixNote];
  }

  public getCellByTrackAndClip(trackIdx: number, slotIdx: number): CellState {
    const idx = Grid.mixPositionToNote(trackIdx, slotIdx);
    return this.cells[idx];
  }

  public noteToPosition(note: number, o: Orientation): GridPosition {
    if (o == Orientation.Arrange) {
      return Grid.arrangeNoteToPosition(note);
    }
    return Grid.mixNoteToPosition(note);
  }

  public draw(o: Orientation, skipCache: boolean = false) {
    for (const i in this.cells) {
      if (skipCache) {
        this.cells[i].clearCache().draw(o);
      } else {
        this.cells[i].draw(o);

      }
    }
  }

  public static mixPositionToNote(trackIdx: number, slotIdx: number): number {
    return ((8 - slotIdx) * 10) + trackIdx + 1;
  }

  public static arrangePositionToNote(trackIdx: number, slotIdx: number): number {
    return ((8 - trackIdx) * 10) + slotIdx + 1;
  }

  public static mixNoteToPosition(note: number): GridPosition {
    return {
      trackIdx: (note % 10) - 1,
      slotIdx: 7 - (Math.floor(note / 10) - 1),
    };
  }

  public static arrangeNoteToPosition(note: number): GridPosition {
    return {
      trackIdx: 7 - (Math.floor(note / 10) - 1),
      slotIdx: (note % 10) - 1,
    };
  }

  public static mixNoteToArrangeNote(note: number): number {
    const pos = Grid.mixNoteToPosition(note);
    return Grid.arrangePositionToNote(pos.trackIdx, pos.slotIdx);
  }

  public static arrangeNoteToMixNote(note: number): number {
    const pos = Grid.arrangeNoteToPosition(note);
    return Grid.mixPositionToNote(pos.trackIdx, pos.slotIdx);
  }

}

