import { PawnSprite } from "./pawnSprite";
import { Grappling } from "../pawns/grappling";

export class GrapplingSprite extends PawnSprite {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Grappling.TEXTURE, Grappling.MAX_LIFE);
  }
}
