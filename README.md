# Launchpad Pro Mk3 for Bitwig

## Acknowledgements

First and foremost, I want to thank [Fannon](https://github.com/Fannon/Launchpad-Pro-Mk3-Bitwig-Controller) for the inspiration to make this script. I started with thier project, but it quickly grew into something else. There is some shreds of the original, I really appreciate the kickstart. Also thank you [Moss](https://github.com/git-moss/DrivenByMoss), your script has been a great reference; also if you want something beyond what the LP Mk3 says on the panel, go check that out.

## Description

I wanted a controller script that match the functionality that Novation provides for Ableton. I Implemented it based on the LP Pro manual for Ableton Live. So with a few exceptions, it does what it says on the panel/buttons. It also supports a rotated view for Arranger mode, Multiple Devices and remote pages, 8 Sends per channel and more. The standalone features Notes and Chord mode will work seamlessly in Bitwig.

Obviously there are some differences to Ableton, but Bitwig is different. Print to Clip, Capture MIDI are the notable omissions and there may be a few other minor differences not noted here, enjoy!

## Setup

- Download the latest release on this page.
- Unzip and copy `Launchpad-Pro-Mk3-for-Bitwig_x.x.x` folder to your Bitwig **My Controller Scripts** location.
- Go to **Bitwig** > **Settings** > **Controllers**.
  - Add the Controller (Novation Launchpad Mk3).
  - Depending on the OS, your device names maybe different, but you want the "Launchpad Pro MK3 LPProMK3 DAW" device in the first slot of input and output, and you want the "Launchpad Pro MK3 LPProMK3 MIDI" device in the 2nd slot of each pair.

## How to Use

You can follow along with the Novation Manual for most things. I will only cover the differences here.

- You will notice that Flashing and Pulsing LEDs may stop flashing or pulsing, Play/Stop to send a clock signal to the LaunchPad to set thier rate. Ableton always sends a clock, so this is not noticable when using ableton. Bitwig only sends a clock when the transport is running.
- The shift functions **Print to Clip** and **Capture MIDI** are not currently functions that exist in Bitwig.
- There is no "Session Overview" implemented, but...
- **Shift + Arrows** will scroll the Grid 1 page (8 tracks/scenes) at a time.
- **Fixed Length** will toggle your **Post recording Action / delay** option between your setting, and **Off**. There is no controls to adjust the length, you can do that in the **Play** menu in Bitwig. White for disabled, orange for enabled.
- **Swing** is called **Groove** in Bitwig. White for disabled, orange for enabled.
- **Shift + Play** will reset your playhead to the start of the arranger. If you manually set the start point, then the **Play** button on it's own will start and stop from that point, very handy if you want to work on a section of your track.
- **Shift + • (Volume)** and **Shift + •• (Pan)** will change your Bitwig view to **Arrange** and **Mix** respectively.
  - You can have the Launchpad UI rotate automatically if you set your **Grid Orientation** to **Follow Bitwig**.
  - You can also force your Launchpad to stay in a single orientation with this setting.
  - When Bitwig is in Arranger mode, the Novation logo will pulse orange.
  - *Note: The **Scene** and **Track Select** buttons will be swapped when the Launchpad is in Arranger Mode. This is fine most of the time, but access to the **Scene** buttons is lost when you use any of the standalone modes on the Launchpad, I can't change this.*
- The **Track Select** buttons will reset the default values of the corresponding fader on the 4 fader pages: **Volume**, **Pan**, **Sends**, **Device**.
- **Pan** is implemented to match the grid orientation, **Fader Up** = **Pan Right**, **Fader Down** = **Pan Left**. You can change this the Controller settings.
- **Volume**, **Pan**, **Sends** will all be rotated if you are in Arrange Orientation on the Launchpad.
- **Sends** will show you the 8 Remote controls on the selected Track. (These faders will not rotate for Arrange Orientation)
  - Use the **Up/Down** arrows and **Scene** buttons to select the sends.
  - Use the **Left/Right** arrows will still scroll the tracks.
- **Device** will show you the 8 Remote controls on the selected Track. (These faders will not rotate for Arrange Orientation)
  - Use the **Up/Down** arrows and **Scene** buttons to select the Remote Control Page.
  - Use the **Left/Right** arrows move through the devices in the track.
- **Notes** mode will change to **Drum** mode when a track has a **Drum Machine** in it. You will be able to access 4 Pages of the **Drum Machine** from the LaunchPad. Starting from the Page 1 on the bottom-left quadrant, to Page 2 on the top-left, Page 3 on the bottom-right, and Page 4 on the top-right.
- The **Record** Button, more of an **Overdub** button...
  - It is **not** connected to the Arranger Mode Record in Bitwig.
  - This button works similarily to the Ableton version, in that it toggle Overdub (Session Record in Ableton) on for the Clip Launcher. White for disabled, orange for enabled. 
  - If you record a clip from the grid, you can also use the **Record** button to finish recording (so you don't need to hunt for the grid button you pressed).
  - If you are in Notes/Drum or Chord Standalone pages there is additional behaviour:
    - If your selected track is Armed, and nothing in that track is playing, the **Record** button will be Red (not orange/white) and you can press record to record a new clip in the first available slot on that track. Pressing it a 2nd time will finish recording.
    - If the selected track has a playing clip, the **Record** button to toggle Overdub on and off. Your track will need to be armed in order for any overdubbing to take place.

## Build yourself (thanks again Fannon)

- Install [Node.js](https://nodejs.org/en/)
- Check out this repository via Git
- `npm install`
- `npm run build`
- Copy the contents from the `./dist` folder into your Bitwig "My Controller Scripts" location
  - Consider creating a subfolder for this, e.g. `Launchpad-Pro-Mk3-for-Bitwig`
  - If you actively develop / try around, creating a symlink can be more convenient

## Features / Pull Requests / Forks
- I'm likely to fix bugs or improve behaviour, but less likely to add anything else. *FAFO—* Make an issue or pull request and we'll see where it goes.
- Fork away, this has the functionality I was looking to implement, you want to launch point for your own project, have at it!
- Released under GPL.
