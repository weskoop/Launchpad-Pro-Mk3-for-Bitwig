/**
 * LaunchWig Pro Mk3 — LaunchPad Pro Mk3 for Bitwig
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
loadAPI(15);
host.setShouldFailOnDeprecatedUse(true);

host.load("Colour.js");
host.load("Buttons.js");
host.load("Grid.js");
host.load("DrumPads.js");
host.load("Layer.js");
host.load("Layers/Session.js");
host.load("Layers/RecordArm.js");
host.load("Layers/Mute.js");
host.load("Layers/Solo.js");
host.load("Layers/Volume.js");
host.load("Layers/Pan.js");
host.load("Layers/Sends.js");
host.load("Layers/Device.js");
host.load("Layers/StopClip.js");
host.load("LaunchPad.js");

/**
 * Define Controller
 */
host.defineController(
  "Novation",
  "Launchpad Pro Mk3",
  "0.69",
  "9d5472df-446a-40c5-802b-2aca05ef091d",
  "slow wild"
);

host.defineMidiPorts(2, 2);

// macOS:
host.addDeviceNameBasedDiscoveryPair(
  ["Launchpad Pro MK3 LPProMK3 DAW", "Launchpad Pro MK3 LPProMK3 MIDI"],
  ["Launchpad Pro MK3 LPProMK3 DAW", "Launchpad Pro MK3 LPProMK3 MIDI"]
);

// Windows:
host.addDeviceNameBasedDiscoveryPair(
  ["MIDIIN3 (LPProMK3 MIDI)", "LPProMK3 MIDI"],
  ["MIDIOUT3 (LPProMK3 MIDI)", "LPProMK3 MIDI"]
);

const Layers = {
  Session: new SessionLayer(),
  RecordArm: new RecordArmLayer(),
  Mute: new MuteLayer(),
  Solo: new SoloLayer(),
  Volume: new VolumeLayer(),
  Pan: new PanLayer(),
  Sends: new SendsLayer(),
  Device: new DeviceLayer(true), // ignoreOrientation = true
  StopClip: new StopClipLayer(),
}

type SettableValue = com.bitwig.extension.controller.api.SettableBeatTimeValue
  | com.bitwig.extension.controller.api.SettableBooleanValue
  | com.bitwig.extension.controller.api.SettableColorValue
  | com.bitwig.extension.controller.api.SettableDoubleValue
  | com.bitwig.extension.controller.api.SettableEnumValue
  | com.bitwig.extension.controller.api.SettableIntegerValue
  | com.bitwig.extension.controller.api.SettableRangedValue
  | com.bitwig.extension.controller.api.SettableStringArrayValue
  | com.bitwig.extension.controller.api.SettableStringValue
  ;

// @ts-ignore
const ext: {
  // Bitwig API
  app: API.Application;
  midiDawOut: API.MidiOut;
  midiNotesOut: API.MidiOut;
  trackBank: API.TrackBank;
  sceneBank: API.SceneBank;
  transport: API.Transport;
  groove: API.Groove;
  cursorClip: API.Clip;
  cursorTrack: API.CursorTrack;
  cursorDevice: API.PinnableCursorDevice;
  cursorTrackFirstDevice: API.PinnableCursorDevice;
  cursorRemote: API.CursorRemoteControlsPage;
  cursorDrumPadBank: API.DrumPadBank;
  prefs: Record<string, SettableValue>;
  // Our API
  grid: Grid;
  buttons: Buttons;
  drumPads: DrumPads;
  launchPad: LaunchPad;
} = {
  grid: new Grid(),
  buttons: new Buttons(),
  drumPads: new DrumPads(),
  launchPad: new LaunchPad(),
  prefs: {},
};

/**
 * BitWig Controller API Functions
 */
function init() {
  println("<init controller='Launchpad Mk3 Pro'>");

  // Setup Output Ports.
  ext.midiDawOut = host.getMidiOutPort(0);
  ext.midiNotesOut = host.getMidiOutPort(1);

  // Setup Input Ports.
  let midiDawIn = host.getMidiInPort(0);
  let midiNotesIn = host.getMidiInPort(1);

  // Novation has Locked the Drum view (alt view in Note mode) to Ch 9 of the DAW interface.
  // Maybe a be a clever reason for this, Maybe to avoid conflict with the Sequencers? ¯\_(ツ)_/¯.
  midiDawIn.createNoteInput("Drum", "98????");

  // Create input channels for other Modes.
  midiNotesIn.createNoteInput("All Channels", "??????");
  for (let i = 0; i < 16; i++) {
    // Don't include these in the All Inputs, since All Channels exists there already.
    midiNotesIn.createNoteInput(`Channel ${i + 1}`, `?${i.toString(16)}????`).includeInAllInputs().set(false);
  }

  ext.launchPad.init();

  midiDawIn.setMidiCallback(ext.launchPad.MidiCallback);
  midiDawIn.setSysexCallback(ext.launchPad.SysexCallback);

  println("</Init>");
}

function flush() {
  Layer.getCurrent().flush();
}

function exit() {
  ext.launchPad.deInitSessionMode();
}

