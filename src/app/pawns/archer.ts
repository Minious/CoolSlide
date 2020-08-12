import { Pawn } from "./pawn";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Action } from "../actions/actionInterface";
import { EnemyPawn } from "./enemyPawn";
import { ArcherSprite } from "../pawnSprites/archerSprite";
import { PawnType } from "./pawnTypeEnum";

export class Archer extends EnemyPawn {
  public static MAX_LIFE: number = 1;
  public static ATTACK: number = 1;
  public static TEXTURE: string = "archerPawn";

  public constructor(pos: Phaser.Math.Vector2) {
    super(pos, PawnType.Archer, Archer.MAX_LIFE, Archer.ATTACK);
  }

  public react(
    from: Phaser.Math.Vector2,
    to: Phaser.Math.Vector2,
    pawnHit: boolean
  ): Array<Action> {
    const actions: Array<Action> = [];
    const playerPawn: Pawn = this._grid.getCellAt(to);
    if (
      this._grid.isPawnAlive(this) &&
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
    return new ArcherSprite(scene, x, y);
  }

  protected _clone(): Pawn {
    return new Archer(this.pos ? this.pos.clone() : undefined);
  }
}
