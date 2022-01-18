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
enum Button {
  Up = 80,
  Down = 70,
  Left = 91,
  Right = 92,
  Session = 93,
  Shift = 90,
  Clear = 60,
  Duplicate = 50,
  Quantize = 40,
  FixedLength = 30,
  Play = 20,
  Record = 10,
  RecordArm = 1,
  Mute = 2,
  Solo = 3,
  Volume = 4,
  Pan = 5,
  Sends = 6,
  Device = 7,
  StopClip = 8,
  Scene0 = 89,
  Scene1 = 79,
  Scene2 = 69,
  Scene3 = 59,
  Scene4 = 49,
  Scene5 = 39,
  Scene6 = 29,
  Scene7 = 19,
  Track0 = 101,
  Track1 = 102,
  Track2 = 103,
  Track3 = 104,
  Track4 = 105,
  Track5 = 106,
  Track6 = 107,
  Track7 = 108,
  LogoLed = 99, // Not a button, just an LED.
};

type ButtonData = ButtonState[];
class ButtonState {
  protected static ledMode = {
    solid: 176,
    flash: 177,
    pulse: 178,
  }

  // LED
  public mixCC: number;
  public arrangeCC: number;

  protected mode: number = ButtonState.ledMode.solid;
  protected isEnabled: boolean = false;
  protected isSelected: boolean = false;

  protected colour: Colour = Colours.Deselected;
  protected selectedColour: Colour = Colours.Selected;
  protected shiftedColour: Colour = Colours.Off;

  protected cacheStr: string = "";

  constructor(mixCC: number, arrangeCC: number) {
    this.mixCC = mixCC;
    this.arrangeCC = arrangeCC;
  }

  public setEnabled(enabled: boolean): ButtonState {
    this.isEnabled = enabled;
    return this;
  }

  public setSelected(enabled: boolean): ButtonState {
    this.isSelected = enabled;
    return this;
  }

  public setColour(colour: Colour = Colours.Deselected): ButtonState {
    this.colour = colour;
    return this;
  }

  public setSelectedColour(colour: Colour = Colours.Selected): ButtonState {
    this.selectedColour = colour;
    return this;
  }

  public setShiftedColour(colour: Colour = Colours.Off): ButtonState {
    this.shiftedColour = colour;
    return this;
  }

  public setSolid(): ButtonState {
    this.mode = ButtonState.ledMode.solid;
    return this;
  }
  public setPulse(): ButtonState {
    this.mode = ButtonState.ledMode.pulse;
    return this;
  }
  public setFlash(): ButtonState {
    this.mode = ButtonState.ledMode.flash;
    return this;
  }

  public clearCache(): ButtonState {
    this.cacheStr = "";
    return this;
  }

  public draw(o: Orientation) {
    const cc = (o == Orientation.Mix) ? this.mixCC : this.arrangeCC;
    let colour = this.colour.idx;
    let ledMode = this.mode;

    if (!this.isEnabled) {
      colour = 0;
      ledMode = ButtonState.ledMode.solid
    } else if (this.isSelected) {
      colour = this.selectedColour.idx;
    }
    this.cacheMidiSend(ledMode, cc, colour);
  }

  public drawShifted() {
    this.cacheMidiSend(ButtonState.ledMode.solid, this.mixCC, this.shiftedColour.idx);
  }

  private cacheMidiSend(status: number, data1: number, data2: number) {
    const newCacheStr: string = `${status},${data1},${data2}`;
    if (newCacheStr.localeCompare(this.cacheStr) != 0) {
      ext.midiDawOut.sendMidi(status, data1, data2);
      this.cacheStr = newCacheStr;
    }
  }
}

class Buttons {
  private buttons: ButtonData = [];

  constructor() {
    for (const b in Button) {
      const cc = Number(b);
      // Handle Typescript Enums.
      if (isNaN(cc)) { return; }

      switch (cc) {
        case Button.Scene0:
        case Button.Scene1:
        case Button.Scene2:
        case Button.Scene3:
        case Button.Scene4:
        case Button.Scene5:
        case Button.Scene6:
        case Button.Scene7: {
          const arrangeCC = Buttons.idxToTrackButtonCC(Buttons.sceneButtonCCToIdx(cc));
          this.buttons[cc] = new ButtonState(cc, arrangeCC);
          break;
        }
        case Button.Track0:
        case Button.Track1:
        case Button.Track2:
        case Button.Track3:
        case Button.Track4:
        case Button.Track5:
        case Button.Track6:
        case Button.Track7: {
          const arrangeCC = Buttons.idxToSceneButtonCC(Buttons.trackButtonCCToIdx(cc));
          this.buttons[cc] = new ButtonState(cc, arrangeCC);
          break;
        }
        default:
          this.buttons[cc] = new ButtonState(cc, cc);
          break;
      }
    }
  }

  public getButton(b: Button): ButtonState {
    return this.buttons[b];
  }

  public getTrackButton(idx: number): ButtonState {
    return this.buttons[Buttons.idxToTrackButtonCC(idx)];
  }

  public getSceneButton(idx: number): ButtonState {
    return this.buttons[Buttons.idxToSceneButtonCC(idx)];
  }

  public setAllTrackButtonColours(colour: Colour, selected: Colour, o: Orientation): Buttons {
    for (let i = 0; i < LaunchPad.numTracks; i++) {
      this.getTrackButton(i).setColour(colour).setSelectedColour(selected).draw(o);
    }
    return this;
  }

  public setEachTrackButtonColour(colours: Colour[], selected: Colour, o: Orientation) {
    for (let i = 0; i < LaunchPad.numTracks; i++) {
      this.getTrackButton(i).setColour(colours[i]).setSelectedColour(selected).draw(o);
    }
    return this;
  }

  public setAllSceneButtonColours(colour: Colour, selected: Colour, o: Orientation): Buttons {
    for (let i = 0; i < LaunchPad.numTracks; i++) {
      this.getSceneButton(i).setColour(colour).setSelectedColour(selected).draw(o);
    }
    return this;
  }

  public setEachSceneButtonColour(colours: Colour[], selected: Colour, o: Orientation) {
    for (let i = 0; i < LaunchPad.numTracks; i++) {
      this.getSceneButton(i).setColour(colours[i]).setSelectedColour(selected).draw(o);
    }
    return this;
  }

  public draw(o: Orientation, skipCache: boolean = false) {
    for (const b in this.buttons) {
      if (skipCache) {
        this.buttons[b].clearCache().draw(o);
      } else {
        this.buttons[b].draw(o);
      }
    }
  }

  public drawShifted(skipCache: boolean = false) {
    for (const b in this.buttons) {
      if (skipCache) {
        this.buttons[b].clearCache().drawShifted();
      } else {
        this.buttons[b].drawShifted();
      }
    }
  }

  public static trackButtonCCToIdx(cc: number) { return cc - 101; }
  public static sceneButtonCCToIdx(cc: number) { return 8 - ((cc - 9) / 10); }

  public static idxToTrackButtonCC(idx: number) { return idx + 101; }
  public static idxToSceneButtonCC(idx: number) { return (8 - idx) * 10 + 9; }
}
