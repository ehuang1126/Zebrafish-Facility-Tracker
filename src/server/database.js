const xlsx = require('xlsx');

const EMPTY_CELL_MESSAGE = '*This cell is empty.*';

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
    // these are the maximum dimension according to the xlsx library
    static MAX_ROW = 1048575;
    static MAX_COL = 16383;
    #db;

    constructor(filename) {
        this.#db = xlsx.readFile(filename);
    }

    /**
     * Returns a single row from the sheet as an array. Assumes the sheet
     * starts at A1.
     */
    #getRow(sheet, rowNum) {
        const width = xlsx.utils.decode_range(sheet['!ref']).e.c + 1;
        let row = [];
        for(let colNum = 0; colNum < width; colNum++) {
            var nextCell = sheet[
                xlsx.utils.encode_cell({r: rowNum, c: colNum})
            ];
            if(typeof nextCell === 'undefined') {
                row.push(void 0);
            } else {
                row.push(nextCell.w);
            }
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
    #sheetToTank(sheet, rowNum) {
        const labels = this.#getRow(sheet, 0);
        const data = this.#getRow(sheet, rowNum);

        const cleanedData = data.map((cell) => {
            if(cell) {
                return cell;
            } else {
                return EMPTY_CELL_MESSAGE;
            }
        });

        return {
            'labels': labels,
            'data': cleanedData,
        };
    }

    /**
     * Returns a Tank object representing the tank in the given position with
     * fields populated from the database.
     */
    readTank(row, col) {
        const tankSheet = this.#db.Sheets['tank_data'];
        const tank = this.#sheetToTank(tankSheet, row);
        return tank;
    }

    /**
     * Writes a Tank object to the database, reading data from the object's
     * fields.
     */
    writeTank(row, col, data) {
        // TODO implement
        return `writeTank(${row}, ${col})`;
    }

    /**
     * Returns a Gene object representing the tank in the given position with
     * fields populated from the database.
     */
    readGene(id) {
        // TODO implement
        return `readGene(${row}, ${col})`;
    }

    /**
     * Writes a Gene object to the database, reading data from the object's
     * fields.
     */
    writeGene(id, data) {
        // TODO implement
        return `writeGene(${row}, ${col})`;
    }

    /**
     * Attaches the event handlers that send database data back to the renderer.
     */
    attachHandlers(ipcMain) {
        ipcMain.handle('db:readTank',  (event, ...args) => this.readTank(...args));
        ipcMain.handle('db:writeTank', (event, ...args) => this.writeTank(...args));
        ipcMain.handle('db:readGene',  (event, ...args) => this.readGene(...args));
        ipcMain.handle('db:writeGene', (event, ...args) => this.writeGene(...args));
    }
}

module.exports = Database;
