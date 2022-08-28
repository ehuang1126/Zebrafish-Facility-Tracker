import xlsx from 'xlsx';

const EMPTY_CELL_MESSAGE: string = '*This cell is empty.*';
// these are the maximum dimension according to the xlsx library
// const MAX_ROW: number = 1048575;
// const MAX_COL: number = 16383;

interface Tank {
    labels: Row;
    data: Row;
}

type Row = (string | number)[];

type Gene = any; // TODO implement

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
     * Reads a row from a sheet and converts it to a Tank object.
     *
     * Assumes that the column headings are in the first row and skips fields
     * that are undefined for this row.
     *
     * sheet - an actual array(?) and not just a sheet name
     * rowNumber - the number of the row to get data from
     */
    private sheetToTank(sheet: xlsx.WorkSheet, rowNum: number): Tank {
        const labels: Row = this.getRow(sheet, 0);
        const data: Row = this.getRow(sheet, rowNum);

        const cleanedData: Row = data.map((cell: (string | number)) => cell ?? EMPTY_CELL_MESSAGE);

        return {
            'labels': labels,
            'data': cleanedData,
        };
    }

    /**
     * Returns a Tank object representing the tank in the given position with
     * fields populated from the database.
     */
    readTank(row: number, col: number): Tank {
        const tankSheet: xlsx.WorkSheet = this.db.Sheets['tank_data'];
        const tank: Tank = this.sheetToTank(tankSheet, row);
        return tank;
    }

    /**
     * Writes a Tank object to the database, reading data from the object's
     * fields.
     */
    writeTank(row: number, col: number, tank:Tank): void {
        // TODO implement
        console.log(`writeTank(${row}, ${col})`);
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
        ipcMain.handle('db:readTank',  (event, row: number, col: number) => this.readTank(row, col));
        ipcMain.handle('db:writeTank', (event, row: number, col: number, tank: Tank) => this.writeTank(row, col, tank));
        ipcMain.handle('db:readGene',  (event, id: string) => this.readGene(id));
        ipcMain.handle('db:writeGene', (event, id: string, gene: Gene) => this.writeGene(id, gene));
    }
}

export default Database;
export type {
    Tank,
    Gene,
};
