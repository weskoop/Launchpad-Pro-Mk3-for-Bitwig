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
class PadState {
  protected static ledMode = {
    solid: 152,
    flash: 153,
    pulse: 154,
  }

  public note: number;
  private colour: Colour = new Colour();

  protected isEnabled: boolean = false;
  protected isSelected: boolean = false;
  protected isMuted: boolean = false;
  protected isSolo: boolean = false;
  protected isPlaying: boolean = false;
  protected velocity: number = 1;

  constructor(note: number) {
    this.note = note;
  }

  public setColour(colour: Colour): PadState {
    this.colour = colour;
    return this;
  }

  public setEnabled(enabled: boolean): PadState {
    this.isEnabled = enabled;
    return this;
  }

  public setSelected(enabled: boolean): PadState {
    this.isSelected = enabled;
    return this;
  }

  public setMuted(enabled: boolean): PadState {
    this.isMuted = enabled;
    return this;
  }

  public setSolo(enabled: boolean): PadState {
    this.isSolo = enabled;
    return this;
  }

  public setPlaying(enabled: boolean, velocity: number = 0): PadState {
    this.isPlaying = enabled;
    if (velocity < 40) {
      this.velocity = 1;
    } else if (velocity < 80) {
      this.velocity = 2;
    } else {
      this.velocity = 3;
    }
    return this;
  }

  public draw() {
    if (this.isPlaying) {
      // Solo will override Mutes
      const isMuted = this.isMuted && !this.isSolo;
      ext.midiDawOut.sendMidi(PadState.ledMode.pulse, this.note, isMuted ? Colours.Mute.idx : this.velocity);
    } else if (this.isSolo) {
      ext.midiDawOut.sendMidi(PadState.ledMode.pulse, this.note, Colours.Solo.idx);
    } else if (this.isMuted) {
      ext.midiDawOut.sendMidi(PadState.ledMode.pulse, this.note, Colours.Mute.idx);
    } else if (this.isEnabled) {
      const ledMode = this.isSelected ? PadState.ledMode.pulse : PadState.ledMode.solid;
      ext.midiDawOut.sendMidi(ledMode, this.note, this.colour.idx);
    } else {
      ext.midiDawOut.sendMidi(PadState.ledMode.solid, this.note, 0);
    }
  }
}

type PlayingNotes = com.bitwig.extension.controller.api.PlayingNote[];

class DrumPads {
  private pads: PadState[] = [];
  private playingNotes: number[] = [];

  constructor() {
    for (let padIdx = 0; padIdx < 64; padIdx++) {
      this.pads[padIdx] = new PadState(36 + padIdx);
    }
  }

  // Note: We're also sending out NoteOn/NoteOff for 
  // the Notes mode here, no need to do all of this twice.
  public updateNotes(notes: PlayingNotes) {
    if (!notes.length) {
      // Clear All notes.
      for (const i in this.playingNotes) {
        const note = this.playingNotes[i];
        const padIdx = note - 36;
        if (padIdx >= 0 && padIdx < 64) {
          this.pads[padIdx].setPlaying(false).draw();
        }

        // For Notes Mode.
        ext.midiDawOut.sendMidi(143, note, 0);
      }
      this.playingNotes = [];
    } else {
      let newPlayingNotes = [];

      // Note On
      for (const i in notes) {
        const note = notes[i].pitch();
        const padIdx = note - 36;
        newPlayingNotes.push(note);
        if (this.playingNotes.indexOf(note) < 0) {
          if (padIdx >= 0 && padIdx < 64) {
            this.pads[padIdx].setPlaying(true, notes[i].velocity()).draw();
          }
          // For Notes Mode.
          ext.midiDawOut.sendMidi(159, note, Colours.Play.idx);
        }
      }
      // Note Off
      for (const i in this.playingNotes) {
        const note = this.playingNotes[i];
        const padIdx = note - 36;
        if (newPlayingNotes.indexOf(note) < 0) {
          if (padIdx >= 0 && padIdx < 64) {
            this.pads[padIdx].setPlaying(false).draw();
          }
          // For Notes Mode.
          ext.midiDawOut.sendMidi(143, note, 0);
        }
      }

      this.playingNotes = newPlayingNotes;
    }
  }


  public getPad(note: number): PadState {
    return this.pads[note];
  }

  public draw() {
    for (const i in this.pads) {
      this.pads[i].draw();
    }
  }
}
