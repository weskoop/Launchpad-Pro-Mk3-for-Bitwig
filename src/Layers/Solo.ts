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
class SoloLayer extends Layer {
  activate() {
    Layer.maybeSetSessionLayout();
    ext.buttons.setAllTrackButtonColours(Colours.SoloDim, Colours.Solo, this.getOrientation());
    this.selectTrackMode(Button.Solo);
    this.setGridModButtons(true);
  }

  onButtonPush(btn: Button) {
    if (Layer.isButtonHeld(Button.Shift)) {
      this.parent.onButtonPush(btn);
      return;
    }

    switch (btn) {
      case Button.Solo:
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

    ext.trackBank.getItemAt(idx).solo().toggle(!Layer.isAnyTrackButtonHeld(idx));
  }
}