import { PawnSprite } from "./pawnSprite";
import { Assassin } from "../pawns/assassin";
import { Action } from "../actions/actionInterface";
import { MainScene } from "../scenes/mainScene";

export class AssassinSprite extends PawnSprite {
  public constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "assassinPawn", Assassin.MAX_LIFE);
  }

  public attackAssassin(action: Action, timeStep: number): void {
    const destPos: Phaser.Math.Vector2 = (this
      .scene as MainScene).gridPosToWorldPos(action.to);
    this.scene.tweens.add({
      targets: this,
      x: destPos.x,
      y: destPos.y,
      duration: timeStep / 2,
      ease: "Quad.easeInOut",
      onComplete: (): void =>
        action.targetPawnSprite.updateLife(action.targetPawnNewLife),
    });
  }
}
