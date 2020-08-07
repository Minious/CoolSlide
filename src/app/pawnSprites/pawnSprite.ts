import { MainScene } from "../scenes/mainScene";
import { Action } from "../actions/actionInterface";

export class PawnSprite extends Phaser.GameObjects.Image {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string
  ) {
    super(scene, x, y, texture);
  }

  public attack(action: Action, timeStep: number): void {
    const fromPos: Phaser.Math.Vector2 = (this
      .scene as MainScene).gridPosToWorldPos(action.from);
    const destPos: Phaser.Math.Vector2 = (this
      .scene as MainScene).gridPosToWorldPos(action.to);
    const midPos: Phaser.Math.Vector2 = destPos.clone().lerp(fromPos, 0.5);
    this.scene.tweens.add({
      targets: this,
      x: midPos.x,
      y: midPos.y,
      yoyo: true,
      duration: timeStep / 2,
    });
  }

  public move(action: Action, timeStep: number): void {
    const destPos: Phaser.Math.Vector2 = (this
      .scene as MainScene).gridPosToWorldPos(action.to);
    this.scene.tweens.add({
      targets: action.fromPawnSprite,
      x: destPos.x,
      y: destPos.y,
      duration: timeStep,
    });
  }
}
