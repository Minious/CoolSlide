import { ActionType } from "./actionTypeEnum";
import { Faction } from "../pawns/factionEnum";
import { PawnSprite } from "../pawnSprites/pawnSprite";

export interface Action {
  type: ActionType;
  from?: Phaser.Math.Vector2;
  to?: Phaser.Math.Vector2;
  fromPawnSprite?: PawnSprite;
  targetPawnSprite?: PawnSprite;
  target?: Phaser.Math.Vector2;
  attackingFaction?: Faction;
  targetPawnNewLife?: number;
}
