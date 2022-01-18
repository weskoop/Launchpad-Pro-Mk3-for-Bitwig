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
type RGB = [number, number, number];

const ColourMap: RGB[] = [
  [0, 0, 0],
  [179, 179, 179],
  [221, 221, 221],
  [255, 255, 255],
  [249, 179, 178],
  [245, 95, 94],
  [213, 96, 95],
  [173, 96, 96],
  [254, 243, 212],
  [249, 178, 90],
  [215, 139, 93],
  [174, 118, 95],
  [253, 238, 157],
  [254, 255, 82],
  [220, 221, 87],
  [178, 179, 92],
  [223, 255, 156],
  [199, 255, 84],
  [167, 221, 89],
  [134, 179, 93],
  [200, 255, 176],
  [121, 255, 86],
  [114, 221, 89],
  [107, 179, 93],
  [199, 254, 191],
  [122, 255, 135],
  [115, 221, 113],
  [107, 179, 104],
  [200, 255, 202],
  [123, 255, 203],
  [114, 219, 158],
  [107, 179, 127],
  [201, 255, 243],
  [124, 255, 233],
  [116, 221, 194],
  [108, 179, 149],
  [200, 243, 255],
  [121, 239, 255],
  [113, 199, 222],
  [106, 161, 180],
  [197, 221, 255],
  [114, 200, 255],
  [107, 162, 223],
  [102, 129, 181],
  [161, 141, 255],
  [101, 99, 255],
  [100, 98, 224],
  [99, 98, 181],
  [203, 179, 255],
  [159, 98, 255],
  [128, 98, 224],
  [117, 98, 181],
  [250, 179, 255],
  [247, 97, 255],
  [214, 97, 224],
  [174, 97, 181],
  [249, 179, 214],
  [246, 96, 195],
  [213, 96, 162],
  [174, 97, 141],
  [246, 117, 93],
  [228, 178, 90],
  [218, 194, 90],
  [160, 161, 93],
  [107, 179, 93],
  [108, 179, 139],
  [104, 141, 215],
  [101, 99, 255],
  [108, 179, 180],
  [139, 98, 247],
  [202, 179, 194],
  [138, 118, 129],
  [245, 95, 94],
  [243, 255, 156],
  [238, 252, 83],
  [208, 255, 84],
  [131, 221, 89],
  [123, 255, 203],
  [120, 234, 255],
  [108, 162, 255],
  [139, 98, 255],
  [199, 98, 255],
  [232, 140, 223],
  [157, 118, 95],
  [248, 160, 91],
  [223, 249, 84],
  [216, 255, 133],
  [121, 255, 86],
  [187, 255, 157],
  [209, 252, 212],
  [188, 255, 246],
  [207, 228, 255],
  [165, 194, 248],
  [212, 194, 251],
  [242, 140, 255],
  [246, 96, 206],
  [249, 193, 89],
  [241, 238, 85],
  [229, 255, 83],
  [219, 204, 89],
  [177, 161, 93],
  [108, 186, 115],
  [127, 194, 138],
  [129, 129, 162],
  [131, 140, 206],
  [201, 170, 127],
  [213, 96, 95],
  [243, 179, 159],
  [243, 185, 113],
  [253, 243, 133],
  [234, 249, 156],
  [214, 238, 110],
  [129, 129, 162],
  [249, 249, 211],
  [224, 252, 227],
  [233, 233, 255],
  [227, 213, 255],
  [179, 179, 179],
  [213, 213, 213],
  [250, 255, 255],
  [224, 96, 95],
  [165, 96, 96],
  [143, 246, 86],
  [107, 179, 93],
  [241, 238, 85],
  [177, 161, 93],
  [234, 193, 89],
  [188, 117, 95],
];

class Colour {
  public idx: number;
  public rgb: RGB;

  // You probably want Colour.fromMap, Colour.fromRGBInt or Colour.fromRGBFloat
  constructor(idx: number = 0, rgb: RGB = ColourMap[idx]) {
    this.idx = idx;
    this.rgb = rgb;
  }

  public static fromMap(idx: number): Colour {
    return new Colour(idx);
  }

  public static fromRGBInt(rgb: RGB): Colour {
    return new Colour(Colour.getIdxFromRGB(rgb), rgb);
  }

  public static fromRGBFloat(rgb: RGB): Colour {
    rgb[0] = Colour.floatToInt(rgb[0]);
    rgb[1] = Colour.floatToInt(rgb[1]);
    rgb[2] = Colour.floatToInt(rgb[2]);
    return Colour.fromRGBInt(rgb);
  }

  private static mapCache: { [key: string]: number } = {};
  // Expecting RGB Ints.
  // DO NOT Try to get black from here, just grab index 0.
  // Adapted from Fannon's Script.
  public static getIdxFromRGB(rgb: RGB): number {
    const r = rgb[0];
    const g = rgb[1];
    const b = rgb[2];
    if (!Colour.mapCache[`${r},${g},${b}`]) {
      const distanceMap: number[] = [];
      let bestDistance = 255 * 3;
      let bestDistanceNote = 0;

      for (let note = 0; note < ColourMap.length; note++) {
        distanceMap[note] = 0;
        distanceMap[note] += Math.abs(ColourMap[note][0] - r);
        distanceMap[note] += Math.abs(ColourMap[note][1] - g);
        distanceMap[note] += Math.abs(ColourMap[note][2] - b);

        if (distanceMap[note] < bestDistance) {
          bestDistance = distanceMap[note];
          bestDistanceNote = note;
        }
      }

      // Added some custom handling for Darker Greys, 
      // since the ColourMap is pretty bright, they often
      // come in as a dim red.
      const isBlack = bestDistanceNote == 0;

      const darkReds = [7, 11, 83, 106, 121, 127];
      const isNotRed = (darkReds.indexOf(bestDistanceNote) > -1) && ((r - 5) <= b) && ((r - 5) <= g);

      if (isBlack || isNotRed) {
        // idx 71 seems to be the dimmest greyish colour.
        bestDistanceNote = 71;
      }

      Colour.mapCache[`${r},${g},${b}`] = bestDistanceNote;
    }

    return Colour.mapCache[`${r},${g},${b}`];
  }

  private static floatToInt(zeroToOneValue: number) {
    return Math.round(zeroToOneValue * 255);
  }
}

const Colours = {
  Bitwig: new Colour(9),
  BitwigDim: new Colour(11),

  Off: new Colour(0),
  Scroll: new Colour(9),
  Deselected: new Colour(1),
  Selected: new Colour(3),
  Shifted: new Colour(2),

  Record: new Colour(5),
  Play: new Colour(21),

  RecordArm: new Colour(5),
  RecordArmDim: new Colour(7),
  Mute: new Colour(9),
  MuteDim: new Colour(11),
  Solo: new Colour(13),
  SoloDim: new Colour(15),
  Volume: new Colour(21),
  VolumeDim: new Colour(23),
  Pan: new Colour(37),
  PanDim: new Colour(39),
  Sends: new Colour(45),
  SendsDim: new Colour(47),
  Device: new Colour(53),
  DeviceDim: new Colour(55),
  StopClip: new Colour(61),
  StopClipDim: new Colour(63),
}
