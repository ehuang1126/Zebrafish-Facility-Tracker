#!/bin/bash

DB_FILE="./data/sqlite3.db"  # Replace with the path to your SQLite database file

# SQLite query to export the table to CSV
QUERY_TANKS="SELECT * FROM tanks;"
QUERY_GENOTYPES="SELECT * FROM genotypes;"
TANKS_OUTPUT="./data/exported_tanks.csv"
GENOTYPES_OUTPUT="./data/exported_genotypes.csv"

# Run SQLite and execute the tank query, then redirect the output to the CSV files
sqlite3 -header -csv ${DB_FILE} "${QUERY_TANKS}" > ${TANKS_OUTPUT}

# Check if the export was successful
if [ $? -eq 0 ]; then
  echo "Table 'tanks' exported to '${TANKS_OUTPUT}' successfully."
else
  echo "Error exporting table 'tanks' to CSV."
fi

sqlite3 -header -csv ${DB_FILE} "${QUERY_GENOTYPES}" > ${GENOTYPES_OUTPUT}
# Check if the export was successful
if [ $? -eq 0 ]; then
  echo "Table 'genotypes' exported to '${GENOTYPES_OUTPUT}' successfully."
else
  echo "Error exporting table 'genotypes' to CSV."
fi

