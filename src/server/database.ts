import xlsx from 'xlsx';

const RACK_NAME_PREFIX = 'rack_'; // each page that represents a rack starts with this
const ROW_LABEL = 'row'; // the column header for the `row` column
const COL_LABEL = 'column'; // the column header for the `col` column
const TANK_GENOTYPE_LABEL = 'ID-'; // the column header for a Tank's genotype ID
const UID_LABEL = 'sort'; // the column header for the tank UIDs
const GENOTYPE_PAGE_NAME = 'gene_ID'; // the name of the page that has genotype data
const GENOTYPE_ID_LABEL = 'genotypeID'; // the column header for a genotype's ID

type CellValue = (string | number);

type Field = {
    label: CellValue,
    data: CellValue,
};

// A tank is an ordered array of label:data pairs.
type Tank = {
    loc: Location,
    genotype: string,
    uid: number,
    fields: Field[],
};

type Rack = {
    rackNum: number,
    size: {
        width: number,
        height: number,
    },
    tanks: Tank[],
};

type Genotype = {
    uid: string,
    fields: Field[],
    tanks: number[],
};

type Location = {
    // TODO add a field for the room
    rack: number,
    row: string,
    // col is 1-indexed
    col: number,
};

/**
 * This file exports a minimal database interface for use with the zebrafish
 * manager. The most important method here is `attachHandlers`, which takes an
 * `ipcMain` and attaches handlers for reading and writing Tanks and Genotypes
 * to and from the database.
 *
 * A Tank is an object with 'labels' and 'data' fields which are paired arrays
 * such that the i-th element in the 'labels' array is the label for the i-th
 * element in the 'data' array.
 */
class Database {
    private filename: string;
    private racks: Rack[];
    private tanks: Map<number, Tank>; 
    private genotypes: Map<string, Genotype>;

    constructor(filename: string) {
        // load the database into memory
        this.filename = filename;
        const db: xlsx.WorkBook = xlsx.readFile(filename);
        
        // be sure to load genotypes before tanks, so the tanks can populate the
        // genotypes' indices
        const genotypePage: (xlsx.WorkSheet | undefined) = db.Sheets[GENOTYPE_PAGE_NAME];
        this.genotypes = Database.sheetToGenotypes(genotypePage);

        // create a list of all the racks
        this.racks = [];
        db.SheetNames.filter((name: string): boolean => (
            name.startsWith(RACK_NAME_PREFIX)
        )).forEach((name: string): void => {
            const rackNum: number = Number(name.substring(RACK_NAME_PREFIX.length));
            this.racks[rackNum - 1] = Database.sheetToRack(db, rackNum);
        });

        // store all the tanks into a map from UID to tank
        this.tanks = new Map<number, Tank>();
        this.racks.forEach((rack: Rack): void => {
            rack.tanks.forEach((tank: Tank): void => {
                this.tanks.set(tank.uid, tank);
                this.genotypes.get(tank.genotype)?.tanks.push(tank.uid);
            });
        });
    }

    /**
     * Returns a Tank object representing the tank with the given UID and
     * fields populated from the database.
     */
    readTank(uid: number): (Tank | undefined) {
        return this.tanks.get(uid);
    }

    /**
     * Writes a Tank object to the database, reading data from the object's
     * fields.
     */
    writeTank(uid: number, tank: Tank): void {
        this.tanks.set(uid, tank);

        const rack: (Rack | undefined) = this.racks[tank.loc.rack - 1];
        rack.tanks[Database.hashLocation(rack.size.width, tank.loc)] = tank;
    }

    /**
     * Returns a Genotype object representing the genotype in the given position
     * with fields populated from the database.
     */
    readGenotype(uid: string): (Genotype | undefined) {
        return this.genotypes.get(uid);
    }

    /**
     * Writes a Genotype object to the database, reading data from the object's
     * fields.
     */
    writeGenotype(genotype: Genotype): void {
        this.genotypes.set(genotype.uid, genotype);
    }

    /**
     * Returns the Tank object that represents the tank in the given physical
     * location.
     */
    findTank(loc: Location): (Tank | undefined) {
        const rack: (Rack | undefined) = this.racks[loc.rack - 1];
        const tank: (Tank | undefined) = rack.tanks[Database.hashLocation(rack.size.width, loc)];
        return tank;
    }

    getRacks(): Rack[] {
        return this.racks;
    }

    getGenotypes(): Map<string, Genotype> {
        return this.genotypes;
    }

    /**
     * Attaches the event handlers that send database data back to the renderer.
     */
    attachHandlers(ipcMain: Electron.IpcMain): void {
        ipcMain.handle('db:readTank',  (event, uid: number): (Tank | undefined) => this.readTank(uid));
        ipcMain.handle('db:writeTank', (event, uid: number, tank: Tank): void => this.writeTank(uid, tank));
        ipcMain.handle('db:readGenotype',  (event, uid: string): (Genotype | undefined) => this.readGenotype(uid));
        ipcMain.handle('db:writeGenotype', (event, genotype: Genotype): void => this.writeGenotype(genotype));
        ipcMain.handle('db:findTank',  (event, loc: Location): (Tank | undefined) => this.findTank(loc));
        ipcMain.handle('db:getRacks', (event): Rack[] => this.getRacks());
        ipcMain.handle('db:getGenotypes', (event): Map<string, Genotype> => this.getGenotypes());
    }

    /**
     * reads a sheet from the database and converts it to a rack
     */
    private static sheetToRack(db: xlsx.WorkBook, rackNum: number): Rack {
        const rackName: string = RACK_NAME_PREFIX + rackNum;
        const sheet: (xlsx.WorkSheet | undefined) = db.Sheets[rackName];
        const rowsOfData: number = sheet['!ref'] !== undefined ?
                xlsx.utils.decode_range(sheet['!ref']).e.r :
                0;
        const rack: Rack = {
            rackNum: rackNum,
            size: Database.getRackShape(db, rackName),
            tanks: [],
        };

        // populate the rack from the sheet
        for(let rowNum = 1; rowNum < 1 + rowsOfData; rowNum++) {
            const tank: Tank = Database.rowToTank(rackNum, sheet, rowNum);
            const locationHash: number = Database.hashLocation(rack.size.width, tank.loc);
            if(locationHash >= 0) {
                // TODO change this condition to check whether any data at all is in the row
                rack.tanks[locationHash] = tank;
            }
        }

        return rack;
    }

    /**
     * returns the number of rows and columns of a specific rack
     */
    private static getRackShape(db: xlsx.WorkBook, rackName: string): { width: number, height: number, } {
        // TODO implement
        return {
            width: 12,
            height: 2,
        }
    }

    /**
     * converts a row from a sheet into a Tank
     */
    private static rowToTank(rackNum: number, sheet: xlsx.WorkSheet, rowNum: number): Tank {
        const width: number = sheet['!ref'] !== undefined ? 
                xlsx.utils.decode_range(sheet['!ref']).e.c + 1 :
                0;
        const tank: Tank = {
            loc: {
                rack: rackNum,
                row: '!',
                col: -1,
            },
            genotype: '!',
            uid: -1,
            fields: [],
        };

        // populate the tank from the row of data
        for(let colNum: number = 0; colNum < width; colNum++) {
            const label: (CellValue | undefined) = sheet[ xlsx.utils.encode_cell({ r: 0, c: colNum, }) ]?.w;
            const data: (CellValue | undefined) = sheet[ xlsx.utils.encode_cell({ r: rowNum, c: colNum, }) ]?.w;

            if(label === ROW_LABEL && data !== undefined) {
                tank.loc.row = data.toString();
            } else if(label === COL_LABEL && data !== undefined) {
                tank.loc.col = Number(data);
            } else if(label === TANK_GENOTYPE_LABEL && data !== undefined) {
                tank.genotype = data.toString();
            } else if(label === UID_LABEL) {
                tank.uid = Number(data);
            } else {
                tank.fields.push({
                    label: label ?? '',
                    data: data ?? '',
                });
            }
        }

        return tank;
    }

    /**
     * numbers each tank in a rack such that the first tank in the first row
     * gets 0, the second tank in the first row gets 1, etc., the first tank in
     * the second row gets `width`, etc.
     */
    private static hashLocation(width: number, loc: Location): number {
        return width * (Database.rowToNum(loc.row) - 1) + loc.col - 1;
    }

    /**
     * converts the letter-based row labels to 1-indexed numbers 
     */
    private static rowToNum(row: string): number {
        const asciiVal: number = row.charCodeAt(0);
        return asciiVal > 96 ? asciiVal - 96 : asciiVal - 64;
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
        const width: number = sheetShape?.e.c ?? 0;
        
        // parse the sheet
        for(let r = 1; r < numRows; r++) {
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
}

export default Database;
export type {
    CellValue,
    Field,
    Tank,
    Genotype,
    Location,
    Rack,
};
