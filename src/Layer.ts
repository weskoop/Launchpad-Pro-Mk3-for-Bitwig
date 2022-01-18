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
class Layer {
  public ignoreOrientation: boolean;

  protected parent: Layer = this;
  protected trackToggles: boolean[] = [false, false, false, false, false, false, false, false];
  protected trackFaders: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

  constructor(ignoreOrientation: boolean = false) {
    this.ignoreOrientation = ignoreOrientation;
  }

  public getOrientation(): Orientation {
    return this.ignoreOrientation ? Orientation.Mix : Layer.orientation;
  }
  public hasParent(): boolean {
    return this.parent != Layer.null_layer && this.parent != this;
  }
  public getParent(): Layer { return this.parent; }
  public setParent(l: Layer) {
    if (this != l) {
      this.parent = l;
    }
  }

  public activate() { }
  public deactivate() { }

  //
  // Buttons
  //
  public onButtonPush(btn: Button) {
    if (this.hasParent()) { this.parent.onButtonPush(btn); }
  }
  public onButtonRelease(btn: Button) {
    if (this.hasParent()) { this.parent.onButtonRelease(btn); }
  }

  // No Release function, as it's triggered by Sysex
  public onLayoutPush(layout: string, previousLayout: string) {
    if (this.hasParent()) { this.parent.onLayoutPush(layout, previousLayout); }
  }

  public onGridPush(idx: number) {
    if (this.hasParent()) { this.parent.onGridPush(idx); }
  }
  public onGridRelease(idx: number) {
    if (this.hasParent()) { this.parent.onGridRelease(idx); }
  }

  public onScenePush(idx: number) {
    if (this.hasParent()) { this.parent.onScenePush(idx); }
  }
  public onSceneRelease(idx: number) {
    if (this.hasParent()) { this.parent.onSceneRelease(idx); }
  }

  public onTrackPush(idx: number) {
    if (this.hasParent()) { this.parent.onTrackPush(idx); }
  }
  public onTrackRelease(idx: number) {
    if (this.hasParent()) { this.parent.onTrackRelease(idx); }
  }

  public onModePush(idx: number) {
    if (this.hasParent()) { this.parent.onModePush(idx); }
  }
  public onModeRelease(idx: number) {
    if (this.hasParent()) { this.parent.onModeRelease(idx); }
  }

  public setTrackFader(idx: number, value: number) {
    this.trackFaders[idx] = value;
    if (Layer.getCurrent() == this) {
      this.updateTrackFader(idx);
    }
  }

  public setTrackToggle(idx: number, state: boolean) {
    this.trackToggles[idx] = state;
    if (Layer.getCurrent() == this) {
      this.updateTrackAndSceneToggles();
    }
  }

  protected selectTrackMode(selected: Button = 0) {
    for (let i = 0; i < LaunchPad.numTracks; i++) {
      const btn = i + 1;
      ext.buttons.getButton(btn)
        .setSelected(selected == btn)
        .draw(this.getOrientation());
    }
  }

  protected selectScenePage(selected: number) {
    for (let i = 0; i < LaunchPad.numTracks; i++) {
      ext.buttons.getSceneButton(i)
        .setSelected(selected == i)
        .draw(this.getOrientation());
    }
  }

  // Use this to toggle the modifier buttons for grid Cells.
  protected setGridModButtons(enabled: boolean) {
    ext.buttons.getButton(Button.Duplicate).setShiftedColour(enabled ? Colours.Shifted : Colours.Off);
    ext.buttons.getButton(Button.Clear).setEnabled(enabled).draw(this.getOrientation());;
    ext.buttons.getButton(Button.Duplicate).setEnabled(enabled).draw(this.getOrientation());;
    ext.buttons.getButton(Button.Quantize).setEnabled(enabled).draw(this.getOrientation());;
  }

  public updateTrackFader(idx: number) { }
  public updateTrackFaders() {
    for (let i = 0; i < LaunchPad.numTracks; i++) {
      this.updateTrackFader(i);
    }
  }

  public updateTrackColours() { }
  public updateSceneColours() {
    ext.buttons.setEachSceneButtonColour(Layer.sceneColours, Colours.Play, this.getOrientation());
  }

  public updateTrackAndSceneToggles() {
    const o = this.getOrientation();
    for (let i = 0; i < LaunchPad.numTracks; i++) {
      ext.buttons.getTrackButton(i)
        .setEnabled(Layer.trackEnabled[i])
        .setSelected(this.trackToggles[i])
        .draw(o);
      ext.buttons.getSceneButton(i)
        .setEnabled(Layer.sceneEnabled[i])
        .draw(o);
    }
  }

  public updateScrolling() {
    if (this.hasParent()) {
      this.parent.updateScrolling();
    }
  }

  public updateOrientation() {
    if (this.hasParent()) {
      this.parent.updateOrientation();
    }
  }

  public updateNotesLayout() {
    if (this.hasParent()) {
      this.parent.updateNotesLayout();
    }
  }

  public updateRecordingState() {
    if (this.hasParent()) {
      this.parent.updateRecordingState();
    }
  }

  public flush() { }

  /**
   * Static Layer Management
   */
  public static null_layer: Layer = new Layer();
  private static default: Layer = Layer.null_layer;
  private static current: Layer = Layer.null_layer;

  private static buttonsHeld: boolean[] = [];

  public static momentaryButton: number = 0;
  public static previousLayer: Layer = Layer.null_layer;

  public static currentLayout: string = Layout.Session;
  public static previousLayout: string = Layout.Session;
  public static ignoreLayoutPush: boolean = false;

  public static currentFaderBank: string = FaderBank.Volume;
  public static previousFaderBank: string = FaderBank.Volume;

  public static selectedSlotHasContent: boolean = false;

  public static trackEnabled: boolean[] = [false, false, false, false, false, false, false, false];
  public static trackColours: Colour[] = [new Colour, new Colour, new Colour, new Colour, new Colour, new Colour, new Colour, new Colour];

  public static sceneEnabled: boolean[] = [false, false, false, false, false, false, false, false];
  public static sceneColours: Colour[] = [new Colour, new Colour, new Colour, new Colour, new Colour, new Colour, new Colour, new Colour];

  public static orientation: Orientation = Orientation.Mix;

  private static canScroll: any = {
    tracksUp: false,
    tracksDown: false,
    scenesUp: false,
    scenesDown: false,
    devicesUp: false,
    devicesDown: false,
    remoteUp: false,
    remoteDown: false,
    sendsUp: false,
    sendsDown: false,
  }

  public static setDefault(l: Layer) {
    Layer.default = l;
  }

  public static getCurrent(): Layer { return Layer.current; }
  public static setCurrent(l: Layer) {
    if (Layer.current != l) {
      Layer.current.deactivate();
      Layer.current = l;
      Layer.current.activate();
      Layer.current.updateTrackAndSceneToggles();
      Layer.current.updateScrolling();
      Layer.current.updateSceneColours();
      Layer.current.updateTrackColours();
    }
  }

  public static setToDefault() {
    Layer.current = Layer.default;
  }

  public static setToParent() {
    if (Layer.current.getParent() != Layer.null_layer) {
      Layer.setCurrent(Layer.current.getParent());
    }
  }

  public static setOverlay(l: Layer, parent: Layer = Layer.default) {
    if (parent == Layer.null_layer) {
      parent = Layer.current;
    }
    l.setParent(parent);
    Layer.setCurrent(l);
  }

  public static setButtonHeld(idx: number, state: boolean) {
    Layer.buttonsHeld[idx] = state;

    // Is Track Mode Button?
    if (idx <= 9 || idx == Button.Session) {
      if (state) {
        Layer.previousLayer = Layer.getCurrent();
        Layer.previousLayout = Layer.currentLayout;
        Layer.previousFaderBank = Layer.currentFaderBank;
        host.scheduleTask(() => {
          // Set this when you've held the button for a few hundred ms.
          Layer.momentaryButton = idx;
        }, 300);
      } else if (Layer.momentaryButton == idx) {
        Layer.setCurrent(Layer.previousLayer);
        if (Layer.previousLayout != Layer.currentLayout && Layer.previousLayout != Layout.Fader) {
          ext.launchPad.setLayout(Layer.previousLayout, Layer.previousFaderBank);
        }
      }
      Layer.momentaryButton = 0;
    }
  }

  public static clearButtonHeld() { return Layer.buttonsHeld.fill(false); }
  public static isButtonHeld(idx: number): boolean { return Layer.buttonsHeld[idx]; }
  public static isAnyButtonHeld(ignore_idx: number = -1): boolean {
    for (let i = 0; i < Layer.buttonsHeld.length; i++) {
      if (i == ignore_idx) continue;
      if (Layer.buttonsHeld[i] === true) return true;
    }
    return false;
  }
  public static isTrackModeButtonHeld(ignore_idx: number = -1): boolean {
    for (let i = 1; i <= 8; i++) {
      if (i == ignore_idx) continue;
      if (Layer.buttonsHeld[i] === true) return true;
    }
    return false;
  }
  public static isAnyTrackButtonHeld(ignore_idx: number = -1): boolean {
    for (let i = 101; i <= 108; i++) {
      if (i == ignore_idx) continue;
      if (Layer.buttonsHeld[i] == true) return true;
    }
    return false;
  }

  public static isNotesLayout() {
    return (Layer.currentLayout == Layout.Note) || (Layer.currentLayout == Layout.Chord);
  }


  public static setOrientation(o: Orientation) {
    Layer.orientation = o;
    Layer.getCurrent().updateOrientation();
    Layer.getCurrent().updateScrolling();
  }

  public static getScroll(dir: string) {
    return Layer.canScroll[dir];
  }

  public static setScroll(dir: string, canScroll: boolean) {
    Layer.canScroll[dir] = canScroll;
    Layer.getCurrent().updateScrolling();
  }

  public static setSceneColour(idx: number, colour: Colour) {
    Layer.sceneColours[idx] = colour;
    Layer.getCurrent().updateSceneColours();
  }

  public static setSceneEnabled(idx: number, state: boolean) {
    Layer.sceneEnabled[idx] = state;
    Layer.getCurrent().updateTrackAndSceneToggles();
  }

  public static setTrackColour(idx: number, colour: Colour) {
    Layer.trackColours[idx] = colour;
    Layer.getCurrent().updateTrackColours();
  }

  public static setTrackEnabled(idx: number, state: boolean) {
    Layer.trackEnabled[idx] = state;
    Layer.getCurrent().updateTrackAndSceneToggles();
  }

  public static maybeSetSessionLayout() {
    if (Layer.currentLayout == Layout.Fader) {
      Layer.ignoreLayoutPush = true;
      ext.launchPad.setLayout(Layout.Session);
    }
  }

}
