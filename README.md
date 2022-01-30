# Launchpad Pro Mk3 for Bitwig (Bitwig Controller Script)

A Bitwig controller script that matches (and expands) the functionality that Novation and Ableton provide for Live. It was implemented based on the Launchpad Pro Mk3 manual feature descriptions, so the Launchpad will do what it says on the buttons. 

The standalone features of the Launchpad, Notes/Chord/Custom modes and the Sequencer will all work seamlessly in Bitwig.

Bitwig is different from Ableton Live, so there are a few differences. Specific to Bitwig, this script supports a rotated view for Arrange view, Multiple Devices and remote pages, 8 Sends per channel and more. 

Enjoy!

*PS—If you want something that goes beyond what the Launchpad says on the buttons, check out [DrivenByMoss](https://github.com/git-moss/DrivenByMoss).*

## Setup

1. Download the [latest release (not source)](https://github.com/weskoop/Launchpad-Pro-Mk3-for-Bitwig/releases) from the releases section on the right of this page.
2. Unzip and copy the `Launchpad-Pro-Mk3-for-Bitwig_1.x` folder to your Bitwig **My Controller Scripts** location.
3. Restart **Bitwig** and open **Settings** > **Controllers**.
4. Add the Controller (**Novation** > **Launchpad Pro Mk3**).
   - *Note: Depending on your OS or configuration, your device names may differ.*
   - **macOS**: Select "*Launchpad Pro MK3 LPProMK3 DAW*" device in the first slot of input and output, and "*Launchpad Pro MK3 LPProMK3 MIDI*" device in the 2nd slot of each pair.
   - **Windows**: Select "*MIDIIN3 (LPProMK3 MIDI)*" device in the first slot as input, "*MIDIOUT3 (LPProMK3 MIDI)*" as output, and "*LPProMK3 MIDI*" device in the 2nd slot of each pair.

     ![Screenshot of Bitwig Controllers Settings](/Resources/Controllers.png)

5. Go to **Bitwig** > **Settings** > **Synchronization**.
   - *Note: Depending on your OS or configuration, your device names may differ.*
   - Send **Clock** and **Start/Stop** to the **Launchpad Pro Mk3** devices.
     
     ![Screenshot of Bitwig Synchronization Settings](/Resources/Synchronization.png)

6. When the Launchpad connects, you will be presented with the controller options.
    - **Grid > Orientation**: Allows a Rotated view on the Grid to match the clip layout of Bitwig.
       - **Mix** view matches the standard Launchpad orientation. Most of this documentation will refer to Mix orientation.
       - **Arrange** will be rotated to match the clip launcher in the Arrange View of Bitwig. The navigation arrows will adjust automatically. *Note that this will also swap the Track Selection Buttons with the Scene Launch buttons on the Launchpad UI. This is mostly a non issue, except in the standalone Launchpad modes, the scene buttons are disabled.*
       - **Follow Bitwig** Will swap between Arrange and Mix orientations as you change the view in Ableton or with the Launchpad (**Shift + •** and **Shift + ••**).
   - **Grid > Pan Fader**: Control the orientation of the Pan Faders
     - **Follow Orientation** will match the Grid Orientation option above; this will make the fader match the orientation of the Volume Faders, depending on Mix or Arrange view. When they are vertical, **Fader Up = Pan Right** and **Fader Down = Pan Left**.
     - **Horizontal Only**, left is left, right is right.
   - **Indicators > Scene / Slots**: Will show you, in Bitwig, which scenes and slots are reflected on the LaunchPad.

## How to Use

You can follow along with section **5. Session Mode** of the [Novation Launchpad Mk3 Manual](https://customer.focusrite.com/en/support/downloads?brand=Novation&product_by_range=1386&download_type=user-guides). I will only cover the differences here, keeping the same headings, any missing section are already covered, and work the same here.

### 5.1 <strike>Ableton Live’s</strike> Session View
The shift function **Capture MIDI** is not a feature currently offered in Bitwig. 

### 5.2 Session Overview
There is no "Session Overview" implemented but...
- **Shift + Up/Down/Left/Right** will scroll the grid 1 page (8 tracks/scenes) at a time.

### 5.3 Clip Functions

#### 5.3.7 Fixed Length
- **Fixed Length** will toggle your **Post recording Action / delay** option between your configured setting, and **Off**. There is no controls on the Launchpad adjust the length, you can do that in the **Play** menu in Bitwig. White for disabled, orange for enabled. Setting to **Post recording Action / delay** to **Play Recorded** and setting a length will match Ableton Live's functionality.

#### 5.4.4 Volume
*Orientation changes will rotate these faders.*
- The **Track Select Buttons** will reset your track to the default volume.
  
#### 5.4.5 Pan
*Orientation changes will rotate these faders.*
- The **Track Select Buttons** will reset your track to center pan.
- Orientation of these faders is as you configured (or didn't) in the Controller Settings.

#### 5.4.6 Send
*Orientation changes will rotate these faders.*
- The **Track Select Buttons** will reset your track the send to zero.
- Use the **Up/Down** arrows* and **Scene** (1-8) buttons to select the send. (*Arrange orientation will rotate these)

#### 5.4.7 Device
*Orientation changes will **NOT** affect these faders. They are always vertical.*
- These 8 faders represent the 8 remote controls on the currently selected Device in Bitwig.
- - The **Track Select Buttons** will reset the control to the default.
- Use the **Up/Down** arrows and **Scene** (1-8) buttons to select the Remote Control Page.
- Use the **Left/Right** arrows move through the devices in the track.

#### 5.4.9 Fader orientation
- Covered above. We allow for matching the Bitwig Arrange view. This is one of the Bitwig specific upgrades here.

### 5.5 Record Arm & Recording
*The **Record** button is more of an **Overdub** button.*
- It is **not** connected to the Arrange view Record button in Bitwig.
- This button works similarly to the Ableton version, in that it toggle Clip Overdub (aka Session Record in Ableton Live) on for the Clip Launcher. White for disabled, orange for enabled.
- Your track will need to be armed in order for any overdubbing to take place.
- If you record a clip from the grid, you can also use the **Record** button to finish recording (so you don't need to hunt for the grid button you pressed).
- If your selected track is **Armed**, pressing **Shift + Record** will record a new clip in the first available slot on that track. Pressing it a 2nd time will finish recording (as described above). When holding shift, your **Record** button will be red (not orange/white) when this function is available.

### 5.6 Production Controls
*Along with the features covered in the Novation manual, we have a few others.*
- **Shift + • (Volume)** and **Shift + •• (Pan)** will change your Bitwig view to **Arrange** and **Mix** respectively.
  - When Bitwig is in Arrange view, the Novation logo will pulse orange.
  - You can have the Launchpad UI rotate automatically if you set your **Grid > Orientation** to **Follow Bitwig**.
  - Depending on your Display Profile, these options may or may not be available, you may want to fix your **Grid > Orientation** in that case.
- **Shift + Swing** will toggle **Groove** in Bitwig. White for disabled, orange for enabled.
- **Shift + Play** will reset your play head to the start of the arrange timeline. If you manually set the start point, then the **Play** button on it's own will start and stop from that point, very handy if you want to work on a section of your track.


### 5.7 Momentary View Switching
This feature actually works much better here than when connected to Ableton Live.

### 6.6 Drum Mode
- **Notes** mode will change to **Drum** mode when a track has a **Drum Machine** in it. You will be able to access 4 Pages of the **Drum Machine** from the LaunchPad. Starting from the Page 1 on the bottom-left quadrant, to Page 2 on the top-left, Page 3 on the bottom-right, and Page 4 on the top-right.
- The **Arrows** will not affect the Grid placement, unlike the Ableton Live integration, the Grid notes are fixed here.

### 9. Sequencer
#### 9.11 Print to Clip
The shift function **Print to Clip** is not a feature currently offered in Bitwig.

### Errata / Tips
- You may notice that Flashing and Pulsing LEDs will stop flashing or pulsing, Toggle **Play** on and off to send a clock signal to the LaunchPad so it can set the flash/pulse rate. Ableton always sends a clock, so this is not noticeable when using ableton. Bitwig only sends a clock when the transport is running.
- If you change Display Profiles, you will need to disconnect and reconnect the controller for all of it's function to work properly.

---

## Developer Notes

### Features / Pull Requests / Forks
- I'm likely to fix bugs or improve behaviour, but less likely to add anything else. *FAFO—* Make an issue or pull request and we'll see where it goes.
- 
- Fork away, this has the functionality I was looking to implement, you want to launch point for your own project, have at it!
- Released under GPL.


### Build yourself (thanks Fannon)

- Install [Node.js](https://nodejs.org/en/)
- Check out this repository via Git
- `npm install`
- `npm run build`
- Symlink or copy the contents from the `./dist` folder into your Bitwig "My Controller Scripts" location
  - Consider creating a subfolder for this, e.g. `Launchpad-Pro-Mk3-for-Bitwig`

### Additional Resources

- [Launchpad Pro Mk3 Programmer's Reference Guide](https://fael-downloads-prod.focusrite.com/customer/prod/s3fs-public/downloads/LPP3_prog_ref_guide_200415.pdf)


### Hat tips

First and foremost, I want to thank [Fannon](https://github.com/Fannon/Launchpad-Pro-Mk3-Bitwig-Controller) for the inspiration to make this script. I started with their project, but it quickly grew into something else. There is some shreds of the original still in there. 

Also Jürgen Mossgraber and [DrivenByMoss](https://github.com/git-moss/DrivenByMoss) are a great reference for any Bitwig controller script programming.
