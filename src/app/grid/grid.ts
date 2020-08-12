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
  private _allPawns: Array<Pawn>;

  public constructor(
    levelSetup: LevelSetup,
    pawns: Array<Pawn>,
    allPawns?: Array<Pawn>
  ) {
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
    this._allPawns = allPawns ? allPawns : pawns.slice();
  }

  public get size(): Phaser.Math.Vector2 {
    return this._size;
  }

  public get levelSetup(): LevelSetup {
    return this._levelSetup;
  }

  public copy(): Grid {
    const pawnsCopy: Array<Pawn> = [];
    const allPawnsCopy: Array<Pawn> = this._allPawns.map(
      (pawn: Pawn): Pawn => {
        const pawnClone: Pawn = pawn.clone();
        if (this.isPawnAlive(pawn)) {
          pawnsCopy.push(pawnClone);
        }
        return pawnClone;
      }
    );
    const gridCopy: Grid = new Grid(this.levelSetup, pawnsCopy, allPawnsCopy);
    pawnsCopy.forEach((pawnCopy: Pawn): void => {
      pawnCopy.grid = gridCopy;
    });
    return gridCopy;
  }

  public getPawns(): Array<Pawn> {
    return this._pawns;
  }

  public getPawnsRef(): Array<Pawn> {
    return this._pawns.map((pawn: Pawn): Pawn => pawn.cloneRef());
  }

  public getAllPlayerPawns(): Array<PlayerPawn> {
    return this._allPawns.filter(
      (pawn: Pawn): boolean => pawn.faction === Faction.PLAYER
    ) as Array<PlayerPawn>;
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

  public arePlayerPawnsDefeated(): boolean {
    return this.getPlayerPawns().length === 0;
  }

  public areEnemyPawnsDefeated(): boolean {
    return this.getEnemyPawns().length === 0;
  }

  public getScore(): number {
    const lifeLost: number = this.getAllPlayerPawns()
      .map((playerPawn: PlayerPawn): number => {
        return playerPawn.maxLife - playerPawn.life;
      })
      .reduce((a: number, c: number): number => a + c, 0);
    if (lifeLost === 0) {
      return 3;
    } else if (lifeLost < 3) {
      return 2;
    } else if (lifeLost < 6) {
      return 1;
    } else {
      return 0;
    }
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

  public getCellAt(pos: Phaser.Math.Vector2): Pawn {
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

  public setCellAt(pos: Phaser.Math.Vector2, cellType: CellType): void {
    this._levelSetup[pos.x][pos.y] = cellType;
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

  public addPawn(pawn: Pawn): void {
    if (this.isCellFree(pawn.pos)) {
      this._grid[pawn.pos.x][pawn.pos.y] = pawn;
      this._pawns.push(pawn);
      this._allPawns.push(pawn);
    }
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
        if (this._levelSetup[to.x][to.y] === CellType.EMPTY) {
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
