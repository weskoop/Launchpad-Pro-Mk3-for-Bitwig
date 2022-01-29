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
const enum TrackMode {
  Select,
  RecordArm,
  Mute,
  Solo,
  Volume,
  Pan,
  Sends,
  Device,
  StopClip,
};


// HEX String Values
const SysexPrefix = "F0 00 20 29 02 0E";
const enum FaderBank {
  Volume = "00",
  Pan = "01",
  Sends = "02",
  Device = "03",
};

const enum Orientation {
  Mix = "00",     // Default
  Arrange = "01", // Rotated
};

const enum Layout {
  // We don't care about all of the Layouts
  // because we are locked out of the rest 
  // of the buttons in most of them.
  Session = "00",
  Fader = "01",
  Chord = "02",
  Note = "04",
}

const PrefOrientation = ["Mix Only", "Arranger Only", "Follow Bitwig"];
const PrefPanFader = ["Follow Orientation", "Horizontal Only"];

/**
 * Manages the Launchpad Modes, Layouts and Pages
 */
class LaunchPad {
  public static numTracks = 8;
  public static numScenes = 8;
  public static numSends = 8;
  public static numDrumPads = 64;

  // Some State.
  public state = {
    orientation: Orientation.Mix,
    quantizeGrid: "1/16",
    fixedLength: "play_recorded",
    ignoreFaders: false,
    enablePanelSwitch: true,
  }

  public init() {
    // Setup Default Colours. 
    {
      ext.buttons.getButton(Button.LogoLed).setColour(Colours.Bitwig).setShiftedColour(Colours.Bitwig);

      ext.buttons.getButton(Button.Clear).setSelectedColour(Colours.Deselected).setEnabled(true);
      ext.buttons.getButton(Button.Duplicate).setSelectedColour(Colours.Deselected).setShiftedColour(Colours.Shifted).setEnabled(true);
      ext.buttons.getButton(Button.Quantize).setSelectedColour(Colours.Deselected).setShiftedColour(Colours.Shifted).setEnabled(true);
      ext.buttons.getButton(Button.FixedLength).setSelectedColour(Colours.Bitwig).setEnabled(true);

      // Gonna handle Record a little differently then the others.. it's a bit overloaded.
      ext.buttons.getButton(Button.Record).setSelectedColour(Colours.Record).setEnabled(true);

      ext.buttons.getButton(Button.Play).setSelectedColour(Colours.Play).setShiftedColour(Colours.Shifted).setEnabled(true);

      ext.buttons.getButton(Button.RecordArm).setSelectedColour(Colours.RecordArm).setShiftedColour(Colours.Shifted).setEnabled(true);
      ext.buttons.getButton(Button.Mute).setSelectedColour(Colours.Mute).setShiftedColour(Colours.Shifted).setEnabled(true);
      ext.buttons.getButton(Button.Solo).setSelectedColour(Colours.Solo).setShiftedColour(Colours.Shifted).setEnabled(true);
      ext.buttons.getButton(Button.Volume).setSelectedColour(Colours.Volume).setShiftedColour(Colours.BitwigDim).setEnabled(true);
      ext.buttons.getButton(Button.Pan).setSelectedColour(Colours.Pan).setShiftedColour(Colours.BitwigDim).setEnabled(true);
      ext.buttons.getButton(Button.Sends).setSelectedColour(Colours.Sends).setShiftedColour(Colours.Shifted).setEnabled(true);
      ext.buttons.getButton(Button.Device).setSelectedColour(Colours.Device).setEnabled(true);
      ext.buttons.getButton(Button.StopClip).setSelectedColour(Colours.StopClip).setShiftedColour(Colours.Shifted).setEnabled(true);

      // "Shifted" handled By Arrows Handler.
      ext.buttons.getButton(Button.Up).setColour(Colours.Off).setSelectedColour(Colours.Scroll).setEnabled(true);
      ext.buttons.getButton(Button.Down).setColour(Colours.Off).setSelectedColour(Colours.Scroll).setEnabled(true);
      ext.buttons.getButton(Button.Left).setColour(Colours.Off).setSelectedColour(Colours.Scroll).setEnabled(true);
      ext.buttons.getButton(Button.Right).setColour(Colours.Off).setSelectedColour(Colours.Scroll).setEnabled(true);
    }

    // Setup layers.
    {
      Layer.setDefault(Layers.Session);
      Layer.setCurrent(Layers.Session);
    }

    // Create API connections.
    {
      // Main App Functions.
      ext.app = host.createApplication();
      ext.transport = host.createTransport();
      ext.groove = host.createGroove();

      // Main Track and Scene Banks
      ext.trackBank = host.createTrackBank(LaunchPad.numTracks, LaunchPad.numSends, LaunchPad.numScenes, true);
      ext.sceneBank = ext.trackBank.sceneBank();

      // This all follows the selection in Bitwig.
      ext.cursorClip = host.createLauncherCursorClip(1, 1);
      ext.cursorTrack = host.createCursorTrack("Primary", "Primary", 0, 0, true);
      ext.cursorDevice = ext.cursorTrack.createCursorDevice("Primary", "Primary", 0, com.bitwig.extension.controller.api.CursorDeviceFollowMode.FOLLOW_SELECTION);
      ext.cursorRemote = ext.cursorDevice.createCursorRemoteControlsPage(8);

      // These are for Drum mode.
      ext.cursorTrackFirstDevice = ext.cursorTrack.createCursorDevice("First Device", "First Device", 0, com.bitwig.extension.controller.api.CursorDeviceFollowMode.FIRST_DEVICE);
      ext.cursorDrumPadBank = ext.cursorTrackFirstDevice.createDrumPadBank(LaunchPad.numDrumPads);
    }

    // Preferences
    {
      let prefs = host.getPreferences();
      ext.prefs.orientation = prefs.getEnumSetting("Orientation", "Grid", PrefOrientation, PrefOrientation[0]);
      ext.prefs.orientation.addValueObserver((v) => {
        switch (v) {
          case "Mix Only":
            this.state.orientation = Orientation.Mix
            Layer.setOrientation(this.state.orientation);
            break;
          case "Arranger Only":
            this.state.orientation = Orientation.Arrange
            Layer.setOrientation(this.state.orientation);
            break;
          case "Follow Bitwig":
            ext.app.nextPanelLayout();
            ext.app.nextPanelLayout();
            break;
        }
      });

      ext.prefs.panOrientation = prefs.getEnumSetting("Pan Faders", "Grid", PrefPanFader, PrefPanFader[0]);

      ext.prefs.scenesIndication = prefs.getBooleanSetting("Scenes", "Indicators", false);
      ext.prefs.scenesIndication.addValueObserver((v) => {
        ext.sceneBank.setIndication(v);
      });

      ext.prefs.slotsIndication = prefs.getBooleanSetting("Slots", "Indicators", false);
      ext.prefs.slotsIndication.addValueObserver((v) => {
        for (let trackIdx = 0; trackIdx < LaunchPad.numTracks; trackIdx++) {
          ext.trackBank.getItemAt(trackIdx).clipLauncherSlotBank().setIndication(v);
        }
      });
    }

    // Setup some more random toggles.
    {
      // Groove (AKA Swing) Toggle.
      ext.groove.getEnabled().value().addValueObserver(2, (v) => {
        ext.buttons.getButton(Button.StopClip).setShiftedColour(v > 0 ? Colours.Bitwig : Colours.Shifted);
        if (Layer.isButtonHeld(Button.Shift)) {
          ext.buttons.getButton(Button.StopClip).drawShifted();
        }
      });

      // Record Quantize toggle.
      ext.app.recordQuantizationGrid().addValueObserver((v) => {
        const enabled = v != "OFF" && v != "off";
        if (enabled) {
          this.state.quantizeGrid = v;
        }
        ext.buttons.getButton(Button.Quantize).setShiftedColour(enabled ? Colours.Bitwig : Colours.Shifted);
        if (Layer.isButtonHeld(Button.Shift)) {
          ext.buttons.getButton(Button.Quantize).drawShifted();
        }
      });

      // We want to access these in the Layers.
      ext.cursorClip.getLoopLength().markInterested();

    }

    // Grid orientation.
    {
      ext.app.panelLayout().addValueObserver((panel) => {
        if (panel == "EDIT") {
          // Ignore.
          return;
        }

        const a = (panel == "ARRANGE" || panel == "ARR");

        // Reflect Panel Choice on Track Mode Buttons
        ext.buttons.getButton(Button.LogoLed).setEnabled(a).setPulse().setShiftedColour(a ? Colours.Bitwig : Colours.Off);

        if (this.state.enablePanelSwitch) {
          ext.buttons.getButton(Button.Volume).setShiftedColour(a ? Colours.Bitwig : Colours.BitwigDim);
          ext.buttons.getButton(Button.Pan).setShiftedColour(a ? Colours.BitwigDim : Colours.Bitwig);
        }

        if (Layer.isButtonHeld(Button.Shift)) {
          ext.buttons.getButton(Button.LogoLed).drawShifted();
          ext.buttons.getButton(Button.Volume).drawShifted();
          ext.buttons.getButton(Button.Pan).drawShifted();
        } else {
          ext.buttons.getButton(Button.LogoLed).draw(this.state.orientation);
        }

        // Only Change Orientation if Following Bitwig
        if (ext.prefs.orientation.get() == "Follow Bitwig") {
          this.state.orientation = a ? Orientation.Arrange : Orientation.Mix;
          Layer.setOrientation(this.state.orientation);
        }
      });
    }

    // Project switching.
    {
      let rememberedProjectName: string = "";
      ext.app.projectName().addValueObserver((projectName) => {
        if (rememberedProjectName && rememberedProjectName !== projectName) {
          host.restart();
        }
        rememberedProjectName = projectName;
        println(`<Project changed='${projectName}'/>`);
      });
    }

    // Display Profile Switching
    {
      ext.app.displayProfile().addValueObserver((displayProfile) => {
        switch (displayProfile) {
          case "Single Display (Small)":
          case "Single Display (Large)":
          case "Dual Display (Master/Detail)":
          case "Tablet":
            this.state.enablePanelSwitch = true;
            break;
          case "Dual Display (Studio)":
          case "Dual Display (Arranger/Mixer)":
          case "Triple Display":
            ext.buttons.getButton(Button.Volume).setShiftedColour(Colours.Off);
            ext.buttons.getButton(Button.Pan).setShiftedColour(Colours.Off);
            this.state.enablePanelSwitch = false;
            break;
        }
      });
    }

    // Transports.
    // Simple and Global, handled outside the layers (like the Grid).
    {
      ext.transport.isPlaying().addValueObserver((isPlaying) => {
        ext.buttons.getButton(Button.Play).setSelected(isPlaying).draw(this.state.orientation);
      });

      ext.transport.isClipLauncherOverdubEnabled().addValueObserver((enabled) => {
        ext.buttons.getButton(Button.Record).setColour(enabled ? Colours.Bitwig : Colours.Deselected).draw(this.state.orientation);
        Layer.getCurrent().updateRecordingState();
      });

      ext.transport.isMetronomeEnabled().addValueObserver((v) => {
        ext.buttons.getButton(Button.Solo).setShiftedColour(v ? Colours.Bitwig : Colours.Shifted);
        if (Layer.isButtonHeld(Button.Shift)) {
          ext.buttons.getButton(Button.Solo).drawShifted();
        }
      });

      ext.transport.clipLauncherPostRecordingAction().addValueObserver((v) => {
        const enabled = v != "OFF" && v != "off";
        if (enabled) {
          this.state.fixedLength = v;
        }
        ext.buttons.getButton(Button.FixedLength).setSelected(enabled).draw(this.state.orientation);
      });

      ext.transport.getPosition().markInterested();
      ext.cursorTrack.arm().markInterested();
      ext.cursorTrack.isStopped().markInterested();
    }

    // Scrolling.
    {
      ext.trackBank.canScrollChannelsUp().addValueObserver((canScroll: boolean) => {
        Layer.setScroll('tracksUp', canScroll);
      });
      ext.trackBank.canScrollChannelsDown().addValueObserver((canScroll: boolean) => {
        Layer.setScroll('tracksDown', canScroll);
      });

      ext.sceneBank.canScrollForwards().addValueObserver((canScroll: boolean) => {
        Layer.setScroll('scenesDown', canScroll);
      });
      ext.sceneBank.canScrollBackwards().addValueObserver((canScroll: boolean) => {
        Layer.setScroll('scenesUp', canScroll);
      });

      ext.cursorDevice.hasNext().addValueObserver((canScroll: boolean) => {
        Layer.setScroll('devicesDown', canScroll);
      });
      ext.cursorDevice.hasPrevious().addValueObserver((canScroll: boolean) => {
        Layer.setScroll('devicesUp', canScroll);
      });

      ext.cursorRemote.hasNext().addValueObserver((canScroll: boolean) => {
        Layer.setScroll('remoteDown', canScroll);
      });
      ext.cursorRemote.hasPrevious().addValueObserver((canScroll: boolean) => {
        Layer.setScroll('remoteUp', canScroll);
      });
    }

    // Scene Bank.
    {
      for (let sceneIdx = 0; sceneIdx < LaunchPad.numScenes; sceneIdx++) {
        const scene = ext.sceneBank.getItemAt(sceneIdx);
        scene.exists().addValueObserver((v) => {
          Layer.setSceneEnabled(sceneIdx, v);
        });

        scene.color().addValueObserver((r, g, b) => {
          const colour = Colour.fromRGBFloat([r, g, b]);
          Layer.setSceneColour(sceneIdx, colour);
        });
      }
    }

    // Track Bank.
    {
      for (let trackIdx = 0; trackIdx < LaunchPad.numTracks; trackIdx++) {
        const track = ext.trackBank.getItemAt(trackIdx);
        const slotBank = track.clipLauncherSlotBank();
        const sendBank = track.sendBank();

        // Faders
        // Note: Devices Handled later.
        track.volume().value().addValueObserver(128, (v) => {
          Layers.Volume.setTrackFader(trackIdx, v);
        });
        track.pan().value().addValueObserver(128, (v) => {
          Layers.Pan.setTrackFader(trackIdx, v);
        });

        // Track Buttons
        track.addIsSelectedInEditorObserver((v) => {
          Layers.Session.setTrackToggle(trackIdx, v);
          Layer.getCurrent().updateRecordingState();
        });
        track.arm().addValueObserver((v) => {
          Layers.RecordArm.setTrackToggle(trackIdx, v);
          // Update Grid
          for (let slotIdx = 0; slotIdx < LaunchPad.numScenes; slotIdx++) {
            const slot = slotBank.getItemAt(slotIdx);
            const cell = ext.grid.getCellByTrackAndClip(trackIdx, slotIdx);
            if (!slot.hasContent().get()) {
              cell.setEmpty(v).draw(this.state.orientation);
              if (slot.isRecordingQueued().get()) {
                track.stop();
              }
            }
          }
          Layer.getCurrent().updateRecordingState();
        });
        track.mute().addValueObserver((v) => {
          Layers.Mute.setTrackToggle(trackIdx, v);
        });
        track.solo().addValueObserver((v) => {
          Layers.Solo.setTrackToggle(trackIdx, v);
        });
        track.exists().addValueObserver((v) => {
          Layer.getCurrent().setTrackExists(trackIdx, v);
          Layer.setTrackEnabled(trackIdx, v);
        });
        track.isStopped().addValueObserver((v) => {
          Layers.StopClip.setTrackToggle(trackIdx, !v);
        });
        track.color().addValueObserver((r, g, b) => {
          const colour = Colour.fromRGBFloat([r, g, b]);
          Layer.setTrackColour(trackIdx, colour);
        });

        // Track's Sendbank
        for (let sendIdx = 0; sendIdx < LaunchPad.numSends; sendIdx++) {
          sendBank.getItemAt(sendIdx).value().addValueObserver(128, (v) => {
            Layers.Sends.setSendFader(trackIdx, sendIdx, v);
          });
        }

        sendBank.itemCount().addValueObserver((v) => {
          Layers.Sends.setPages(v);
        }, 0);

        // Track's Slot Bank.
        for (let sceneIdx = 0; sceneIdx < LaunchPad.numSends; sceneIdx++) {
          slotBank.getItemAt(sceneIdx).isRecordingQueued().markInterested();
        }

        slotBank.addHasContentObserver((slotIdx, v) => {
          const cell = ext.grid.getCellByTrackAndClip(trackIdx, slotIdx);
          if (!v) {
            cell.setEmpty(track.arm().get());
          } else {
            cell.setStopped(false);
          }
          cell.draw(this.state.orientation);
          Layer.getCurrent().updateRecordingState();
        });

        slotBank.addPlaybackStateObserver((slotIdx, playbackState, isQueued) => {
          const cell = ext.grid.getCellByTrackAndClip(trackIdx, slotIdx);
          const slot = slotBank.getItemAt(slotIdx);
          switch (playbackState) {
            case 0: // Stop
              if (slot.hasContent().get()) {
                cell.setStopped(isQueued);
              } else {
                cell.setEmpty(track.arm().get());
              }
              break;
            case 1: // Play
              cell.setPlaying(isQueued);
              break;
            case 2: // Record
              cell.setRecording(isQueued);
              break;
          }
          Layer.getCurrent().updateRecordingState();
          cell.draw(this.state.orientation);
        });

        slotBank.addIsSelectedObserver((slotIdx, v) => {
          const cell = ext.grid.getCellByTrackAndClip(trackIdx, slotIdx);
          cell.setSelected(v).draw(this.state.orientation);
        });

        slotBank.addColorObserver((slotIdx, r, g, b) => {
          const colour = Colour.fromRGBFloat([r, g, b]);
          const cell = ext.grid.getCellByTrackAndClip(trackIdx, slotIdx);
          cell.setColour(colour).draw(this.state.orientation);
        });
      }
    }

    // Selected Device.
    {
      ext.cursorRemote.pageCount().addValueObserver((v) => {
        Layers.Device.setPages(v);
      }, 0);

      ext.cursorRemote.selectedPageIndex().addValueObserver((v) => {
        Layers.Device.setPageIdx(v);
      }, -1);

      for (let controlIdx = 0; controlIdx < LaunchPad.numTracks; controlIdx++) {
        ext.cursorRemote.getParameter(controlIdx).exists().addValueObserver((v) => {
          ext.launchPad.stopFaders(FaderBank.Device);

          let msg = `${SysexPrefix} 01 03 ${Layer.getCurrent().getOrientation()} `;
          const colour = v ? "35" : "00";
          msg += `0${controlIdx} 00 3${controlIdx} ${colour} F7`;
          ext.midiDawOut.sendSysex(msg);

          // Update Value.
          const level = (ext.cursorRemote.getParameter(controlIdx).value().get() * 127) | 0;
          ext.midiDawOut.sendMidi(180, controlIdx + 0x30, level);
        });

        ext.cursorRemote.getParameter(controlIdx).value().addValueObserver(128, (v) => {
          Layers.Device.setTrackFader(controlIdx, v);
          ext.midiDawOut.sendMidi(180, controlIdx + 0x30, v);
        });
      }
    }

    // Track Selected Slot.
    {

      ext.cursorClip.clipLauncherSlot().sceneIndex().markInterested();
      ext.cursorClip.clipLauncherSlot().isRecording().markInterested();
      ext.cursorClip.clipLauncherSlot().isRecordingQueued().markInterested();

      ext.cursorClip.clipLauncherSlot().isSelected().addValueObserver((v) => {
        Layer.selectedSlotHasContent = v;
        Layer.getCurrent().updateNotesLayout();
      });

      ext.cursorClip.clipLauncherSlot().hasContent().addValueObserver((v) => {
        Layer.selectedSlotHasContent = v;
        Layer.getCurrent().updateNotesLayout();
      });
    }

    // Drum Rack Support.
    {
      ext.cursorTrackFirstDevice.hasDrumPads().addValueObserver((v) => {
        if (v) {
          ext.midiDawOut.sendSysex(`${SysexPrefix} 00 02 F7`);
        } else {
          ext.midiDawOut.sendSysex(`${SysexPrefix} 00 01 F7`);
        }
      });

      // Seems the safest way to track.
      ext.cursorTrack.playingNotes().addValueObserver((n) => {
        ext.drumPads.updateNotes(n);
      });

      for (let padIdx = 0; padIdx < LaunchPad.numDrumPads; padIdx++) {
        const drumPad = ext.cursorDrumPadBank.getItemAt(padIdx);

        drumPad.mute().addValueObserver((v) => {
          ext.drumPads.getPad(padIdx).setMuted(v).draw();
        });
        drumPad.solo().addValueObserver((v) => {
          ext.drumPads.getPad(padIdx).setSolo(v).draw();
        });
        drumPad.addIsSelectedInEditorObserver((v) => {
          ext.drumPads.getPad(padIdx).setSelected(v).draw();
        });
        drumPad.exists().addValueObserver((v) => {
          ext.drumPads.getPad(padIdx).setEnabled(v).draw();
        });
        drumPad.color().addValueObserver((r, g, b) => {
          const colour = Colour.fromRGBFloat([r, g, b]);
          ext.drumPads.getPad(padIdx).setColour(colour).draw();
        });
      }
    }

    // Kick it off.
    this.initSessionMode();
  }

  public initSessionMode() {
    // Enable Session Mode
    ext.midiDawOut.sendSysex(`${SysexPrefix} 10 01 F7`);
    this.setLayout(Layout.Session);
  }

  public deInitSessionMode() {
    // Disable Session Mode
    this.setLayout(Layout.Note);
    ext.midiDawOut.sendSysex(`${SysexPrefix} 10 00 F7`);
  }

  public stopFaders(faderBank: FaderBank) {
    // This is needed, when you really need to stop the fader, especially when adjusting banks.
    {
      this.state.ignoreFaders = true;
      host.scheduleTask(() => {
        ext.launchPad.state.ignoreFaders = false;
      }, 100);
    }
    ext.midiDawOut.sendSysex(`${SysexPrefix} 19 ${faderBank} F7`);
  }

  public setLayout(layout: string, faderBank: string = FaderBank.Volume) {
    switch (layout) {
      case Layout.Session:
      case Layout.Note:
      case Layout.Chord:
        ext.midiDawOut.sendSysex(`${SysexPrefix} 00 ${layout} 00 00 F7`);
        break;
      case Layout.Fader: {
        this.setFaderBank(faderBank);
        break;
      }
    }
  }

  private setFaderBank(faderBank: string) {
    switch (faderBank) {
      case FaderBank.Volume: {
        let msg = `${SysexPrefix} 01 00 ${Layer.getCurrent().getOrientation()} `;
        for (let trackIdx = 0; trackIdx < LaunchPad.numTracks; trackIdx++) {
          const colour = ext.trackBank.getItemAt(trackIdx).exists().get() ? "15" : "00";
          msg += `0${trackIdx} 00 0${trackIdx} ${colour}`;
        }
        msg += `F7`;
        ext.midiDawOut.sendSysex(msg);
        break;
      }
      case FaderBank.Pan: {
        const o = ext.prefs.panOrientation.get() == "Horizontal Only" ? "01" : Layer.getCurrent().getOrientation()
        let msg = `${SysexPrefix} 01 01 ${o} `;
        for (let trackIdx = 0; trackIdx < LaunchPad.numTracks; trackIdx++) {
          const colour = ext.trackBank.getItemAt(trackIdx).exists().get() ? "25" : "00";
          msg += `0${trackIdx} 01 1${trackIdx} ${colour}`;
        }
        msg += `F7`;
        ext.midiDawOut.sendSysex(msg);
        break;
      }
      case FaderBank.Sends: {
        let msg = `${SysexPrefix} 01 02 ${Layer.getCurrent().getOrientation()} `;
        for (let trackIdx = 0; trackIdx < LaunchPad.numTracks; trackIdx++) {
          const colour = ext.trackBank.getItemAt(trackIdx).exists().get() ? "2D" : "00";
          msg += `0${trackIdx} 00 2${trackIdx} ${colour}`;
        }
        msg += `F7`;
        ext.midiDawOut.sendSysex(msg);
        break;
      }
      case FaderBank.Device: {
        let msg = `${SysexPrefix} 01 03 ${Layer.getCurrent().getOrientation()} `;
        for (let controlIdx = 0; controlIdx < LaunchPad.numTracks; controlIdx++) {
          const colour = ext.cursorRemote.getParameter(controlIdx).exists().get() ? "35" : "00";
          msg += `0${controlIdx} 00 3${controlIdx} ${colour}`;
        }
        msg += `F7`;
        ext.midiDawOut.sendSysex(msg);
        break;
      }
    }
    ext.midiDawOut.sendSysex(`${SysexPrefix} 00 01 ${faderBank} 00 F7`);
  }

  public SysexCallback(data: string) {
    host.println(`<SysexCallback>\n  ${data}`);

    // Catch layout and page changes.
    if (!data.startsWith("f0002029020e00")) {
      // Don't care.
      return;
    }

    // Trim.
    data = data.replace("f0002029020e00", "");

    const layout = `${data[0]}${data[1]}`;
    const faderBank = `${data[2]}${data[3]}`;

    const previousLayout = Layer.currentLayout;
    const previousFaderBank = Layer.currentFaderBank;

    switch (layout) {
      case Layout.Session:
      case Layout.Note:
      case Layout.Chord:
      case Layout.Fader: {
        Layer.currentFaderBank = faderBank;
        Layer.currentLayout = layout;
        Layer.getCurrent().onLayoutPush(layout, previousLayout);
        break;
      }
      default:
        break;
    }
    host.println("</SysexCallback>");
  }

  public MidiCallback(status: number, data1: number, data2: number) {
    println(`<MidiCallback>\n  ${status}: ${data1}, ${data2}`);

    // Handle LP control buttons
    if (status === 176) {

      // Set Pushed State.
      const pushed = data2 > 1;
      const button = /** @type {Button} */(data1);
      switch (button) {
        case Button.Scene0:
        case Button.Scene1:
        case Button.Scene2:
        case Button.Scene3:
        case Button.Scene4:
        case Button.Scene5:
        case Button.Scene6:
        case Button.Scene7: {
          // Handle Orientation Pre-Layer.
          const idx = Buttons.sceneButtonCCToIdx(button);
          if (Layer.getCurrent().ignoreOrientation || ext.launchPad.state.orientation == Orientation.Mix) {
            if (pushed) {
              Layer.setButtonHeld(button, pushed);
              Layer.getCurrent().onScenePush(idx);
            } else {
              Layer.setButtonHeld(button, pushed);
              Layer.getCurrent().onSceneRelease(idx);
            }
          } else {
            if (pushed) {
              Layer.setButtonHeld(button, pushed);
              Layer.getCurrent().onTrackPush(idx);
            } else {
              Layer.setButtonHeld(button, pushed);
              Layer.getCurrent().onTrackRelease(idx);
            }
          }
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
          // Handle Orientation Pre-Layer.
          const idx = Buttons.trackButtonCCToIdx(button);
          if (Layer.getCurrent().ignoreOrientation || ext.launchPad.state.orientation == Orientation.Mix) {
            if (pushed) {
              Layer.setButtonHeld(button, pushed);
              Layer.getCurrent().onTrackPush(idx);
            } else {
              Layer.setButtonHeld(button, pushed);
              Layer.getCurrent().onTrackRelease(idx);
            }
          } else {
            if (pushed) {
              Layer.setButtonHeld(button, pushed);
              Layer.getCurrent().onScenePush(idx);
            } else {
              Layer.setButtonHeld(button, pushed);
              Layer.getCurrent().onSceneRelease(idx);
            }
          }
          break;
        }
        default:
          if (pushed) {
            Layer.setButtonHeld(button, pushed);
            Layer.getCurrent().onButtonPush(button);
          } else {
            Layer.setButtonHeld(button, pushed);
            Layer.getCurrent().onButtonRelease(button);
          }
          break;
      }
    }

    // Handle grid note buttons
    if (status === 144) {
      const pushed = data2 > 1;
      if (pushed) {
        Layer.getCurrent().onGridPush(data1);
      } else {
        Layer.getCurrent().onGridRelease(data1);
      }
    }

    // Handle LP Faders
    // CC / Ch 5
    if (status === 180 && !ext.launchPad.state.ignoreFaders) {
      const value = data2 / 127;
      if (data1 < 0x10) {
        ext.trackBank.getItemAt(data1).volume().set(value);
      } else if (data1 < 0x20) {
        ext.trackBank.getItemAt(data1 - 0x10).pan().set(value);
      } else if (data1 < 0x30) {
        ext.trackBank.getItemAt(data1 - 0x20).sendBank().getItemAt(Layers.Sends.getPageIdx()).setImmediately(value);
      } else if (data1 < 0x40) {
        ext.cursorRemote.getParameter(data1 - 0x30).value().set(value);
      }
    }
    host.println("</MidiCallback>");
  }
}
