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
class VolumeLayer extends Layer {
  activate() {
    ext.launchPad.setLayout(Layout.Fader, FaderBank.Volume);
    ext.buttons.setAllTrackButtonColours(Colours.VolumeDim, Colours.Volume, this.getOrientation());
    this.selectTrackMode(Button.Volume);
    this.updateTrackFaders();
    this.setGridModButtons(false);
  }

  deactivate() {
    ext.launchPad.stopFaders(FaderBank.Volume);
  }

  updateOrientation() {
    ext.launchPad.setLayout(Layout.Fader, FaderBank.Volume);
    this.updateTrackFaders();
    if (Layer.isButtonHeld(Button.Shift)) {
      ext.buttons.drawShifted()
    } else {
      ext.buttons.draw(Layer.getCurrent().getOrientation());
    }
  }

  updateTrackFader(idx: number) {
    ext.midiDawOut.sendMidi(180, idx, this.trackFaders[idx]);
  }

  setTrackExists(idx: number, exists: boolean) {
    ext.launchPad.stopFaders(FaderBank.Volume);
    const colour = exists ? "15" : "00";
    ext.midiDawOut.sendSysex(`${SysexPrefix} 01 00 ${Layer.getCurrent().getOrientation()} 0${idx} 00 0${idx} ${colour} F7`);
    if (exists) {
      this.updateTrackFader(idx);
    }
  }

  onButtonPush(btn: Button) {
    ext.launchPad.stopFaders(FaderBank.Volume);

    if (Layer.isButtonHeld(Button.Shift)) {
      this.parent.onButtonPush(btn);
      return;
    }

    switch (btn) {
      case Button.Volume:
        Layer.setCurrent(Layers.Session);
        break;
      default:
        this.parent.onButtonPush(btn);
    }
  }

  onTrackPush(idx: number) {
    if (Layer.isButtonHeld(Button.Shift)) {
      return;
    }

    ext.launchPad.stopFaders(FaderBank.Volume);
    ext.trackBank.getItemAt(idx).volume().reset();
  }
}