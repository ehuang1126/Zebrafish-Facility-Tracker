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
    room: string,
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
abstract class Database {
    /**
     * Returns a Tank object representing the tank with the given UID and
     * fields populated from the database.
     */
    abstract readTank(uid: number): (Tank | undefined);

    /**
     * Writes a Tank object to the database, reading data from the object's
     * fields.
     */
    abstract writeTank(uid: number, tank: Tank): void;

    /**
     * Returns a Genotype object representing the genotype in the given position
     * with fields populated from the database.
     */
    abstract readGenotype(uid: string): (Genotype | undefined);

    /**
     * Writes a Genotype object to the database, reading data from the object's
     * fields.
     */
    abstract writeGenotype(genotype: Genotype): void;

    /**
     * Returns the Tank object that represents the tank in the given physical
     * location.
     */
    abstract findTank(loc: Location): (Tank | undefined);

    /**
     * Returns an array of all the Racks.
     */
    abstract getRacks(): Rack[];

    /**
     * Returns a Map of genotype names to Genotypes.
     */
    abstract getGenotypes(): Map<string, Genotype>;

    /**
     * Attaches the event handlers that send database data back to the renderer.
     */
    public attachHandlers(ipcMain: Electron.IpcMain): void {
        ipcMain.handle('db:readTank',  (event, uid: number): (Tank | undefined) => this.readTank(uid));
        ipcMain.handle('db:writeTank', (event, uid: number, tank: Tank): void => this.writeTank(uid, tank));
        ipcMain.handle('db:readGenotype',  (event, uid: string): (Genotype | undefined) => this.readGenotype(uid));
        ipcMain.handle('db:writeGenotype', (event, genotype: Genotype): void => this.writeGenotype(genotype));
        ipcMain.handle('db:findTank',  (event, loc: Location): (Tank | undefined) => this.findTank(loc));
        ipcMain.handle('db:getRacks', (event): Rack[] => this.getRacks());
        ipcMain.handle('db:getGenotypes', (event): Map<string, Genotype> => this.getGenotypes());
    }

    /**
     * Returns a unique hash for each location.
     * 
     * This implementation numbers each tank in a rack such that the first tank
     * in the first row gets 0, the second tank in the first row gets 1, etc.,
     * the first tank in the second row gets `width`, etc.
     */
    protected static hashLocation(width: number, loc: Location): number {
        return width * (Database.rowToNum(loc.row) - 1) + loc.col - 1;
    }

    /**
     * Converts the letter-based row labels to 1-indexed numbers.
     */
    protected static rowToNum(row: string): number {
        const asciiVal: number = row.charCodeAt(0);
        return asciiVal > 96 ? asciiVal - 96 : asciiVal - 64;
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
