import { Pawn } from "./pawn";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Action } from "../actions/actionInterface";
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
      this.attack(actions, playerPawn);
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
    return new Warrior(this.pos ? this.pos.clone() : undefined);
  }
}
