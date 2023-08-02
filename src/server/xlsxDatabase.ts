import xlsx from 'xlsx';
import Database from './database';
import type { CellValue, Tank, Genotype, Location, Rack } from './database';

const RACK_NAME_PREFIX = 'rack_'; // each page that represents a rack starts with this
const ROW_LABEL = 'row'; // the column header for the `row` column
const COL_LABEL = 'column'; // the column header for the `col` column
const TANK_GENOTYPE_LABEL = 'ID-'; // the column header for a Tank's genotype ID
const UID_LABEL = 'sort'; // the column header for the tank UIDs
const GENOTYPE_PAGE_NAME = 'gene_ID'; // the name of the page that has genotype data
const GENOTYPE_ID_LABEL = 'genotypeID'; // the column header for a genotype's ID

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
class XLSXDatabase extends Database {
    override importFromXLSX(fileName: string): void {
        throw new Error('Method not implemented.');
    }
    override writeRack(rack: Rack): void {
        throw new Error('Method not implemented.');
    }
    override mergeTanks(uids: number[]): Tank {
        throw new Error('Method not implemented.');
    }
    override cullTank(uid: number): void {
        throw new Error('Method not implemented.');
    }
    override getChildren(parentId: string): Genotype[] {
        throw new Error('Method not implemented.');
    }
    private filename: string;
    private racks: Rack[];
    private tanks: Map<number, Tank>; 
    private genotypes: Map<string, Genotype>;

    constructor(filename: string) {
        super();

        // load the database into memory
        this.filename = filename;
        const db: xlsx.WorkBook = xlsx.readFile(filename);
        
        // be sure to load genotypes before tanks, so the tanks can populate the
        // genotypes' indices
        const genotypePage: (xlsx.WorkSheet | undefined) = db.Sheets[GENOTYPE_PAGE_NAME];
        this.genotypes = XLSXDatabase.sheetToGenotypes(genotypePage);

        // create a list of all the racks
        this.racks = [];
        db.SheetNames.filter((name: string): boolean => (
            name.startsWith(RACK_NAME_PREFIX)
        )).forEach((name: string): void => {
            const rackNum: number = Number(name.substring(RACK_NAME_PREFIX.length));
            this.racks[rackNum - 1] = XLSXDatabase.sheetToRack(db, rackNum);
        });

        // store all the tanks into a map from UID to tank
        this.tanks = new Map<number, Tank>();
        this.racks.forEach((rack: Rack): void => {
            rack.tanks.forEach((tank: Tank): void => {
                this.tanks.set(tank.uid, tank);
                this.genotypes.get(tank.genotypes[0])?.tanks.push(tank.uid);
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
        rack.tanks[XLSXDatabase.hashLocation(rack.size.width, tank.loc)] = tank;
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
        const tank: (Tank | undefined) = rack.tanks[XLSXDatabase.hashLocation(rack.size.width, loc)];
        return tank;
    }

    getRacks(): Rack[] {
        return this.racks;
    }

    getGenotypes(): Map<string, Genotype> {
        return this.genotypes;
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
            room: '',
            size: XLSXDatabase.getRackShape(db, rackName),
            tanks: [],
        };

        // populate the rack from the sheet
        for(let rowNum = 1; rowNum < 1 + rowsOfData; rowNum++) {
            const tank: Tank = XLSXDatabase.rowToTank(rackNum, sheet, rowNum);
            const locationHash: number = XLSXDatabase.hashLocation(rack.size.width, tank.loc);
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
                room: "", // TODO this is a placeholder value, since I'll probably never use this class again
                rack: rackNum,
                row: '!',
                col: -1,
            },
            dobs: [],
            genotypes: ['!'],
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
                tank.genotypes.push(data.toString());
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

export default XLSXDatabase;
