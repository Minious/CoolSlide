import { Pawn } from "./pawn";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Action } from "../actions/actionInterface";
import { ActionType } from "../actions/actionTypeEnum";
import { EnemyPawn } from "./enemyPawn";
import { WarriorSprite } from "../pawnSprites/warriorSprite";

export class Warrior extends EnemyPawn {
  public static MAX_LIFE: number = 2;
  public static ATTACK: number = 1;

  public constructor(pos: Phaser.Math.Vector2) {
    super(pos, Warrior.MAX_LIFE, Warrior.ATTACK);
  }

  public react(
    from: Phaser.Math.Vector2,
    to: Phaser.Math.Vector2,
    pawnHit: boolean
  ): Array<Action> {
    const actions: Array<Action> = [];
    const playerPawn: Pawn = this._grid.getCell(to);
    if (
      this._grid.isPawnAlive(this) &&
      pawnHit &&
      to.clone().subtract(this.pos).length() <= 1 &&
      playerPawn &&
      this._grid.isPawnAlive(playerPawn)
    ) {
      playerPawn.changeLife(-this.attack);
      actions.push({
        type: ActionType.ATTACK,
        from: this.pos.clone(),
        to: to.clone(),
        fromPawnSprite: this.pawnSprite,
        targetPawnSprite: playerPawn.pawnSprite,
        attackingFaction: this.faction,
        targetPawnNewLife: playerPawn.life,
        damages: this.attack,
      });

      if (playerPawn.life <= 0) {
        this._grid.destroyPawn(playerPawn);

        actions.push({
          type: ActionType.PAWN_DESTROYED,
          from: to.clone(),
          targetPawnSprite: playerPawn.pawnSprite,
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
    return new WarriorSprite(scene, x, y);
  }

  protected _clone(): Pawn {
    return new Warrior(this.pos.clone());
  }
}
