import { Pawn } from "./pawn";
import { Faction } from "./factionEnum";
import { SoldierSprite } from "../pawnSprites/soldierSprite";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Action } from "../actions/actionInterface";
import { ActionType } from "../actions/actionTypeEnum";
import { PlayerPawn } from "./playerPawn";
import { EnemyPawn } from "./enemyPawn";

export class Soldier extends PlayerPawn {
  public static MAX_LIFE: number = 3;
  public static ATTACK: number = 1;

  public constructor(pos: Phaser.Math.Vector2) {
    super(pos, Soldier.MAX_LIFE, Soldier.ATTACK);
  }

  public action(
    from: Phaser.Math.Vector2,
    dir: Phaser.Math.Vector2
  ): Array<Action> {
    const actions: Array<Action> = [];

    let to: Phaser.Math.Vector2 = from.clone().add(dir);
    const enemyPawnsHit: Array<Pawn> = [];

    while (this._grid.isPawnAlive(this) && this._grid.isCellFree(to)) {
      this._grid.movePawn(from, to);
      actions.push({
        type: ActionType.MOVE,
        from: from.clone(),
        to: to.clone(),
        fromPawnSprite: this.pawnSprite,
      });

      const nextCell: Pawn = this._grid.getCell(to.clone().add(dir));
      if (!nextCell || nextCell.faction === Faction.PLAYER) {
        this._grid.getEnemyPawns().forEach((pawn: EnemyPawn): void => {
          const pawnHit: boolean =
            enemyPawnsHit.filter(
              (otherPawn: Pawn): boolean => pawn === otherPawn
            ).length > 0;
          const reactActions: Array<Action> = pawn.react(from, to, pawnHit);
          reactActions.forEach((reactAction: Action): void => {
            actions.push(reactAction);
          });
        });
      }

      from = to;
      to = from.clone().add(dir);
    }

    if (this._grid.isPawnAlive(this)) {
      const nextCell: Pawn = this._grid.getCell(to);
      if (nextCell && nextCell.faction === Faction.ENEMY) {
        nextCell.changeLife(-this.attack);
        enemyPawnsHit.push(nextCell);
        actions.push({
          type: ActionType.ATTACK,
          from: from.clone(),
          to: to.clone(),
          target: to.clone(),
          fromPawnSprite: this.pawnSprite,
          targetPawnSprite: nextCell.pawnSprite,
          attackingFaction: this.faction,
          targetPawnNewLife: nextCell.life,
        });

        if (nextCell.life <= 0) {
          this._grid.destroyPawn(nextCell);

          actions.push({
            type: ActionType.PAWN_DESTROYED,
            targetPawnSprite: nextCell.pawnSprite,
          });
        }

        this._grid.getEnemyPawns().forEach((pawn: EnemyPawn): void => {
          const pawnHit: boolean =
            enemyPawnsHit.filter(
              (otherPawn: EnemyPawn): boolean => pawn === otherPawn
            ).length > 0;
          const reactActions: Array<Action> = pawn.react(
            from.clone().subtract(dir),
            from,
            pawnHit
          );
          reactActions.forEach((reactAction: Action): void => {
            actions.push(reactAction);
          });
        });
      }
    }

    return actions;
  }

  protected _createPawnSprite(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): PawnSprite {
    return new SoldierSprite(scene, x, y);
  }

  protected _clone(): Pawn {
    return new Soldier(this.pos.clone());
  }
}
