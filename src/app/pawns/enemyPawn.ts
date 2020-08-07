import { Action } from "../actions/actionInterface";
import { Faction } from "./factionEnum";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Pawn } from "./pawn";

export abstract class EnemyPawn extends Pawn {
  public constructor(
    pos: Phaser.Math.Vector2,
    life: number,
    attack: number,
    pawnSprite?: PawnSprite
  ) {
    super(pos, Faction.ENEMY, life, attack, pawnSprite);
  }

  public abstract react(
    from: Phaser.Math.Vector2,
    dir: Phaser.Math.Vector2,
    hit: boolean
  ): Array<Action>;
}
