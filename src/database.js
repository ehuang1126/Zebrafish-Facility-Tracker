const xlsx = require('xlsx');

/**
 * This file exports a minimal database interface for use with the zebrafish
 * manager. The exposed functions are:
 *
 * constructor(String filename) => Database
 * readTank(Int row, Int col) => Tank
 * writeTank(Int row, Int col, Tank data) => Boolean?
 * readGene(Int id) => Gene
 * writeGene(Int id, Gene data) => Boolean?
 *
 * A Tank is an object with 'labels' and 'data' fields which are paired arrays
 * such that the i-th element in the 'labels' array is the label for the i-th
 * element in the 'data' array.
 */

const getMethods = (obj) => {
  let properties = new Set()
  let currentObj = obj
  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
  } while ((currentObj = Object.getPrototypeOf(currentObj)))
  return [...properties.keys()]
}

class Database {
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
     * Reads a row and converts it to a Tank object.
     *
     * Assumes that the column headings are in the first row.
     *
     * sheet - an actual array(?) and not just a sheet name
     * rowNumber - the number of the row to get data from
     */
    #rowToTank(sheet, rowNum) {
        const labels = this.#getRow(sheet, 0);
        const row = this.#getRow(sheet, rowNum);

        return {
            'labels': labels,
            'data': row,
        };
    }

    /**
     * Returns a Tank object representing the tank in the given position with
     * fields populated from the database.
     */
    readTank(row, col) {
        return this.#rowToTank(this.#db.Sheets[this.#db.SheetNames[0]], row);
    }

    /**
     * Writes a Tank object to the database, reading data from the object's
     * fields.
     */
    writeTank(row, col, data) {
        return `writeTank(${row}, ${col})`;
    }

    /**
     * Returns a Gene object representing the tank in the given position with
     * fields populated from the database.
     */
    readGene(id) {
        return `readGene(${row}, ${col})`;
    }

    /**
     * Writes a Gene object to the database, reading data from the object's
     * fields.
     */
    writeGene(id, data) {
        return `writeGene(${row}, ${col})`;
    }

    /**
     * Attaches the event handlers that send database data back to the renderer.
     */
    attachHandlers(ipcMain) {
        ipcMain.handle('db:readTank', (event, ...args) => this.readTank(...args));
    }
}

module.exports = Database;
