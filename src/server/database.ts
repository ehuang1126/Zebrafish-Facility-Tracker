import xlsx from 'xlsx';

const RACK_NAME_PREFIX = 'rack#';
const ROW_LABEL = 'row';
const COL_LABEL = 'col';
const GENE_ID_LABEL = 'gene ID';
const UID_LABEL = 'UID';
const GENE_PAGE_NAME = 'genes';
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
    gene: string,
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

type Gene = {
    uid: string,
    fields: Field[],
};

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
    private filename: string;
    private racks: Rack[];
    private tanks: Map<number, Tank>; 
    private genes: Map<string, Gene>;

    constructor(filename: string) {
        // load the database into memory
        this.filename = filename;
        const db: xlsx.WorkBook = xlsx.readFile(filename);

        // create a list of all the racks
        this.racks = [];
        db.SheetNames.filter((name: string, i: number, names: string[]): boolean => (
            name.startsWith(RACK_NAME_PREFIX)
        )).forEach((name: string, i: number, rackSheets: string[]): void => {
            const rackNum: number = Number(name.substring(RACK_NAME_PREFIX.length));
            this.racks[rackNum] = Database.sheetToRack(db, rackNum);
        })
    
        // store all the tanks into a map from UID to tank
        this.tanks = new Map<number, Tank>();
        this.racks.forEach((rack: Rack, i: number, racks: Rack[]): void => {
            rack.tanks.forEach((tank: Tank, j: number, tanks: Tank[]): void => {
                this.tanks.set(tank.uid, tank);
            });
        });
        
        // load genes
        const genePage: (xlsx.WorkSheet | undefined) = db.Sheets[GENE_PAGE_NAME];
        this.genes = Database.sheetToGenes(genePage);
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

        const rack: (Rack | undefined) = this.racks[tank.loc.rack];
        rack.tanks[Database.hashLocation(rack.size.width, tank.loc)] = tank;
    }

    /**
     * Returns a Gene object representing the gene in the given position with
     * fields populated from the database.
     */
    readGene(uid: string): (Gene | undefined) {
        return this.genes.get(uid);
    }

    /**
     * Writes a Gene object to the database, reading data from the object's
     * fields.
     */
    writeGene(gene: Gene): void {
        this.genes.set(gene.uid, gene);
    }

    /**
     * Returns the Tank object that represents the tank in the given physical
     * location.
     */
    findTank(loc: Location): (Tank | undefined) {
        const rack: (Rack | undefined) = this.racks[loc.rack];
        const tank: (Tank | undefined) = rack.tanks[Database.hashLocation(rack.size.width, loc)];
        return tank;
    }

    getRacks(): Rack[] {
        return this.racks;
    }

    getGenes(): Map<string, Gene> {
        return this.genes;
    }

    /**
     * Attaches the event handlers that send database data back to the renderer.
     */
    attachHandlers(ipcMain: Electron.IpcMain): void {
        ipcMain.handle('db:readTank',  (event, uid: number): (Tank | undefined) => this.readTank(uid));
        ipcMain.handle('db:writeTank', (event, uid: number, tank: Tank): void => this.writeTank(uid, tank));
        ipcMain.handle('db:readGene',  (event, uid: string): (Gene | undefined) => this.readGene(uid));
        ipcMain.handle('db:writeGene', (event, gene: Gene): void => this.writeGene(gene));
        ipcMain.handle('db:findTank',  (event, loc: Location): (Tank | undefined) => this.findTank(loc));
        ipcMain.handle('db:getRacks', (event): Rack[] => this.getRacks());
        ipcMain.handle('db:getGenes', (event): Map<string, Gene> => this.getGenes());
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
            const locationHash = Database.hashLocation(rack.size.width, tank.loc);
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
            gene: '!',
            uid: -1,
            fields: [],
        };

        // populate the tank from the row of data
        for(let colNum: number = 0; colNum < width; colNum++) {
            const label: CellValue = sheet[ xlsx.utils.encode_cell({ r: 0, c: colNum, }) ]?.w;
            const data: CellValue = sheet[ xlsx.utils.encode_cell({ r: rowNum, c: colNum, }) ]?.w;

            if(label === ROW_LABEL && data !== undefined) {
                tank.loc.row = data.toString();
            } else if(label === COL_LABEL && data !== undefined) {
                tank.loc.col = Number(data);
            } else if(label === GENE_ID_LABEL && data !== undefined) {
                tank.gene = data.toString();
            } else if(label === UID_LABEL) {
                tank.uid = Number(data);
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
     * reads a sheet and converts it to a map from gene IDs to Gene objects
     */
    private static sheetToGenes(sheet: xlsx.WorkSheet): Map<string, Gene> {
        const genes = new Map<string, Gene>();
        const sheetShape: (xlsx.Range | undefined) = sheet['!ref'] !== undefined ?
                xlsx.utils.decode_range(sheet['!ref']) :
                undefined;
        const numRows: number = sheetShape?.e.r ?? 0;
        const width: number = sheetShape?.e.c ?? 0;
        
        // parse the sheet
        for(let r = 1; r < numRows; r++) {
            const gene: Gene = {
                uid: '!',
                fields: [],
            };

            // parse the row
            for(let c = 0; c < width; c++) {
                const label: CellValue = sheet[ xlsx.utils.encode_cell({ r: 0, c: c, }) ]?.w;
                const data: CellValue = sheet[ xlsx.utils.encode_cell({ r: r, c: c, }) ]?.w;

                if(label === GENE_ID_LABEL && data !== undefined) {
                    gene.uid = data.toString();
                } else {
                    gene.fields.push({
                        label: label,
                        data: data,
                    });
                }
            }

            if(gene.uid !== '!') {
                genes.set(gene.uid, gene);
            }
        }

        return genes;
    }
}

export default Database;
export type {
    CellValue,
    Field,
    Tank,
    Gene,
    Location,
    Rack,
};
