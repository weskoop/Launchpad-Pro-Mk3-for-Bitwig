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
class DeviceLayer extends Layer {
  public parameterPages = 1;
  public parameterPageIdx = 0;

  activate() {
    ext.launchPad.setLayout(Layout.Fader, FaderBank.Device);
    ext.buttons.setAllTrackButtonColours(Colours.Off, Colours.Device, this.getOrientation());
    this.selectTrackMode(Button.Device);
    this.updateTrackFaders();
    ext.cursorDevice.isRemoteControlsSectionVisible().set(true);
    this.setGridModButtons(false);
  }

  deactivate() {
    ext.launchPad.stopFaders(FaderBank.Device);
  }

  updateSceneColours() {
    // Do nothing.
  }

  updateTrackAndSceneToggles() {
    const o = this.getOrientation();
    for (let i = 0; i < LaunchPad.numTracks; i++) {
      ext.buttons.getTrackButton(i)
        .setEnabled(true)
        .setSelected(this.trackToggles[i])
        .draw(o);
    }
  }

  updateOrientation() {
    ext.launchPad.setLayout(Layout.Fader, FaderBank.Device);
    this.updateTrackFaders();
    if (Layer.isButtonHeld(Button.Shift)) {
      ext.buttons.drawShifted()
    } else {
      ext.buttons.draw(Layer.getCurrent().getOrientation());
    }
  }

  updateTrackFader(idx: number) {
    ext.midiDawOut.sendMidi(180, idx + 0x30, this.trackFaders[idx]);
  }

  setPages(count: number) {
    this.parameterPages = count;
  }

  setPageIdx(idx: number) {
    this.parameterPageIdx = idx;
    if (this == Layer.getCurrent()) {
      this.selectScenePage(idx);
    }
  }

  onButtonPush(btn: Button) {
    ext.launchPad.stopFaders(FaderBank.Device);

    if (Layer.isButtonHeld(Button.Shift)) {
      this.parent.onButtonPush(btn);
      return;
    }

    switch (btn) {
      case Button.Device:
        Layer.setCurrent(Layers.Session);
        break;
      case Button.Up:
        ext.cursorRemote.selectPreviousPage(false);
        break;
      case Button.Down:
        ext.cursorRemote.selectNextPage(false);
        break;
      case Button.Left:
        ext.cursorDevice.selectPrevious();
        ext.cursorDevice.selectDevice(ext.cursorDevice);
        ext.cursorDevice.isRemoteControlsSectionVisible().set(true);
        break;
      case Button.Right:
        ext.cursorDevice.selectNext();
        ext.cursorDevice.selectDevice(ext.cursorDevice);
        ext.cursorDevice.isRemoteControlsSectionVisible().set(true);
        break;
      default:
        this.parent.onButtonPush(btn);
    }
  }

  onTrackPush(idx: number) {
    if (Layer.isButtonHeld(Button.Shift)) {
      return;
    }

    ext.launchPad.stopFaders(FaderBank.Device);
    ext.cursorRemote.getParameter(idx).reset();
  }

  onScenePush(idx: number) {
    if (Layer.isButtonHeld(Button.Shift)) {
      return;
    }
    if (idx < this.parameterPages) {
      ext.cursorRemote.selectedPageIndex().set(idx);
      this.selectScenePage(idx);
    }
  }

  updateScrolling() {
    let remoteUp = ext.buttons.getButton(Button.Up);
    let remoteDown = ext.buttons.getButton(Button.Down);
    let devicesUp = ext.buttons.getButton(Button.Left);
    let devicesDown = ext.buttons.getButton(Button.Right);

    remoteUp.setSelectedColour(Colours.Device).setSelected(Layer.getScroll("remoteUp")).setShiftedColour(Colours.Off);
    remoteDown.setSelectedColour(Colours.Device).setSelected(Layer.getScroll("remoteDown")).setShiftedColour(Colours.Off);
    devicesUp.setSelectedColour(Colours.Device).setSelected(Layer.getScroll("devicesUp")).setShiftedColour(Colours.Off);
    devicesDown.setSelectedColour(Colours.Device).setSelected(Layer.getScroll("devicesDown")).setShiftedColour(Colours.Off);

    const o = this.getOrientation();
    remoteUp.draw(o);
    remoteDown.draw(o);
    devicesUp.draw(o);
    devicesDown.draw(o);

    let colours = new Array<Colour>(LaunchPad.numTracks);
    colours.fill(Colours.Off, 0, LaunchPad.numTracks);
    colours.fill(Colours.DeviceDim, 0, this.parameterPages);
    ext.buttons.setEachSceneButtonColour(colours, Colours.Device, o);
    if (this.parameterPageIdx > -1) {
      ext.buttons.getSceneButton(this.parameterPageIdx).setSelected(true).draw(o);

    }
  }
}