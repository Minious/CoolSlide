import { PawnSprite } from "./pawnSprite";
import { Soldier } from "../pawns/soldier";

export class SoldierSprite extends PawnSprite {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Soldier.TEXTURE, Soldier.MAX_LIFE);
  }
}
