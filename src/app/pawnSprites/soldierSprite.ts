import { PawnSprite } from "./pawnSprite";
import { Soldier } from "../pawns/soldier";

export class SoldierSprite extends PawnSprite {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "playerPawn", Soldier.MAX_LIFE);
  }
}
