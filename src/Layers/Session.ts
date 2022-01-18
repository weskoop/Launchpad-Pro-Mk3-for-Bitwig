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
class SessionLayer extends Layer {

  activate() {
    Layer.maybeSetSessionLayout();
    this.selectTrackMode();
    this.setGridModButtons(true);
  }

  updateTrackColours() {
    ext.buttons.setEachTrackButtonColour(Layer.trackColours, Colours.Selected, this.getOrientation());
  }

  onButtonPush(btn: Button) {
    // Shifted Only.
    if (Layer.isButtonHeld(Button.Shift)) {
      switch (btn) {
        case Button.Shift:
          ext.buttons.drawShifted();
          break;
        case Button.Duplicate:
          if (Layer.isNotesLayout()) {
            ext.cursorClip.duplicateContent();
          }
          break;
        case Button.Play:
          ext.transport.playStartPosition().set(0);
          ext.transport.launchFromPlayStartPosition();
          break;
        case Button.Quantize:
          if (ext.app.recordQuantizationGrid().get() == "OFF") {
            ext.app.recordQuantizationGrid().set(ext.launchPad.state.quantizeGrid);
          } else {
            ext.app.recordQuantizationGrid().set("OFF");
          }
          break;
        case Button.RecordArm:
          ext.app.undo();
          break;
        case Button.Mute:
          ext.app.redo();
          break;
        case Button.Solo:
          ext.transport.isMetronomeEnabled().toggle();
          break;
        case Button.Volume:
          ext.app.setPanelLayout("ARRANGE");
          break;
        case Button.Pan:
          ext.app.setPanelLayout("MIX");
          break
        case Button.Sends:
          ext.transport.tapTempo();
          break;
        case Button.StopClip: {
          const g = ext.groove.getEnabled().value().get() > 0;
          ext.groove.getEnabled().value().set(g ? 0 : 1);
          break;
        }
        case Button.Up:
          if (this.getOrientation() == Orientation.Mix) {
            ext.sceneBank.scrollByPages(-1);
          } else {
            ext.trackBank.scrollByPages(-1);
          }
          break;
        case Button.Down:
          if (this.getOrientation() == Orientation.Mix) {
            ext.sceneBank.scrollByPages(1);
          } else {
            ext.trackBank.scrollByPages(1);
          }
          break;
        case Button.Left:
          if (this.getOrientation() == Orientation.Mix) {
            ext.trackBank.scrollByPages(-1);
          } else {
            ext.sceneBank.scrollByPages(-1);
          }
          break;
        case Button.Right:
          if (this.getOrientation() == Orientation.Mix) {
            ext.trackBank.scrollByPages(1);
          } else {
            ext.sceneBank.scrollByPages(1);
          }
          break;
      }

      // Shifted Only.
      return;
    }

    switch (btn) {
      case Button.FixedLength:
        if (ext.transport.clipLauncherPostRecordingAction().get() == "off") {
          ext.transport.clipLauncherPostRecordingAction().set(ext.launchPad.state.fixedLength);
        } else {
          ext.transport.clipLauncherPostRecordingAction().set("off");
        }
        break;
      case Button.Session:
        Layer.setCurrent(Layers.Session);
        break;
      case Button.Clear:
        if (Layer.isNotesLayout()) {
          const slot = ext.cursorClip.clipLauncherSlot();
          if (slot.hasContent().get()) {
            slot.deleteObject();
          }
        }
        break;
      case Button.Duplicate:
        if (Layer.isNotesLayout()) {
          const slot = ext.cursorClip.clipLauncherSlot();
          const track = ext.cursorClip.getTrack();
          const clipIdx = slot.sceneIndex().get();
          slot.duplicateClip();
          track.selectSlot(clipIdx + 1);
        }
        break;
      case Button.Quantize:
        if (Layer.isNotesLayout()) {
          ext.cursorClip.quantize(1);
        }
        break;
      case Button.Play:
        ext.transport.togglePlay();
        break;
      case Button.Record: {
        // TODO: Option: Plain old arranger Record?
        // ext.transport.record();

        const overdub = ext.transport.isClipLauncherOverdubEnabled();
        const slot = ext.cursorClip.clipLauncherSlot();

        if (Layer.isNotesLayout()) {
          const track = ext.cursorTrack;
          if (track.arm().get()) {
            if (track.isStopped().get()) {
              // Record to a new Slot!
              track.recordNewLauncherClip(0);
            } else {
              if (slot.isRecording().get()) {
                // Finish Recording.
                slot.launch();
              } else {
                // Toggle Overdub On and Off.
                overdub.toggle();
              }
            }
          } else {
            overdub.toggle();
          }
          return;
        }

        if (slot.isRecording().get()) {
          // Finish Recording.
          slot.launch();
        } else {
          // Toggle Overdub On and Off.
          overdub.toggle();
        }
        break;
      }
      case Button.RecordArm:
        Layer.setOverlay(Layers.RecordArm);
        break;
      case Button.Mute:
        Layer.setOverlay(Layers.Mute);
        break;
      case Button.Solo:
        Layer.setOverlay(Layers.Solo);
        break;
      case Button.Volume:
        Layer.setOverlay(Layers.Volume);
        break;
      case Button.Pan:
        Layer.setOverlay(Layers.Pan);
        break;
      case Button.Sends:
        Layer.setOverlay(Layers.Sends);
        break;
      case Button.Device:
        Layer.setOverlay(Layers.Device);
        break;
      case Button.StopClip:
        Layer.setOverlay(Layers.StopClip);
        break;
      case Button.Up:
        if (this.getOrientation() == Orientation.Mix) {
          ext.sceneBank.scrollBackwards();
        } else {
          ext.trackBank.scrollBackwards();
        }
        break;
      case Button.Down:
        if (this.getOrientation() == Orientation.Mix) {
          ext.sceneBank.scrollForwards();
        } else {
          ext.trackBank.scrollForwards();
        }
        break;
      case Button.Left:
        if (this.getOrientation() == Orientation.Mix) {
          ext.trackBank.scrollBackwards();
        } else {
          ext.sceneBank.scrollBackwards();
        }
        break;
      case Button.Right:
        if (this.getOrientation() == Orientation.Mix) {
          ext.trackBank.scrollForwards();
        } else {
          ext.sceneBank.scrollForwards();
        }
        break;
    }
  }

  onButtonRelease(btn: Button) {
    switch (btn) {
      case Button.Shift:
        ext.buttons.draw(this.getOrientation());
    }
  }

  onTrackPush(idx: number) {
    if (Layer.isButtonHeld(Button.Shift)) {
      return;
    }
    ext.trackBank.getItemAt(idx).selectInMixer();
  }

  onScenePush(idx: number) {
    if (Layer.isButtonHeld(Button.Shift)) {
      return;
    }
    ext.sceneBank.getItemAt(idx).launch();
  }

  onGridPush(idx: number) {
    const pos = ext.grid.noteToPosition(idx, this.getOrientation());
    const track = ext.trackBank.getItemAt(pos.trackIdx);
    const slotBank = track.clipLauncherSlotBank()
    const slot = slotBank.getItemAt(pos.slotIdx);

    // Select the slot
    slotBank.select(pos.slotIdx);

    // Modifiers.
    if (Layer.isButtonHeld(Button.Shift)) {
      if (Layer.isButtonHeld(Button.Duplicate)) {
        ext.cursorClip.duplicateContent();
      }
    } else if (Layer.isButtonHeld(Button.Clear)) {
      slot.deleteObject();
    } else if (Layer.isButtonHeld(Button.Duplicate)) {
      slot.duplicateClip();
      slotBank.select(pos.slotIdx + 1);
    } else if (Layer.isButtonHeld(Button.Quantize)) {
      ext.cursorClip.quantize(1);
    }
    // // Alternate idea for the Fixed Length button.
    // // Change the loop length of the Selected clip
    // else if (Layer.isButtonHeld(Button.FixedLength)) {
    // // Cycle through 1,2,3,4,6,8 Bars.
    // slotBank.select(pos.slotIdx);
    // let ll = ext.cursorClip.getLoopLength().get();
    // if (ll < 4) {
    //   ll = 4;
    // } else if (ll < 8) {
    //   ll = 8;
    // } else if (ll < 12) {
    //   ll = 12;
    // } else if (ll < 16) {
    //   ll = 16;
    // } else if (ll < 24) {
    //   ll = 24;
    // } else if (ll < 32) {
    //   ll = 32;
    // } else {
    //   ll = 4;
    // }
    // ext.cursorClip.getLoopLength().set(ll);
    // }
    else if (slot.hasContent().get()) {
      slot.launch();
    } else if (track.arm().get()) {
      if (!ext.transport.isPlaying().get()) {
        ext.transport.play();
      }
      slot.record();
    } else {
      track.stop();
    }
  }


  onLayoutPush(layout: string, previousLayout: string) {

    if (Layer.ignoreLayoutPush) {
      Layer.ignoreLayoutPush = false;
      return;
    }

    if (previousLayout == layout) {
      // Nothing to see here, probably an orientation change or something.
      return;
    }

    // Fader > Anything
    if (previousLayout == Layout.Fader && layout != Layout.Fader) {
      Layer.setCurrent(Layers.Session);
    }

    // Anything > Fader
    if (previousLayout != Layout.Fader && layout == Layout.Fader) {
      switch (Layer.currentFaderBank) {
        case FaderBank.Volume:
          Layer.setCurrent(Layers.Volume);
          break;
        case FaderBank.Pan:
          Layer.setCurrent(Layers.Pan);
          break;
        case FaderBank.Sends:
          Layer.setCurrent(Layers.Sends);
          break;
        case FaderBank.Device:
          Layer.setCurrent(Layers.Device);
          break;
        default:
          // We'll ignore the rest.
          break;
      }
    }


    this.updateNotesLayout();
  }

  updateNotesLayout() {
    switch (Layer.currentLayout) {
      case Layout.Note:
      case Layout.Chord: {
        const hasContent = Layer.selectedSlotHasContent;
        this.setGridModButtons(hasContent);
      }
      case Layout.Fader: {
        this.setGridModButtons(true);
      }
      case Layout.Session: {
        this.setGridModButtons(true);
      }
    }
    this.updateRecordingState();
  }

  updateRecordingState() {
    // States (this is dumb and complex, but worth it for the UI.)
    // - Overdub: Enabled Orange Solid
    // - Overdub: Disabled White Solid
    // - Recording Clip: Red Pulsing
    // - Recording Queued: Red Flashing
    // - Notes Mode: Armed Waiting to Record: Red Solid

    const slot = ext.cursorClip.clipLauncherSlot();
    const track = ext.cursorTrack;

    const isRecording = slot.isRecording().get();
    const isRecordingQueued = slot.isRecordingQueued().get();
    const isArmed = track.arm().get() && track.isStopped().get();
    const record = ext.buttons.getButton(Button.Record);
    const isOverdub = ext.transport.isClipLauncherOverdubEnabled().get();

    if (isRecordingQueued) {
      record.setSelected(true).setFlash().draw(this.getOrientation());
    } else if (isRecording) {
      record.setSelected(true).setPulse().draw(this.getOrientation());
    } else {
      record.setSelected(Layer.isNotesLayout() && isArmed).setSolid().draw(this.getOrientation());
    }

    const isRedKeys = isRecording || isRecordingQueued || isOverdub;
    ext.midiDawOut.sendSysex(`${SysexPrefix} 17 ${isRedKeys ? "05" : "03"} F7`);
  }

  updateOrientation() {
    ext.grid.draw(Layer.getCurrent().getOrientation());
    if (Layer.isButtonHeld(Button.Shift)) {
      ext.buttons.drawShifted()
    } else {
      ext.buttons.draw(Layer.getCurrent().getOrientation());
    }
  }

  updateScrolling() {
    let scenesUp = ext.buttons.getButton(Button.Up);
    let scenesDown = ext.buttons.getButton(Button.Down);
    let tracksUp = ext.buttons.getButton(Button.Left);
    let tracksDown = ext.buttons.getButton(Button.Right);

    if (Layer.orientation == Orientation.Arrange) {
      scenesUp = ext.buttons.getButton(Button.Left);
      scenesDown = ext.buttons.getButton(Button.Right);
      tracksUp = ext.buttons.getButton(Button.Up);
      tracksDown = ext.buttons.getButton(Button.Down);
    }

    tracksUp
      .setSelectedColour(Colours.Scroll)
      .setSelected(Layer.getScroll("tracksUp"))
      .setShiftedColour(Layer.getScroll("tracksUp") ? Colours.Selected : Colours.Off);
    tracksDown
      .setSelectedColour(Colours.Scroll)
      .setSelected(Layer.getScroll("tracksDown"))
      .setShiftedColour(Layer.getScroll("tracksDown") ? Colours.Selected : Colours.Off);
    scenesUp
      .setSelectedColour(Colours.Scroll)
      .setSelected(Layer.getScroll("scenesUp"))
      .setShiftedColour(Layer.getScroll("scenesUp") ? Colours.Selected : Colours.Off);
    scenesDown
      .setSelectedColour(Colours.Scroll)
      .setSelected(Layer.getScroll("scenesDown"))
      .setShiftedColour(Layer.getScroll("scenesDown") ? Colours.Selected : Colours.Off);


    if (Layer.isButtonHeld(Button.Shift)) {
      tracksUp.drawShifted();
      tracksDown.drawShifted();
      scenesUp.drawShifted();
      scenesDown.drawShifted();
    } else {
      const o = this.getOrientation();
      tracksUp.draw(o);
      tracksDown.draw(o);
      scenesUp.draw(o);
      scenesDown.draw(o);
    }
  }
}