import Database from './database';
import type { CellValue, Field, Tank, Genotype, Location, Rack } from './database';
import SQLite from 'better-sqlite3';
import type { Database as SQLiteDB } from 'better-sqlite3';

const GENOTYPE_PAGE_NAME = 'genotype_ID'; // the name of the page that has genotype data

const RACK_NAME_PREFIX = 'rack_'; // each page that represents a rack starts with this
const ROW_LABEL = 'row'; // the column header for the `row` column
const COL_LABEL = 'column'; // the column header for the `col` column
const TANK_GENOTYPE_LABEL = 'ID-'; // the column header for a Tank's genotype ID
const UID_LABEL = 'sort'; // the column header for the tank UIDs
const GENOTYPE_ID_LABEL = 'genotypeID'; // the column header for a genotype's ID

class SQLiteDatabase extends Database {
    /**
     * The database methods inherited from Database need to be defined at build
     * time, but the methods are implemented by the db variable created in the
     * constructor. They could all be reassigned in the constructor, but I
     * decided that whatever implementation code there is should be with the
     * method as much as possible.
     */

    private db: SQLiteDB;
    private _readTank: (((uid: number) => (Tank | undefined)) | undefined);
    private _writeTank: (((uid: number, tank: Tank) => void) | undefined);
    private _readGenotype: (((uid: string) => (Genotype | undefined)) | undefined);
    private _writeGenotype: (((genotype: Genotype) => void) | undefined);
    private _findTank: (((loc: Location) => (Tank | undefined)) | undefined);
    private _getRacks: ((() => Rack[]) | undefined);
    private _getGenotypes: ((() => Map<string, Genotype>) | undefined);
    private _mergeTanks: (((tankNums: number[], newTank: Tank) => void) | undefined)
    private _cullTank: (((tankNum: number, dead?: boolean | undefined) => void) | undefined);
    private _writeLocation: (((loc: Location) => void) | undefined);
    private _getChildren: (((parentId: string) => Genotype[]) | undefined);

    constructor(filename: string) {
        super();

        this.db = new SQLite(filename, { fileMustExist: true });
        this.db.pragma('journal_mode = WAL');
    }

    /**
     * Converts an upper- or lower-case leter to its position in the alphabet.
     * A => 1, a => 1, Z => 26, z => 26
     */
    private static atoi(letter: string): number {
        const code: number = letter.charCodeAt(0);
        return code > 96 ? code - 96 : code - 64;
    }

    /**
     * Converts a number to the corresponding uppercase letter.
     * 1 => A, 26 => Z, all values less than 1 or greater than 26 are undefined
     */
    private static itoa(num: number): string {
        return String.fromCharCode(64 + num);
    }

    /**
     * Converts an object returned from the SQLite3 library into a Tank.
     */
    private static dbToTank(row: any): Tank {
        const fields: Field[] = [];
        for(const label in row) {
            if(label !== "room" && label !== "rack" && label !== "row_num" && label !== "col_num" &&
                label !== "genotype_id" && label !== "tank_uid") {
                fields.push({ label: label, data: row[label] });
            }
        }

        return {
            loc: {
                room: row.room,
                rack: row.rack,
                row: SQLiteDatabase.itoa(row.row_num),
                col: row.col_num
            },
            genotypes: [row.genotype_id],
            uid: row.tank_uid,
            fields: fields
        };
    }

    /**
     * Converts an object returned from the SQLite3 library into a Genotype.
     */
    private static dbToGenotype(row: any): Genotype {
        const fields: Field[] = [];
        for(const label in row) {
            if(label !== "db_id" && label !== "genotype_id") {
                fields.push({ label: label, data: row[label] });
            }
        }

        return {
            uid: row.genotype_id,
            fields: fields,
            tanks: []
        };
    }

    /**
     * Returns a Tank object representing the tank with the given UID and
     * fields populated from the database.
     */
    override readTank(uid: number): (Tank | undefined) {
        if(this._readTank === undefined) {
            this._readTank = this.db.transaction(
                (uid: number): (Tank | undefined) => {

                    const tank: any = this.db.prepare("SELECT * FROM tanks WHERE tank_uid=?")
                                             .get(uid);
                    if(tank === undefined) {
                        return undefined;
                    } else {
                        return SQLiteDatabase.dbToTank(tank);
                    }

                }
            );
        }
        return this._readTank(uid);
    }

    /**
     * Writes a Tank object to the database, reading data from the object's
     * fields. If the Tank has a Field for a column that does not exist in the
     * database, the column will be created first.

     * TODO check for and add novel features
     */
    override writeTank(uid: number, tank: Tank): void {
        if(this._writeTank === undefined) {
            this._writeTank = this.db.transaction(
                (uid: number, tank: Tank): void => {

                    const data = [];
                    let query: string = "INSERT INTO tanks (db_id, tank_uid, room, rack, row_num, col_num, genotype_id";
                    for(const label in tank.fields) {
                        query += ", " + label;
                        data.push(tank.fields[label]);
                    }
                    query += ") VALUES (NULL";
                    query += ", ?".repeat(6 + tank.fields.length);
                    query += ")";

                    this.db.prepare(query)
                           .run(uid,
                                tank.loc.room,
                                tank.loc.rack,
                                SQLiteDatabase.atoi(tank.loc.row),
                                tank.loc.col,
                                tank.genotypes,
                                ...data);

                }
            );
        }
        return this._writeTank(uid, tank);
    }

    /**
     * Returns a Genotype object representing the genotype in the given position
     * with fields populated from the database.
     */
    override readGenotype(uid: string): (Genotype | undefined) {
        if(this._readGenotype === undefined) {
            this._readGenotype = this.db.transaction(
                (uid: string): (Genotype | undefined) => {

                    const genotype: any = this.db.prepare("SELECT * FROM genotypes WHERE genotype_id=?")
                                                 .get(uid);
                    if(genotype === undefined) {
                        return undefined;
                    } else {
                        return SQLiteDatabase.dbToGenotype(genotype);
                    }

                }
            );
        }
        return this._readGenotype(uid);
    }

    /**
     * Writes a Genotype object to the database, reading data from the object's
     * fields. If the Genotype has a Field for a column that does not exist in
     * the database, the column will be created first.

     * TODO check for and add novel features
     */
    override writeGenotype(genotype: Genotype): void {
        if(this._writeGenotype === undefined) {
            this._writeGenotype = this.db.transaction(
                (genotype: Genotype): void => {

                    const data = [];
                    let query: string = "INSERT INTO genotypes (db_id, genotype_id";
                    for(const label in genotype.fields) {
                        query += ", " + label;
                        data.push(genotype.fields[label]);
                    }
                    query += ") VALUES (NULL";
                    query += ", ?".repeat(1 + genotype.fields.length);
                    query += ")";

                    this.db.prepare(query)
                           .run(genotype.uid,
                                ...data);

                }
            );
        }
        return this._writeGenotype(genotype);
    }

    /**
     * Returns the Tank object that represents the tank in the given physical
     * location.
     */
    override findTank(loc: Location): (Tank | undefined) {
        if(this._findTank === undefined) {
            this._findTank = this.db.transaction(
                (loc: Location): (Tank | undefined) => {

                    return SQLiteDatabase.dbToTank(this.db.prepare("SELECT * FROM tanks WHERE room=? AND rack=? AND row_num=? AND col_num=?")
                                  .get(loc.room, loc.rack, SQLiteDatabase.atoi(loc.row), loc.col));

                }
            );
        }
        return this._findTank(loc);
    }

    /**
     * Returns an array of all the Racks.
     */
    override getRacks(): Rack[] {
        if(this._getRacks === undefined) {
            this._getRacks = this.db.transaction(
                (): Rack[] => {
                    throw new Error('Method not implemented.');
                }
            );
        }
        return this._getRacks();
    }

    /**
     * Returns a Map of genotype names to Genotypes.
     */
    override getGenotypes(): Map<string, Genotype> {
        if(this._getGenotypes === undefined) {
            this._getGenotypes = this.db.transaction(
                (): Map<string, Genotype> => {
                    const ret: Map<string, Genotype> = new Map<string, Genotype>();
                    const ids: any[] = this.db.prepare("SELECT genotype_id FROM genotypes").all()
                    for(let uid of ids) {
                        let currGenotype = this.readGenotype(uid);
                        if(currGenotype !== undefined) {
                            ret.set(uid, currGenotype);
                        }
                    }
                    return ret;
                }
            );
        }
        return this._getGenotypes();
    }

    /**
     * Merges the specified Tank numbers into the new Tank.
     */
    override mergeTanks(tankNums: number[], newTank: Tank): void {
        if(this._mergeTanks === undefined) {
            this._mergeTanks = this.db.transaction(
                (tankNums: number[], newTank: Tank): void => {
                    throw new Error('Method not implemented.'); // dependent on fixing tank table to include multiple genotypes
                }
            )
        }
        return this._mergeTanks(tankNums, newTank);
    }

    override cullTank(tankNum: number, dead?: boolean | undefined): void {
        if(this._cullTank === undefined) {
            this._cullTank = this.db.transaction(
                (tankNum: number, dead?: boolean | undefined): void => {
                    throw new Error('Method not implemented.'); // TODO dependent on building graveyard
                }
            )
        }
        return this._cullTank(tankNum, dead);
    }

    override writeLocation(loc: Location): void {
        if(this._writeLocation === undefined) {
            this._writeLocation = this.db.transaction(
                (loc: Location): void => {
                    throw new Error('Method not implemented.'); // TODO dependent on Location reimplementation
                }
            )
        }
        return this._writeLocation(loc);
    }

    override getChildren(parentId: string): Genotype[] {
        if(this._getChildren === undefined) {
            this._getChildren = this.db.transaction(
                (parentId: string): Genotype[] => {
                    const children: any[] = this.db.prepare("SELECT * FROM genotypes WHERE mother_id=? OR father_id=?")
                        .all(parentId, parentId);
                    return children.map((row: any) => {
                        return SQLiteDatabase.dbToGenotype(row);
                    });
                }
            )
        }
        return this._getChildren(parentId);
    }

}

export default SQLiteDatabase;
