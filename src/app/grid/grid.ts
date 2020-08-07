import { LevelSetup } from "./levelSetupType";
import { Pawn } from "../pawns/pawn";
import { CellType } from "./cellType";
import { EnemyPawn } from "../pawns/enemyPawn";
import { Faction } from "../pawns/factionEnum";
import { PlayerPawn } from "../pawns/playerPawn";

export class Grid {
  private _size: Phaser.Math.Vector2;
  private _levelSetup: LevelSetup;
  private _grid: Array<Array<Pawn>>;
  private _pawns: Array<Pawn>;

  public constructor(levelSetup: LevelSetup, pawns: Array<Pawn>) {
    this._size = new Phaser.Math.Vector2(
      levelSetup.length,
      levelSetup[0].length
    );
    this._levelSetup = levelSetup;
    this._grid = new Array(this._size.x)
      .fill(undefined)
      .map((): Array<undefined> => new Array(this._size.y).fill(undefined));
    this._pawns = pawns;
    this._pawns.forEach((pawn: Pawn): void => {
      this._grid[pawn.pos.x][pawn.pos.y] = pawn;
      pawn.grid = this;
    });
  }

  public get size(): Phaser.Math.Vector2 {
    return this._size;
  }

  public get levelSetup(): LevelSetup {
    return this._levelSetup;
  }

  public copy(): Grid {
    const pawnsCopy: Array<Pawn> = this._pawns.map(
      (pawn: Pawn): Pawn => pawn.clone()
    );
    const gridCopy: Grid = new Grid(this.levelSetup, pawnsCopy);
    pawnsCopy.forEach((pawnCopy: Pawn): void => {
      pawnCopy.grid = gridCopy;
    });
    return gridCopy;
  }

  public getPawns(): Array<Pawn> {
    return this._pawns;
  }

  public getPlayerPawns(): Array<PlayerPawn> {
    return this._pawns.filter(
      (pawn: Pawn): boolean => pawn.faction === Faction.PLAYER
    ) as Array<PlayerPawn>;
  }

  public getEnemyPawns(): Array<EnemyPawn> {
    return this._pawns.filter(
      (pawn: Pawn): boolean => pawn.faction === Faction.ENEMY
    ) as Array<EnemyPawn>;
  }

  public isCellFree(pos: Phaser.Math.Vector2): boolean {
    return (
      pos.x < 0 ||
      pos.x >= this._size.x ||
      pos.y < 0 ||
      pos.y >= this._size.y ||
      (!this._grid[pos.x][pos.y] &&
        this.levelSetup[pos.x][pos.y] === CellType.EMPTY)
    );
  }

  public getCell(pos: Phaser.Math.Vector2): Pawn {
    if (
      pos.x < 0 ||
      pos.x >= this._size.x ||
      pos.y < 0 ||
      pos.y >= this._size.y
    ) {
      return undefined;
    } else {
      return this._grid[pos.x][pos.y];
    }
  }

  public isPawnAlive(pawn: Pawn): boolean {
    return (
      this._pawns.filter((otherPawn: Pawn): boolean => pawn === otherPawn)
        .length > 0
    );
  }

  public destroyPawnWithPos(pos: Phaser.Math.Vector2): void {
    const destroyedPawn: Pawn = this._grid[pos.x][pos.y];
    this._grid[pos.x][pos.y] = undefined;
    this._pawns = this._pawns.filter(
      (otherPawn: Pawn): boolean => destroyedPawn !== otherPawn
    );
    destroyedPawn.resetPos();
    console.log(`INFO : Pawn destroyed`);
  }

  public destroyPawn(pawn: Pawn): void {
    this._grid[pawn.pos.x][pawn.pos.y] = undefined;
    this._pawns = this._pawns.filter(
      (otherPawn: Pawn): boolean => pawn !== otherPawn
    );
    pawn.resetPos();
    console.log(`INFO : Pawn destroyed`);
  }

  public movePawn(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): void {
    console.log(
      `INFO : Moving pawn from (${from.x};${from.y}) to (${to.x};${to.y})`
    );
    if (this._grid[from.x][from.y]) {
      const pawn: Pawn = this._grid[from.x][from.y];
      if (
        to.x < 0 ||
        to.x >= this._size.x ||
        to.y < 0 ||
        to.y >= this._size.y
      ) {
        this.destroyPawn(pawn);
      } else if (!this._grid[to.x][to.y]) {
        if (!this._levelSetup[to.x][to.y]) {
          this._grid[from.x][from.y] = undefined;
          this._grid[to.x][to.y] = pawn;
          pawn.pos = to;
        } else {
          console.log(
            `ERROR : trying to move pawn from (${from.x};${from.y}) to (${to.x};${to.y}) but cell is blocked`
          );
        }
      } else {
        console.log(
          `ERROR : trying to move pawn from (${from.x};${from.y}) to (${to.x};${to.y}) but cell is occupied`
        );
      }
    } else {
      console.log(
        `ERROR : trying to move pawn from (${from.x};${from.y}) but cell is empty`
      );
    }
  }
}
