import xlsx from 'xlsx';

const RACK_NAME_PREFIX = 'rack#';
const ROW_LABEL = 'row';
const COL_LABEL = 'col';
const GENE_ID_LABEL = 'gene ID';
// these are the maximum dimensions according to the xlsx library
// const MAX_ROW: number = 1048575;
// const MAX_COL: number = 16383;

type CellValue = (string | number);

type Field = {
    label: CellValue,
    data: CellValue,
};

// A tank is an ordered array of label:data pairs.
type Tank = {
    loc: Location,
    gene: Gene,
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

type Row = CellValue[];

type Gene = any; // TODO implement

type Location = {
    rack: number,
    row: string,
    // col is 1-indexed
    col: number,
};

/**
 * This file exports a minimal database interface for use with the zebrafish
 * manager. The most important method here is `attachHandlers`, which takes an
 * `ipcMain` and attaches handlers for reading and writing Tanks and Genes to
 * and from the database.
 *
 * A Tank is an object with 'labels' and 'data' fields which are paired arrays
 * such that the i-th element in the 'labels' array is the label for the i-th
 * element in the 'data' array.
 */
class Database {
    private racks: Rack[];

    constructor(filename: string) {
        const db: xlsx.WorkBook = xlsx.readFile(filename);

        this.racks = [];
        db.SheetNames.filter((name: string, i: number, names: string[]): boolean => (
            name.startsWith(RACK_NAME_PREFIX)
        )).map((name: string, i: number, rackSheets: string[]): void => {
            const rackNum: number = Number(name.substring(RACK_NAME_PREFIX.length));
            this.racks[rackNum] = Database.sheetToRack(db, rackNum);
        })
    }

    /**
     * reads a sheet from the database and converts it to a rack
     */
    private static sheetToRack(db: xlsx.WorkBook, rackNum: number): Rack {
        const rackName: string = RACK_NAME_PREFIX + rackNum;
        const sheet: xlsx.WorkSheet = db.Sheets[rackName];
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
            const tank: Tank = Database.rowToTank(sheet, rowNum);
            const locationHash = Database.hashLocation(rack.size.width, tank.loc);
            if(locationHash >= 0) { // TODO change to include if any data is present
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
    private static rowToTank(sheet: xlsx.WorkSheet, rowNum: number): Tank {
        const width: number = sheet['!ref'] !== undefined ? 
                xlsx.utils.decode_range(sheet['!ref']).e.c + 1 :
                0;
        const tank: Tank = {
            loc: {
                rack: -1,
                row: '!',
                col: -1,
            },
            gene: '!',
            fields: [],
        };

        // populate the tank from the row of data
        for(let colNum: number = 0; colNum < width; colNum++) {
            const label: CellValue = sheet[ xlsx.utils.encode_cell({ r: 0, c: colNum, }) ]?.w;
            const data: CellValue = sheet[ xlsx.utils.encode_cell({ r: rowNum, c: colNum, }) ]?.w;

            if(label === ROW_LABEL && data !== undefined) {
                tank.loc.row = data as string;
            } else if(label === COL_LABEL && data !== undefined) {
                tank.loc.col = Number(data);
            } else if(label === GENE_ID_LABEL) {
                tank.gene = data as string;
            } else {
                tank.fields.push({
                    label: label,
                    data: data,
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
     * Returns a Tank object representing the tank in the given position with
     * fields populated from the database.
     */
    readTank(loc: Location): Tank {
        const rack: Rack = this.racks[loc.rack];
        return this.racks[rack.rackNum].tanks[Database.hashLocation(rack.size.width, loc)];
    }

    /**
     * Writes a Tank object to the database, reading data from the object's
     * fields.
     */
    writeTank(loc: Location, tank: Tank): void {
        const rack: Rack = this.racks[loc.rack];
        this.racks[rack.rackNum].tanks[Database.hashLocation(rack.size.width, loc)] = tank;
    }

    /**
     * Returns a Gene object representing the tank in the given position with
     * fields populated from the database.
     */
    readGene(id: string): Gene {
        // TODO implement
        return `readGene(${ id })`;
    }

    /**
     * Writes a Gene object to the database, reading data from the object's
     * fields.
     */
    writeGene(id: string, gene: Gene): void {
        // TODO implement
        console.log(`writeGene(${ id })`);
    }

    /**
     * Attaches the event handlers that send database data back to the renderer.
     */
    attachHandlers(ipcMain: Electron.IpcMain) {
        ipcMain.handle('db:readTank',  (event, loc: Location) => this.readTank(loc));
        ipcMain.handle('db:writeTank', (event, loc: Location, tank: Tank) => this.writeTank(loc, tank));
        ipcMain.handle('db:readGene',  (event, id: string) => this.readGene(id));
        ipcMain.handle('db:writeGene', (event, id: string, gene: Gene) => this.writeGene(id, gene));
    }
}

export default Database;
export type {
    CellValue,
    Field,
    Tank,
    Gene,
    Location,
};
