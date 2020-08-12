import { Pawn } from "./pawn";
import { Faction } from "./factionEnum";
import { AssassinSprite } from "../pawnSprites/assassinSprite";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Action } from "../actions/actionInterface";
import { PlayerPawn } from "./playerPawn";
import { ActionType } from "../actions/actionTypeEnum";
import { PawnType } from "./pawnTypeEnum";

export class Assassin extends PlayerPawn {
  public static MAX_LIFE: number = 1;
  public static ATTACK: number = 2;
  public static TEXTURE: string = "assassinPawn";

  public constructor(pos: Phaser.Math.Vector2) {
    super(pos, PawnType.Assassin, Assassin.MAX_LIFE, Assassin.ATTACK);
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

      const nextCellPos: Phaser.Math.Vector2 = to.clone().add(dir);
      const nextCell: Pawn = this._grid.getCellAt(nextCellPos);
      const cellBehindTargetPos: Phaser.Math.Vector2 = nextCellPos
        .clone()
        .add(dir);
      if (
        !nextCell ||
        nextCell.faction !== Faction.ENEMY ||
        !this._grid.isCellFree(cellBehindTargetPos)
      ) {
        this.enemiesReact(actions, from, to, enemyPawnsHit);
      }

      from = to;
      to = from.clone().add(dir);
    }

    if (this._grid.isPawnAlive(this)) {
      const nextCell: Pawn = this._grid.getCellAt(to);
      const cellBehindTargetPos: Phaser.Math.Vector2 = to.clone().add(dir);
      if (
        nextCell &&
        nextCell.faction === Faction.ENEMY &&
        this._grid.isCellFree(cellBehindTargetPos)
      ) {
        enemyPawnsHit.push(nextCell);
        this.attackAssassin(actions, nextCell, cellBehindTargetPos);

        this.enemiesReact(actions, from, cellBehindTargetPos, enemyPawnsHit);
      }
    }

    return actions;
  }

  protected _createPawnSprite(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): PawnSprite {
    return new AssassinSprite(scene, x, y);
  }

  protected _clone(): Pawn {
    return new Assassin(this.pos ? this.pos.clone() : undefined);
  }

  private attackAssassin(
    actions: Array<Action>,
    targetPawn: Pawn,
    cellBehindTargetPos: Phaser.Math.Vector2
  ): void {
    actions.push({
      type: ActionType.ATTACK_ASSASSIN,
      from: this.pos.clone(),
      to: cellBehindTargetPos,
      fromPawnSprite: this.pawnSprite,
      targetPawnSprite: targetPawn.pawnSprite,
      attackingFaction: this.faction,
      targetPawnNewLife: targetPawn.life - this._attackDamages,
      damages: this._attackDamages,
    });
    const deathActions: Array<Action> = targetPawn.changeLife(
      -this._attackDamages
    );
    deathActions.forEach((deathAction: Action): void => {
      actions.push(deathAction);
    });

    this._grid.movePawn(this.pos.clone(), cellBehindTargetPos);
  }
}
