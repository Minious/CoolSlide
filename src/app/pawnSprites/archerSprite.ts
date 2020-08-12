import { PawnSprite } from "./pawnSprite";
import { Archer } from "../pawns/archer";

export class ArcherSprite extends PawnSprite {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Archer.TEXTURE, Archer.MAX_LIFE);
  }
}
