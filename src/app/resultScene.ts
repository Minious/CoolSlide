import { ManagerScene } from "./managerScene";

export class ResultScene extends Phaser.Scene {
  private score: number;
  private marginStars: number = 110;

  public constructor() {
    super({ key: "ResultScene" });
  }

  public init(data: any): void {
    this.score = data.score;
  }

  public create(): void {
    this.cameras.main.centerOn(0, 0);

    for (let i: number = 0; i < 3; i += 1) {
      this.add
        .image(
          i * this.marginStars - this.marginStars,
          0,
          i < this.score ? "fullStar" : "emptyStar"
        )
        .setScale(3);
    }

    this.input.on("pointerup", (_pointer: Phaser.Input.Pointer): void => {
      (this.scene.get("ManagerScene") as ManagerScene).startNextLevel();
      this.scene.stop("ResultScene");
    });
  }
}
