import { PawnSprite } from "./pawnSprite";
import { Warrior } from "../pawns/warrior";

export class WarriorSprite extends PawnSprite {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Warrior.TEXTURE, Warrior.MAX_LIFE);
  }
}
