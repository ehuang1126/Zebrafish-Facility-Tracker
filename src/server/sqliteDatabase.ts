import xlsx from 'xlsx';
import Database from './database';
import type { CellValue, Field, Tank, Genotype, Location, Rack } from './database';
import SQLite from 'better-sqlite3';
import type { Database as SQLiteDB } from 'better-sqlite3';

const GENOTYPES_PAGE_NAME = 'genotypes'; // the name of the page that has genotype data
const RACKS_PAGE_NAME = 'racks';
const TANKS_PAGE_NAME = 'tanks'
const TANK_ID_LABEL = 'tankID'
const RACK_LABEL = 'rack'; // each page that represents a rack starts with this
const ROW_LABEL = 'row'; // the column header for the `row` column
const COL_LABEL = 'column'; // the column header for the `col` column
const TANK_GENOTYPE_LABEL = 'genotypeID(s)'; // the column header for a Tank's genotype ID
const TANK_DOBS_LABEL = 'DOB(s)';
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
    private _writeRack: (((rack: Rack) => void) | undefined);
    private _getRacks: ((() => Rack[]) | undefined);
    private _getGenotypes: ((() => Map<string, Genotype>) | undefined);
    private _mergeTanks: (((uids: number[]) => Tank) | undefined)
    private _cullTank: (((uid: number) => void) | undefined);
    private _getChildren: (((parentId: string) => Genotype[]) | undefined);

    constructor(filename: string) {
        super();

        this.db = new SQLite(filename, { fileMustExist: true });
        this.db.pragma('journal_mode = WAL');
    }

    override importFromXLSX(filename: string): void {
        const data: xlsx.WorkBook = xlsx.readFile(filename);
        const genotypesPage: (xlsx.WorkSheet | undefined) = data.Sheets[GENOTYPES_PAGE_NAME];
        const racksPage: (xlsx.WorkSheet | undefined) = data.Sheets[RACKS_PAGE_NAME];
        const tanksPage: (xlsx.WorkSheet | undefined) = data.Sheets[TANKS_PAGE_NAME];
        SQLiteDatabase.sheetToRacks(racksPage).forEach((rack: Rack): void => {this.writeRack(rack);});
        SQLiteDatabase.sheetToGenotypes(genotypesPage).forEach((genotype: Genotype): void => {this.writeGenotype(genotype);});
        SQLiteDatabase.sheetToTanks(tanksPage).forEach((tank: Tank, uid: number): void => {this.writeTank(uid, tank);});
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
     * Converts an object returned from the SQLite3 library into a Rack, WITHOUT populating its tanks.
     */
    private static dbToRack(row: any): Rack {
        return {
            rackNum: row.rack_id,
            room: row.room,
            size: {
                width: row.rows,
                height: row.columns,
            },
            tanks: []
        }
    }

    /**
     * Converts an object returned from the SQLite3 library into a Tank.
     */
    private static dbToTank(row: any): Tank {
        const fields: Field[] = [];
        const genotypes: string[] = [];
        const dobs: Date[] = [];
        for(const label in row) {
            if(!label.includes("DOB") && label !== "rack" && label !== "row_num" && label !== "col_num" &&
                !label.includes("genotype_id") && label !== "tank_uid") {
                fields.push({ label: label, data: row[label] });
            }
            if(label.includes('genotype_id') && row[label] !== null) genotypes.push(row[label]);
            if(label.includes('DOB') && row[label] !== null) dobs.push(row[label]);
        }

        return {
            loc: {
                room: row.room,
                rack: row.rack,
                row: SQLiteDatabase.itoa(row.row_num),
                col: row.col_num
            },
            genotypes: genotypes,
            dobs: dobs,
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
            if(label !== "genotypeID" && label !== 'tanks') {
                fields.push({ label: label, data: row[label] });
            }
        }

        return {
            uid: row.genotypeID,
            fields: fields,
            tanks: row.tanks !== '' ? row.tanks.split(',').map(Number) : [],
        };
    }

    /**
     * reads a sheet and converts it to a map from genotype IDs to Genotype
     * objects
     */
    private static sheetToGenotypes(sheet: xlsx.WorkSheet): Map<string, Genotype> {
        const genotypes = new Map<string, Genotype>();
        const sheetShape: (xlsx.Range | undefined) = sheet['!ref'] !== undefined ?
                xlsx.utils.decode_range(sheet['!ref']) :
                undefined;
        const numRows: number = sheetShape?.e.r ?? 0;
        const width: number = (sheetShape?.e.c ?? -1) + 1;
        
        // parse the sheet
        for(let r = 1; r <= numRows; r++) {
            const genotype: Genotype = {
                uid: '!',
                fields: [],
                tanks: [],
            };

            // parse the row
            for(let c = 0; c < width; c++) {
                const label: (CellValue | undefined) = sheet[ xlsx.utils.encode_cell({ r: 0, c: c, }) ]?.w;
                const data: (CellValue | undefined) = sheet[ xlsx.utils.encode_cell({ r: r, c: c, }) ]?.w;

                if(label === GENOTYPE_ID_LABEL && data !== undefined) {
                    genotype.uid = data.toString();
                } else {
                    genotype.fields.push({
                        label: label ?? '',
                        data: data ?? '',
                    });
                }
            }

            if(genotype.uid !== '!') {
                genotypes.set(genotype.uid, genotype);
            }
        }

        return genotypes;
    }

    /**
     * reads a sheet from the csv and stores the racks. should be called before sheetToTanks
     * so that the racks can populate tanks properly. 
     */
    private static sheetToRacks(sheet: xlsx.WorkSheet): Map<number, Rack> {
        const racks: Map<number, Rack> = new Map();
        const sheetShape: (xlsx.Range | undefined) = sheet['!ref'] !== undefined ?
                xlsx.utils.decode_range(sheet['!ref']) :
                undefined;
        const numRows: number = sheetShape?.e.r ?? 0;
        const width: number = (sheetShape?.e.c ?? -1) + 1;

        if(width !== 4) {
            throw new Error(`bad racks width of ${width}`);
        }
        
        // parse the sheet
        for(let r = 1; r <= numRows; r++) {
            const rack: Rack = {
                rackNum: sheet[ xlsx.utils.encode_cell({ r: r, c: 0, }) ]?.w,
                room: sheet[ xlsx.utils.encode_cell({ r: r, c: 1, }) ]?.w,
                size: {
                    width: sheet[ xlsx.utils.encode_cell({ r: r, c: 2, }) ]?.w,
                    height: sheet[ xlsx.utils.encode_cell({ r: r, c: 3, }) ]?.w,
                },
                tanks: [], // initialize as empty for now
            }
            racks.set(rack.rackNum, rack);
        }

        return racks;
    }

    /**
     * reads a sheet from the csv and stores the tanks
     */
    private static sheetToTanks(sheet: xlsx.WorkSheet): Map<number, Tank> {
        const tanks: Map<number, Tank> = new Map();
        const sheetShape: (xlsx.Range | undefined) = sheet['!ref'] !== undefined ?
                xlsx.utils.decode_range(sheet['!ref']) :
                undefined;
        const numRows: number = sheetShape?.e.r ?? 0;
        const width: number = (sheetShape?.e.c ?? -1) + 1;
        
        // parse the sheet
        for(let r = 1; r <= numRows; r++) {
            const tank: Tank = {
                uid: -1,
                genotypes: [],
                dobs: [],
                loc: {
                    room: '',
                    rack: -1,
                    row: '',
                    col: -1,
                },
                fields: []
            }
            // parse the row
            for(let c = 0; c < width; c++) {
                
                const label: (CellValue | undefined) = sheet[ xlsx.utils.encode_cell({ r: 0, c: c, }) ]?.w;
                const data: (CellValue | undefined) = sheet[ xlsx.utils.encode_cell({ r: r, c: c, }) ]?.w;

                if(label === RACK_LABEL && data !== undefined) {
                    tank.loc.rack = Number(data);
                } else if(label === ROW_LABEL && data !== undefined) {
                    tank.loc.row = data.toString();
                } else if(label === COL_LABEL && data !== undefined) {
                    tank.loc.col = Number(data);
                } else if(label === TANK_GENOTYPE_LABEL && data !== undefined) {
                    tank.genotypes = data.toString().split(', ');
                } else if(label === TANK_DOBS_LABEL && data !== undefined) {
                    tank.dobs = data.toString().split(', ').map((value: string): Date => new Date(value)); 
                } else if(label === TANK_ID_LABEL && data !== undefined) {
                    tank.uid = Number(data);
                } else {
                    tank.fields.push({
                        label: label ?? '',
                        data: data ?? '',
                    });
                }
            }
            tanks.set(tank.uid, tank);
        }
        return tanks;
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
     * database, the column will be created first. If the Tank has more genotypes
     * than the database has columns for, the extra columns will be created first.
     */
    override writeTank(uid: number, tank: Tank): void {
        if(this._writeTank === undefined) {
            this._writeTank = this.db.transaction(
                (uid: number, tank: Tank): void => {

                    const data = []; // compiled field data
                    let query: string = "INSERT OR REPLACE INTO tanks (tank_uid, rack, row_num, col_num";
                    // track all genotypes
                    let genotypeNum: number = 0;
                    for(let genotype of tank.genotypes) {
                        genotypeNum++;
                        query += ", " + `genotype_id_${genotypeNum}`;

                        // check that there are enough genotype columns in the table. if not, add more columns.
                        let numGenotypeCols: number = this.db.prepare("SELECT * FROM tanks").columns().map((column): number => column.name.includes('genotype_id_') ? 1 : 0)
                            .reduce((prev: number, next: number): number => prev + next)
                        if(numGenotypeCols < genotypeNum) {
                                this.db.prepare(`ALTER TABLE tanks ADD COLUMN \"genotype_id_${genotypeNum}\"`).run();
                        }
                        // check that all genotypes exist and add tanks to those genotypes
                        const genotypeObj: Genotype | undefined = this.readGenotype(genotype);
                        if(genotypeObj === undefined) {
                            throw new Error(`Genotype ${genotype} not found`)
                        } else {
                            genotypeObj.tanks.push(uid);
                            this.writeGenotype(genotypeObj);
                        }
                    }
                    // track all DOBs
                    let DOBnum: number = 0;
                    for(let dob of tank.dobs) {
                        DOBnum++;
                        query += ", " + `DOB_${DOBnum}`;

                        // check that there are enough DOB columns in the table. if not, add more columns.
                        let numDOBCols: number = this.db.prepare("SELECT * FROM tanks").columns().map((column): number => column.name.includes('DOB') ? 1 : 0)
                            .reduce((prev: number, next: number): number => prev + next)
                        if(numDOBCols < DOBnum) {
                                this.db.prepare(`ALTER TABLE tanks ADD COLUMN \"DOB_${DOBnum}\"`).run();
                        }
                    }
                    // track all fields
                    for(const field of tank.fields) {
                        // remove all spaces from label so that query works as intended
                        let label: string = field.label.toString().replaceAll(' ', '_'); 
                        query += ", " + label;
                        data.push(tank.fields[tank.fields.indexOf(field)].data);
                        // check that the column exists. if not, add it to the table
                        if(!this.db.prepare("SELECT * FROM tanks").columns().map((column): string => column.name.toLowerCase())
                            .includes(label.toLowerCase())) {
                                this.db.prepare(`ALTER TABLE tanks ADD COLUMN \"${label}\"`).run();
                        }
                    }
                    query += ") VALUES (?";
                    query += ", ?".repeat(3 + tank.genotypes.length + tank.dobs.length + tank.fields.length);
                    query += ")";

                    this.db.prepare(query)
                           .run(uid,
                                tank.loc.rack,
                                SQLiteDatabase.atoi(tank.loc.row),
                                tank.loc.col,
                                tank.genotypes,
                                tank.dobs.map((date: Date): string => new Date(date).toDateString()),
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
                    const genotype: any = this.db.prepare("SELECT * FROM genotypes WHERE genotypeID=?")
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
     */
    override writeGenotype(genotype: Genotype): void {
        if(this._writeGenotype === undefined) {
            this._writeGenotype = this.db.transaction(
                (genotype: Genotype): void => {
                    const data = [];
                    let query: string = "INSERT OR REPLACE INTO genotypes (genotypeID, tanks";
                    for(let field of genotype.fields) {
                        // remove all spaces from label so that query works as intended
                        let label: string = field.label.toString().replaceAll(' ', '_'); 
                        query += ", " + label;
                        // check that the column exists. if not, add it to the table
                        if(!this.db.prepare("SELECT * FROM genotypes").columns().map((column): string => column.name.toLowerCase())
                            .includes(label.toLowerCase())) {
                                this.db.prepare(`ALTER TABLE genotypes ADD COLUMN \"${label}\"`).run();
                        }
                        data.push(genotype.fields[genotype.fields.indexOf(field)].data);
                    }
                    query += ") VALUES (?";
                    query += ", ?".repeat(1 + genotype.fields.length);
                    query += ")";
                    this.db.prepare(query)
                           .run(genotype.uid,
                                genotype.tanks.join(','),
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

                    return SQLiteDatabase.dbToTank(this.db.prepare("SELECT * FROM tanks WHERE rack=? AND row_num=? AND col_num=?")
                                  .get(loc.rack, SQLiteDatabase.atoi(loc.row), loc.col));

                }
            );
        }
        return this._findTank(loc);
    }

    override writeRack(rack: Rack): void {
        if(this._writeRack === undefined) {
            this._writeRack = this.db.transaction(
                (rack: Rack): void => {
                    this.db.prepare("INSERT OR REPLACE INTO racks VALUES (?, ?, ?, ?)").run(rack.rackNum, rack.room, rack.size.width, rack.size.height);
                }
            )
        }
        return this._writeRack(rack);
    }

    /**
     * Returns an array of all the Racks.
     */
    override getRacks(): Rack[] {
        if(this._getRacks === undefined) {
            this._getRacks = this.db.transaction(
                (): Rack[] => {
                    const racks: Rack[] = this.db.prepare("SELECT * FROM racks").all().map(SQLiteDatabase.dbToRack);
                    // populate tanks
                    const tanks: Tank[] = this.db.prepare("SELECT * FROM tanks").all().map(SQLiteDatabase.dbToTank);
                    for(let tank of tanks) {
                        racks.find((rack: Rack): boolean => rack.rackNum === tank.loc.rack)?.tanks.push(tank);
                    }
                    return racks;
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
                    const ids: string[] = this.db.prepare("SELECT genotypeID FROM genotypes").all().map((id: any): string => id.genotypeID);
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
     * Merges the specified Tank numbers into the new Tank, saving
     * the new Tank back to the database. Will default put the new Tank in the 
     * Tank with the first UID's Location. 
     */
    override mergeTanks(uids: number[]): Tank {
        if(this._mergeTanks === undefined) {
            this._mergeTanks = this.db.transaction(
                (uids: number[]): Tank => {
                    // get next free tank ID 
                    let nextID: number = 1;
                    while(this.readTank(nextID) !== undefined) nextID += 1;

                    // remove from tanks table and concatenate genotypes/fields
                    let genotypes: string[] = [];
                    let dobs: Date[] = [];
                    let fields: Field[] = [];
                    let loc = undefined;
                    for(let uid of uids) {
                        let currTank = this.readTank(uid);
                        if(currTank === undefined) {
                            throw new Error(`Tank with uid ${uid} not found. `)
                        }
                        currTank = currTank as Tank;
                        this.db.prepare("DELETE * FROM tanks WHERE tank_uid=?").run(uid);
                        genotypes = genotypes.concat(currTank.genotypes);
                        dobs = dobs.concat(currTank.dobs);
                        fields = fields.concat(currTank.fields);
                        if(loc === undefined) loc = currTank.loc
                    }
                    loc = loc as Location;
                    const newTank: Tank = {
                        loc: loc,
                        genotypes: genotypes,
                        dobs: dobs,
                        uid: nextID,
                        fields: fields,
                    };
                    this.writeTank(newTank.uid, newTank);
                    return newTank;
                }
            )
        }
        return this._mergeTanks(uids);
    }

    override cullTank(uid: number): void {
        if(this._cullTank === undefined) {
            this._cullTank = this.db.transaction(
                (uid: number): void => {
                    const tank = this.readTank(uid);
                    if(tank === undefined) {
                        throw new Error(`Tank with uid ${uid} cannot be found. `);
                    }
                    
                    // remove from tanks table
                    this.db.prepare("DELETE * FROM tanks WHERE tank_uid=?").run(uid);

                    // insert into graveyard
                    const data = [];
                    let query: string = "INSERT INTO graveyard (db_id, tank_uid, cull_date, room, rack, row_num, col_num";
                    let numColumns: number = 6;

                    for(let genotype of tank.genotypes) {
                        numColumns += 1;
                        query += ", " + `genotype_id_${numColumns - 6}`;
                        data.push(genotype)
                    }
                    for(const label in tank.fields) {
                        query += ", " + label;
                        data.push(tank.fields[label]);
                    }
                    query += ") VALUES (NULL";
                    query += ", ?".repeat(numColumns - 1 + tank.fields.length);
                    query += ")";

                    this.db.prepare(query)
                           .run(uid,
                                new Date().toDateString(),
                                tank.loc.room,
                                tank.loc.rack,
                                SQLiteDatabase.atoi(tank.loc.row),
                                tank.loc.col,
                                tank.genotypes,
                                ...data);


                }
            )
        }
        return this._cullTank(uid);
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
