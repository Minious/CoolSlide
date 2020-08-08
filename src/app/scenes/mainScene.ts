import * as Phaser from "phaser";

import * as playerPawnImage from "../../assets/playerPawn.png";
import * as grapplingPawnImage from "../../assets/grapplingPawn.png";
import * as assassinPawnImage from "../../assets/assassinPawn.png";
import * as enemyPawnImage from "../../assets/enemyPawn.png";
import * as archerPawnImage from "../../assets/archerPawn.png";
import * as obstacleCellImage from "../../assets/obstacleCell.png";
import * as emptyCellImage from "../../assets/emptyCell.png";
import * as fullHeartImage from "../../assets/fullHeart.png";
import * as emptyHeartImage from "../../assets/emptyHeart.png";
import * as moveIconImage from "../../assets/moveIcon.png";
import * as attackIconImage from "../../assets/attackIcon.png";
import * as attackAssassinIconImage from "../../assets/attackAssassinIcon.png";
import * as deathIconImage from "../../assets/deathIcon.png";

import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Pawn } from "../pawns/pawn";
import { Grid } from "../grid/grid";
import { LevelSetup } from "../grid/levelSetupType";
import { CellType } from "../grid/cellType";
import { Soldier } from "../pawns/soldier";
import { Faction } from "../pawns/factionEnum";
import { Action } from "../actions/actionInterface";
import { PlayerPawn } from "../pawns/playerPawn";
import { Warrior } from "../pawns/warrior";
import { ActionType } from "../actions/actionTypeEnum";
import { ActionsPreview } from "../actions/actionsPreview";
import { Archer } from "../pawns/archer";
import { Grappling } from "../pawns/grappling";
import { AssassinSprite } from "../pawnSprites/assassinSprite";
import { Assassin } from "../pawns/assassin";

export class MainScene extends Phaser.Scene {
  private pawnSprites: Phaser.GameObjects.Group;
  private grid: Grid;
  private sizeMap: any = {
    width: 10,
    height: 6,
  };
  private tileSize: number;
  private replayingActions: boolean = false;
  private lastPreviewDir: Phaser.Math.Vector2;
  private actionsPreview: ActionsPreview;

  public constructor() {
    super({
      key: "WorldScene",
    });

    const levelSetup: LevelSetup = new Array(this.sizeMap.width)
      .fill(undefined)
      .map(
        (value1: any, i: number): Array<CellType> =>
          new Array(this.sizeMap.height)
            .fill(undefined)
            .map(
              (value2: any, j: number): CellType =>
                i === 0 ||
                i === this.sizeMap.width - 1 ||
                j === 0 ||
                j === this.sizeMap.height - 1
                  ? CellType.OBSTACLE
                  : CellType.EMPTY
            )
      );
    const pawns: Array<Pawn> = [
      new Soldier(new Phaser.Math.Vector2(3, 1)),
      new Archer(new Phaser.Math.Vector2(5, 1)),
      new Warrior(new Phaser.Math.Vector2(5, 4)),
      new Grappling(new Phaser.Math.Vector2(1, 4)),
      new Assassin(new Phaser.Math.Vector2(3, 4)),
    ];
    this.grid = new Grid(levelSetup, pawns);
  }

  // tslint:disable-next-line: no-empty
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
    this.load.image("moveIcon", moveIconImage.default);
    this.load.image("attackIcon", attackIconImage.default);
    this.load.image("attackAssassinIcon", attackAssassinIconImage.default);
    this.load.image("deathIcon", deathIconImage.default);
  }

  public create(): void {
    // Disables right click
    this.game.canvas.oncontextmenu = (e: MouseEvent): void => {
      e.preventDefault();
    };

    this.pawnSprites = this.add.group();
    this.actionsPreview = new ActionsPreview(this);

    /**
     * Places the camera centered to the origin (default is left upper corner is
     * at origin)
     */
    this.cameras.main.setZoom(2);
    this.cameras.main.centerOn(0, 0);

    this.tileSize = this.textures.get("emptyCell").get(0).width;

    this.grid.levelSetup.forEach((column: Array<CellType>, i: number): void => {
      column.forEach((cellType: CellType, j: number): void => {
        let texture: string;
        switch (cellType) {
          case CellType.OBSTACLE: {
            texture = "obstacleCell";
            break;
          }
          case CellType.EMPTY: {
            texture = "emptyCell";
            break;
          }
        }
        this.add.image(
          (i - this.sizeMap.width / 2 + 0.5) * this.tileSize,
          (j - this.sizeMap.height / 2 + 0.5) * this.tileSize,
          texture
        );
      });
    });

    this.grid.getPawns().forEach((pawn: Pawn): void => {
      const pawnPos: Phaser.Math.Vector2 = this.gridPosToWorldPos(pawn.pos);
      const pawnSprite: PawnSprite = pawn.createPawnSprite(
        this,
        pawnPos.x,
        pawnPos.y
      );
      this.pawnSprites.add(pawnSprite, true);
    });

    this.input.on(
      "pointermove",
      (_pointer: Phaser.Input.Pointer): void => {
        if (_pointer.leftButtonDown() && !this.replayingActions) {
          const pointerDownPos: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(
            _pointer.downX,
            _pointer.downY
          );
          const pointerUpPos: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(
            _pointer.x,
            _pointer.y
          );
          const pointerMove: Phaser.Math.Vector2 = pointerUpPos
            .clone()
            .subtract(pointerDownPos);
          const dir: Phaser.Math.Vector2 = this.getDir(pointerMove);
          if (dir.x !== 0 || dir.y !== 0) {
            if (
              !this.lastPreviewDir ||
              this.lastPreviewDir.x !== dir.x ||
              this.lastPreviewDir.y !== dir.y
            ) {
              this.lastPreviewDir = dir;
              this.previewActions(pointerDownPos, dir);
            }
          }
        }
      },
      this
    );

    this.input.on(
      "pointerup",
      (_pointer: Phaser.Input.Pointer): void => {
        this.lastPreviewDir = undefined;
        this.actionsPreview.clearActionsPreview();
        if (!this.replayingActions) {
          const pointerDownPos: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(
            _pointer.downX,
            _pointer.downY
          );
          const pointerUpPos: Phaser.Math.Vector2 = this.cameras.main.getWorldPoint(
            _pointer.upX,
            _pointer.upY
          );
          const pointerMove: Phaser.Math.Vector2 = pointerUpPos
            .clone()
            .subtract(pointerDownPos);
          const dir: Phaser.Math.Vector2 = this.getDir(pointerMove);
          this.step(pointerDownPos, dir);
        }
      },
      this
    );
  }

  public getDir(move: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    if (move.length() > 5) {
      if (move.angle() < Math.PI / 4 || move.angle() >= (7 * Math.PI) / 4) {
        return new Phaser.Math.Vector2(1, 0);
      } else if (move.angle() < (3 * Math.PI) / 4) {
        return new Phaser.Math.Vector2(0, 1);
      } else if (move.angle() < (5 * Math.PI) / 4) {
        return new Phaser.Math.Vector2(-1, 0);
      } else {
        return new Phaser.Math.Vector2(0, -1);
      }
    } else {
      return new Phaser.Math.Vector2(0, 0);
    }
  }

  public gridPosToWorldPos(gridPos: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      (gridPos.x - this.sizeMap.width / 2 + 0.5) * this.tileSize,
      (gridPos.y - this.sizeMap.height / 2 + 0.5) * this.tileSize
    );
  }

  public worldPosToGridPos(worldPos: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Math.floor(worldPos.x / this.tileSize + this.sizeMap.width / 2),
      Math.floor(worldPos.y / this.tileSize + this.sizeMap.height / 2)
    );
  }

  private previewActions(
    mousePos: Phaser.Math.Vector2,
    dir: Phaser.Math.Vector2
  ): void {
    this.actionsPreview.clearActionsPreview();

    const newGrid: Grid = this.grid.copy();

    const gridPos: Phaser.Math.Vector2 = this.worldPosToGridPos(mousePos);
    const pawn: Pawn = newGrid.getCell(gridPos);

    if (pawn && pawn.faction === Faction.PLAYER) {
      const actions: Array<Action> = (pawn as PlayerPawn).action(gridPos, dir);

      this.actionsPreview.previewActions(actions);
    }
  }

  private step(mousePos: Phaser.Math.Vector2, dir: Phaser.Math.Vector2): void {
    const newGrid: Grid = this.grid.copy();

    const gridPos: Phaser.Math.Vector2 = this.worldPosToGridPos(mousePos);
    const pawn: Pawn = newGrid.getCell(gridPos);

    if (pawn && pawn.faction === Faction.PLAYER) {
      const actions: Array<Action> = (pawn as PlayerPawn).action(gridPos, dir);
      this.replayActions(actions);
    }

    this.grid = newGrid;
  }

  private replayActions(actions: Array<Action>): void {
    this.replayingActions = true;
    let currentActionIdx: number = 0;
    const timeStep: number = 300;
    this.time.addEvent({
      delay: timeStep,
      startAt: timeStep,
      callbackScope: this,
      repeat: actions.length,
      callback: (): void => {
        if (currentActionIdx < actions.length) {
          const action: Action = actions[currentActionIdx];
          switch (action.type) {
            case ActionType.MOVE: {
              action.fromPawnSprite.move(action, timeStep);
              break;
            }
            case ActionType.ATTACK: {
              action.fromPawnSprite.attack(action, timeStep);
              break;
            }
            case ActionType.ATTACK_ASSASSIN: {
              (action.fromPawnSprite as AssassinSprite).attackAssassin(
                action,
                timeStep
              );
              break;
            }
            case ActionType.PAWN_DESTROYED: {
              action.targetPawnSprite.destroy();
              break;
            }
          }
        }
        if (currentActionIdx >= actions.length) {
          this.replayingActions = false;
        }
        currentActionIdx += 1;
      },
    });
  }
}
