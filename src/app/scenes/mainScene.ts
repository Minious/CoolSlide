import * as Phaser from "phaser";

import * as playerPawnImage from "../../assets/playerPawn.png";
import * as enemyPawnImage from "../../assets/enemyPawn.png";
import * as obstacleCellImage from "../../assets/obstacleCell.png";
import * as emptyCellImage from "../../assets/emptyCell.png";
import * as fullHeartImage from "../../assets/fullHeart.png";
import * as emptyHeartImage from "../../assets/emptyHeart.png";
import * as moveIconImage from "../../assets/moveIcon.png";
import * as attackIconImage from "../../assets/attackIcon.png";
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

export class MainScene extends Phaser.Scene {
  private static ACTION_REPLAY_BLINK_TIMESTEP: number = 140;
  private static ACTION_REPLAY_BLINK_OPACITY: number = 0.5;

  private pawnSprites: Phaser.GameObjects.Group;
  private grid: Grid;
  private sizeMap: any = {
    width: 10,
    height: 6,
  };
  private tileSize: number;
  private replayingActions: boolean = false;
  private lastPreviewDir: Phaser.Math.Vector2;
  private actionsPreviewGroup: Phaser.GameObjects.Group;
  private previewActionsBlinkTimedEffect: Phaser.Time.TimerEvent;

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
      new Warrior(new Phaser.Math.Vector2(5, 1)),
    ];
    this.grid = new Grid(levelSetup, pawns);
  }

  // tslint:disable-next-line: no-empty
  public preload(): void {
    this.load.image("playerPawn", playerPawnImage.default);
    this.load.image("enemyPawn", enemyPawnImage.default);
    this.load.image("obstacleCell", obstacleCellImage.default);
    this.load.image("emptyCell", emptyCellImage.default);
    this.load.image("fullHeart", fullHeartImage.default);
    this.load.image("emptyHeart", emptyHeartImage.default);
    this.load.image("moveIcon", moveIconImage.default);
    this.load.image("attackIcon", attackIconImage.default);
    this.load.image("deathIcon", deathIconImage.default);
  }

  public create(): void {
    // Disables right click
    this.game.canvas.oncontextmenu = (e: MouseEvent): void => {
      e.preventDefault();
    };

    this.pawnSprites = this.add.group();
    this.actionsPreviewGroup = this.add.group();

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
        this.clearActionsPreview();
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

  private clearActionsPreview(): void {
    if (this.previewActionsBlinkTimedEffect) {
      this.previewActionsBlinkTimedEffect.remove(false);
    }
    this.actionsPreviewGroup.clear(true, true);
  }

  private previewActions(
    mousePos: Phaser.Math.Vector2,
    dir: Phaser.Math.Vector2
  ): void {
    this.clearActionsPreview();

    const newGrid: Grid = this.grid.copy();

    const gridPos: Phaser.Math.Vector2 = this.worldPosToGridPos(mousePos);
    const pawn: Pawn = newGrid.getCell(gridPos);

    if (pawn && pawn.faction === Faction.PLAYER) {
      const actions: Array<Action> = (pawn as PlayerPawn).action(gridPos, dir);
      actions.forEach((action: Action): void => {
        this.previewAction(action);
      });

      let idx: number = 0;
      this.previewActionsBlinkTimedEffect = this.time.addEvent({
        delay: MainScene.ACTION_REPLAY_BLINK_TIMESTEP,
        startAt: MainScene.ACTION_REPLAY_BLINK_TIMESTEP,
        callbackScope: this,
        loop: true,
        callback: (): void => {
          this.tweens.add({
            targets: this.actionsPreviewGroup.getChildren()[
              idx % this.actionsPreviewGroup.getLength()
            ],
            alpha: {
              getEnd: (): number => {
                return 1;
              },

              getStart: (): number => {
                return MainScene.ACTION_REPLAY_BLINK_OPACITY;
              },
            },
            duration: MainScene.ACTION_REPLAY_BLINK_TIMESTEP / 2,
            yoyo: true,
          });
          idx += 1;
        },
      });
    }
  }

  private previewAction(action: Action): void {
    let fromWorldPos: Phaser.Math.Vector2;
    let toWorldPos: Phaser.Math.Vector2;
    let midPoint: Phaser.Math.Vector2;
    let dir: Phaser.Math.Vector2;
    if (action.from) {
      fromWorldPos = this.gridPosToWorldPos(action.from);
    }
    if (action.to) {
      toWorldPos = this.gridPosToWorldPos(action.to);
    }
    if (action.from && action.to) {
      midPoint = fromWorldPos.clone().lerp(toWorldPos, 0.2);
      dir = action.to.clone().subtract(action.from);
    }
    switch (action.type) {
      case ActionType.MOVE: {
        const actionImage: Phaser.GameObjects.Image = this.add.image(
          midPoint.x,
          midPoint.y,
          "moveIcon"
        );
        actionImage.setRotation(dir.angle());
        actionImage.setAlpha(MainScene.ACTION_REPLAY_BLINK_OPACITY);
        this.actionsPreviewGroup.add(actionImage);
        break;
      }
      case ActionType.ATTACK: {
        const actionContainer: Phaser.GameObjects.Container = this.add.container(
          midPoint.x,
          midPoint.y
        );
        const actionImage: Phaser.GameObjects.Image = this.add.image(
          0,
          0,
          "attackIcon"
        );
        actionImage.setRotation(dir.angle());
        actionImage.setAlpha(MainScene.ACTION_REPLAY_BLINK_OPACITY);
        actionContainer.add(actionImage);

        const damagesText: Phaser.GameObjects.Text = this.add
          .text(0, 0, action.damages.toString())
          .setOrigin(0.5, 0.4);
        actionContainer.add(damagesText);

        this.actionsPreviewGroup.add(actionContainer);
        break;
      }
      case ActionType.PAWN_DESTROYED: {
        const actionImage: Phaser.GameObjects.Image = this.add.image(
          fromWorldPos.x,
          fromWorldPos.y,
          "deathIcon"
        );
        actionImage.setAlpha(MainScene.ACTION_REPLAY_BLINK_OPACITY);
        this.actionsPreviewGroup.add(actionImage);
        break;
      }
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
