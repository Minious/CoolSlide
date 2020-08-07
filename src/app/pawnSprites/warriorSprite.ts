import { PawnSprite } from "./pawnSprite";

export class WarriorSprite extends PawnSprite {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemyPawn");
  }
}
