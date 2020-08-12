import { Pawn } from "./pawn";
import { Faction } from "./factionEnum";
import { SoldierSprite } from "../pawnSprites/soldierSprite";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Action } from "../actions/actionInterface";
import { PlayerPawn } from "./playerPawn";

export class Soldier extends PlayerPawn {
  public static MAX_LIFE: number = 3;
  public static ATTACK: number = 1;
  public static TEXTURE: string = "soldierPawn";

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
      this.move(actions, from, to);

      const nextCell: Pawn = this._grid.getCellAt(to.clone().add(dir));
      if (!nextCell || nextCell.faction === Faction.PLAYER) {
        this.enemiesReact(actions, from, to, enemyPawnsHit);
      }

      from = to;
      to = from.clone().add(dir);
    }

    if (this._grid.isPawnAlive(this)) {
      const nextCell: Pawn = this._grid.getCellAt(to);
      if (nextCell && nextCell.faction === Faction.ENEMY) {
        this.attack(actions, nextCell);
        enemyPawnsHit.push(nextCell);
        this.enemiesReact(
          actions,
          from.clone().subtract(dir),
          from,
          enemyPawnsHit
        );
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
    return new Soldier(this.pos ? this.pos.clone() : undefined);
  }
}
