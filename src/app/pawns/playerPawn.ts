import { Action } from "../actions/actionInterface";
import { Faction } from "./factionEnum";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Pawn } from "./pawn";
import { PawnType } from "./pawnTypeEnum";

export abstract class PlayerPawn extends Pawn {
  public constructor(
    pos: Phaser.Math.Vector2,
    type: PawnType,
    life: number,
    attack: number,
    pawnSprite?: PawnSprite
  ) {
    super(pos, type, Faction.PLAYER, life, attack, pawnSprite);
  }

  public abstract action(
    from: Phaser.Math.Vector2,
    dir: Phaser.Math.Vector2
  ): Array<Action>;
}
