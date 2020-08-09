import { Level001 } from "./levels/level001";
import { Level002 } from "./levels/level002";
import { LevelScene } from "./levels/levelScene";

import * as playerPawnImage from "../assets/playerPawn.png";
import * as grapplingPawnImage from "../assets/grapplingPawn.png";
import * as assassinPawnImage from "../assets/assassinPawn.png";
import * as enemyPawnImage from "../assets/enemyPawn.png";
import * as archerPawnImage from "../assets/archerPawn.png";
import * as obstacleCellImage from "../assets/obstacleCell.png";
import * as emptyCellImage from "../assets/emptyCell.png";
import * as fullHeartImage from "../assets/fullHeart.png";
import * as emptyHeartImage from "../assets/emptyHeart.png";
import * as fullStarImage from "../assets/fullStar.png";
import * as emptyStarImage from "../assets/emptyStar.png";
import * as moveIconImage from "../assets/moveIcon.png";
import * as attackIconImage from "../assets/attackIcon.png";
import * as attackAssassinIconImage from "../assets/attackAssassinIcon.png";
import * as deathIconImage from "../assets/deathIcon.png";

export class ManagerScene extends Phaser.Scene {
  public LEVELS_ORDER: Map<string, typeof LevelScene> = new Map([
    ["level001", Level001],
    ["level002", Level002],
  ]);
  private CURRENT_LEVEL_IDX: number = 0;
  private currentLevel: LevelScene;

  public constructor() {
    super({ key: "ManagerScene" });
  }
  public preload(): void {
    this.load.image("playerPawn", playerPawnImage.default);
    this.load.image("grapplingPawn", grapplingPawnImage.default);
    this.load.image("assassinPawn", assassinPawnImage.default);
    this.load.image("enemyPawn", enemyPawnImage.default);
    this.load.image("archerPawn", archerPawnImage.default);
    this.load.image("obstacleCell", obstacleCellImage.default);
    this.load.image("emptyCell", emptyCellImage.default);
    this.load.image("fullHeart", fullHeartImage.default);
    this.load.image("emptyHeart", emptyHeartImage.default);
    this.load.image("fullStar", fullStarImage.default);
    this.load.image("emptyStar", emptyStarImage.default);
    this.load.image("moveIcon", moveIconImage.default);
    this.load.image("attackIcon", attackIconImage.default);
    this.load.image("attackAssassinIcon", attackAssassinIconImage.default);
    this.load.image("deathIcon", deathIconImage.default);
  }

  public getNextLevel(): string {
    const nextLevel: string = Array.from(this.LEVELS_ORDER.keys())[
      this.CURRENT_LEVEL_IDX
    ];
    this.CURRENT_LEVEL_IDX += 1;
    return nextLevel;
  }

  public create(): void {
    // this.startNextLevel();
    this.scene.start("LevelBuilderScene");
  }

  public startNextLevel(): void {
    if (
      this.currentLevel &&
      this.currentLevel.scene.isActive(this.currentLevel.scene.key)
    ) {
      this.currentLevel.scene.remove(this.currentLevel.scene.key);
    }
    const nextLevelKey: string = this.getNextLevel();
    if (nextLevelKey) {
      this.currentLevel = this.scene.add(
        nextLevelKey,
        this.LEVELS_ORDER.get(nextLevelKey),
        true
      ) as LevelScene;
    }
  }
}
