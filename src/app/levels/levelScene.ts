import * as Phaser from "phaser";

import { Pawn } from "../pawns/pawn";
import { Grid } from "../grid/grid";
import { LevelSetup } from "../grid/levelSetupType";
import { Faction } from "../pawns/factionEnum";
import { Action } from "../actions/actionInterface";
import { PlayerPawn } from "../pawns/playerPawn";
import { ActionType } from "../actions/actionTypeEnum";
import { ActionsPreview } from "../actions/actionsPreview";
import { AssassinSprite } from "../pawnSprites/assassinSprite";
import { AbstractLevelScene } from "./abstractLevelScene";

export abstract class LevelScene extends AbstractLevelScene {
  private replayingActions: boolean = false;
  private lastPreviewDir: Phaser.Math.Vector2;
  private actionsPreview: ActionsPreview;

  public constructor(key: string, levelSetup: LevelSetup, pawns: Array<Pawn>) {
    super(key, levelSetup, pawns);
  }

  public create(): void {
    super.create();

    this.actionsPreview = new ActionsPreview(this);

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

          if (this.grid.arePlayerPawnsDefeated()) {
            this.endLevel(0);
          } else if (this.grid.areEnemyPawnsDefeated()) {
            this.endLevel(this.grid.getScore());
          }
        }
        currentActionIdx += 1;
      },
    });
  }

  private endLevel(score: number): void {
    this.input.off("pointermove");
    this.input.off("pointerup");

    this.scene.bringToTop("ResultScene");
    this.scene.run("ResultScene", { score });
  }
}
