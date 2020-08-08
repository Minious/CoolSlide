import { LevelScene } from "../levels/levelScene";
import { Action } from "../actions/actionInterface";

export class PawnSprite extends Phaser.GameObjects.Container {
  private maxLife: number;
  private heartsContainer: Phaser.GameObjects.Container;

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    maxLife: number
  ) {
    super(scene, x, y);

    this.maxLife = maxLife;

    const pawnSprite: Phaser.GameObjects.Image = this.scene.add.image(
      0,
      0,
      texture
    );
    this.add(pawnSprite);

    const heartsSize: number = this.scene.textures.get("fullHeart").get(0)
      .width;
    const heartsXMargin: number = 1;
    const heartsYOffset: number = -13;
    const heartsTotalWidth: number =
      this.maxLife * heartsSize + (this.maxLife - 1) * heartsXMargin;
    const heartsX0: number = -heartsTotalWidth / 2 + heartsSize / 2;

    this.heartsContainer = this.scene.add.container(0, heartsYOffset);
    this.add(this.heartsContainer);
    for (let i: number = 0; i < this.maxLife; i += 1) {
      const heartSprite: Phaser.GameObjects.Image = this.scene.add.image(
        heartsX0 + i * (heartsSize + heartsXMargin),
        0,
        "fullHeart"
      );
      this.heartsContainer.add(heartSprite);
    }
  }

  public attack(action: Action, timeStep: number): void {
    const fromPos: Phaser.Math.Vector2 = (this
      .scene as LevelScene).gridPosToWorldPos(action.from);
    const destPos: Phaser.Math.Vector2 = (this
      .scene as LevelScene).gridPosToWorldPos(action.to);
    const midPos: Phaser.Math.Vector2 = destPos.clone().lerp(fromPos, 0.5);
    this.scene.tweens.add({
      targets: this,
      x: midPos.x,
      y: midPos.y,
      yoyo: true,
      duration: timeStep / 2,
      ease: "Quad.easeIn",
      onYoyo: (): void =>
        action.targetPawnSprite.updateLife(action.targetPawnNewLife),
    });
  }

  public move(action: Action, timeStep: number): void {
    const destPos: Phaser.Math.Vector2 = (this
      .scene as LevelScene).gridPosToWorldPos(action.to);
    this.scene.tweens.add({
      targets: action.fromPawnSprite,
      x: destPos.x,
      y: destPos.y,
      duration: timeStep,
      ease: "Quad.easeOut",
    });
  }

  public updateLife(newLife: number): void {
    const heartSprites: Array<Phaser.GameObjects.Image> = this.heartsContainer.getAll() as Array<
      Phaser.GameObjects.Image
    >;

    heartSprites.forEach(
      (heartSprite: Phaser.GameObjects.Image, i: number): void => {
        if (i >= newLife) {
          heartSprite.setTexture("emptyHeart");
        }
      }
    );
  }
}
