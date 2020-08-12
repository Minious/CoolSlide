import { Level001 } from "./levels/level001";
import { Level002 } from "./levels/level002";
import { LevelScene } from "./levels/levelScene";

import * as soldierPawnImage from "../assets/soldierPawn.png";
import * as grapplingPawnImage from "../assets/grapplingPawn.png";
import * as assassinPawnImage from "../assets/assassinPawn.png";
import * as warriorPawnImage from "../assets/warriorPawn.png";
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
import { LevelSetup } from "./grid/levelSetupType";
import { Pawn } from "./pawns/pawn";
import { CellType } from "./grid/cellType";
import { Warrior } from "./pawns/warrior";
import { Archer } from "./pawns/archer";
import { Soldier } from "./pawns/soldier";
import { Grappling } from "./pawns/grappling";
import { Assassin } from "./pawns/assassin";

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
    this.load.image(Soldier.TEXTURE, soldierPawnImage.default);
    this.load.image(Grappling.TEXTURE, grapplingPawnImage.default);
    this.load.image(Assassin.TEXTURE, assassinPawnImage.default);
    this.load.image(Warrior.TEXTURE, warriorPawnImage.default);
    this.load.image(Archer.TEXTURE, archerPawnImage.default);
    this.load.image(CellType.OBSTACLE, obstacleCellImage.default);
    this.load.image(CellType.EMPTY, emptyCellImage.default);
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

  public startCustomLevel(levelSetup: LevelSetup, pawns: Array<Pawn>): void {
    const customLevelKey: string = "CustomLevel";
    if (
      this.currentLevel &&
      this.currentLevel.scene.isActive(this.currentLevel.scene.key)
    ) {
      this.currentLevel.scene.remove(this.currentLevel.scene.key);
    }
    const customLevelScene: LevelScene = new LevelScene(
      customLevelKey,
      levelSetup,
      pawns
    );
    this.currentLevel = this.scene.add(
      customLevelKey,
      customLevelScene,
      true
    ) as LevelScene;
  }
}
