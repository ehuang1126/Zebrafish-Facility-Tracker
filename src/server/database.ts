import xlsx from 'xlsx';

const TANK_SHEET_NAME = 'tank_data';
// these are the maximum dimensions according to the xlsx library
// const MAX_ROW: number = 1048575;
// const MAX_COL: number = 16383;

type CellValue = (string | number);

type Field = {
    label: CellValue,
    data: CellValue,
};

// A tank is an ordered array of label:data pairs.
type Tank = Field[];

type Row = CellValue[];

type Gene = any; // TODO implement

type Location = {
    row: number,
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
    private db;

    constructor(filename: string) {
        this.db = xlsx.readFile(filename);
    }

    /**
     * Returns a single row from the sheet as an array. Assumes the sheet
     * starts at A1.
     */
    private getRow(sheet: xlsx.WorkSheet, rowNum: number): Row {
        const width: number = sheet['!ref'] !== undefined ? 
                xlsx.utils.decode_range(sheet['!ref']).e.c + 1 :
                0;
        let row: Row = [];
        for(let colNum: number = 0; colNum < width; colNum++) {
            var nextCell: xlsx.WorkSheet = sheet[
                xlsx.utils.encode_cell({r: rowNum, c: colNum})
            ];
            row.push(nextCell?.w);
        }
        return row;
    }

    /**
     * Converts a row of labels and a row of data to a Tank object.
     *
     * Assumes that the column headings are in the first row and skips fields
     * that are undefined for this row.
     */
    private sheetToTank(labels: Row, data: Row): Tank {
        return labels.map((value: CellValue, i: number, labels: Row): Field => {
            return {
                label: value,
                data: data[i],
            };
        });
    }

    private findLocation(loc: Location): [xlsx.WorkSheet, number] {
        const sheet: xlsx.WorkSheet = this.db.Sheets[TANK_SHEET_NAME];
        const row = loc.row;
        return [sheet, row];
    }

    /**
     * Returns a Tank object representing the tank in the given position with
     * fields populated from the database.
     */
    readTank(loc: Location): Tank {
        const [sheet, row] = this.findLocation(loc);

        const labels: Row = this.getRow(sheet, 0);
        const data: Row = this.getRow(sheet, row);

        const tank: Tank = this.sheetToTank(labels, data);
        return tank;
    }

    /**
     * Writes a Tank object to the database, reading data from the object's
     * fields.
     */
    writeTank(loc: Location, tank:Tank): void {
        // TODO implement
        console.log(`writeTank(${loc.row}, ${loc.col})`);
    }

    /**
     * Returns a Gene object representing the tank in the given position with
     * fields populated from the database.
     */
    readGene(id: string): Gene {
        // TODO implement
        return `readGene(${id})`;
    }

    /**
     * Writes a Gene object to the database, reading data from the object's
     * fields.
     */
    writeGene(id: string, gene: Gene): void {
        // TODO implement
        console.log(`writeGene(${id})`);
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
