# Zebrafish Facility Tracker

Gene editing zebrafish gets extremely complicated very quickly. Different lines need many different generations of crossing and breeding, to the point where just a few different targeted genes can require hundreds of tanks, creating a logistical nightmare. This database aims to ease this issue by organizing and tracking all of the logistical data that goes into managing a fish facility. With this program, users will be able to keep track of every clutch of every generation of every line, and use this data to create new interesting lines for study. 

## Startup Guide
1. Clone this repo and navigate to it in your terminal.
2. In the main directory, create a directory called `data`.
3. Move your input file named `input.xlsx` (make sure it is in the format listed below) to the `data` directory. 
4. Run `npm install` and then run `npm start`.
5. Go to the `settings` tab and import your data. 

## Input Format
1. Download [this Excel sheet](https://docs.google.com/spreadsheets/d/1qK9Pgry0nXH4Pcq5gidWd_J7OUvx0_i_/edit?usp=sharing&ouid=104837976882916963935&rtpof=true&sd=true). This is an example import spreadsheet. The important parts are the sheet and column headers, so you can copy and just replace the data with your own data. 
2. Please don't change the column names for any UID, rack, row, column, room, DOB, or genotype column.
3. Make sure UIDs are numbers and DOBs are in mm/dd/yyyy or yyyy-mm-dd format (no need to add zeroes before)
4. In the tanks tab, genotypeID(s) and DOB(s) are each 1 column. If you have more than 1 genotype in a tank, you can separate them within the same cell by comma
5. Other than the mentioned columns above, feel free to prune the genotypes/tanks sheets or leave cells empty
6. You can also add any columns to track any additional data, as long as the column names are not SQL keywords and do not contain special characters (underscore is fine). 
    - For example, "fish_exists" would be fine as a column header but "exists" would not be.
    - Spaces will automatically be replaced with underscores.

## Contribution
- This is an open-source project. Feel free to contribute by raising issues and creating pull requests.
- Future goals include:
  - Frontend overhaul
  - User authentication and interaction
  - Email notifications
  - Expanded to track DNA files for each genotype, etc.
- See the issues page for more information.

---
Copyright 2023 Kevin Shin, Evan Huang, Cyna Shirazinejad  
The contents of this repository are licensed under the GNU General Public License Version 3.
