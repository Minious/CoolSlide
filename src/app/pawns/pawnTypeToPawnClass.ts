import { Pawn } from "./pawn";
import { Soldier } from "./soldier";
import { Grappling } from "./grappling";
import { Assassin } from "./assassin";
import { Archer } from "./archer";
import { Warrior } from "./warrior";
import { PawnType } from "./pawnTypeEnum";

export const pawnTypeToPawnClass: (pawnType: PawnType) => typeof Pawn = (
  pawnType: PawnType
): typeof Pawn => {
  switch (pawnType) {
    case PawnType.Soldier: {
      return Soldier;
    }
    case PawnType.Grappling: {
      return Grappling;
    }
    case PawnType.Assassin: {
      return Assassin;
    }
    case PawnType.Archer: {
      return Archer;
    }
    case PawnType.Warrior: {
      return Warrior;
    }
  }
  return undefined;
};
