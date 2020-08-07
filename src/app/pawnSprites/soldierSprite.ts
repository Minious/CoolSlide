import { PawnSprite } from "./pawnSprite";

export class SoldierSprite extends PawnSprite {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "playerPawn");
  }
}
