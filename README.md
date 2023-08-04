# Zebrafish Facility Tracker

Gene editing zebrafish gets extremely complicated very quickly. Different lines need many different generations of crossing and breeding, to the point where just a few different targeted genes can require hundreds of tanks, creating a logistical nightmare. This database aims to ease this issue by organizing and tracking all of the logistical data that goes into managing a fish facility. With this program, users will be able to keep track of every clutch of every generation of every line, and use this data to create new interesting lines for study. 

## Startup Guide
1. [Clone](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) this repo and navigate to it in your terminal.
2. Make sure you have [node.js](https://nodejs.org/en/download) downloaded.
3. In the main directory, create a directory called `data`.
4. Move your input file named `input.xlsx` (make sure it is in the format listed below) to the `data` directory. 
5. Run `npm install` and then run `npm start`.
6. Go to the `settings` tab and import your data. You may need to close and reopen the database if the data does not show up. 

## Input Format
1. Download [this Excel sheet](https://docs.google.com/spreadsheets/d/1qK9Pgry0nXH4Pcq5gidWd_J7OUvx0_i_/edit?usp=sharing&ouid=104837976882916963935&rtpof=true&sd=true). This is an example import spreadsheet. The important parts are the sheet and column headers, so you can copy and just replace the data with your own data.
2. In the `racks` sheet, enter each rack with a **unique** ID and the size of each rack. This defines the locations you can use, so please enter this carefully. 
3. In the `genotypes` sheet, enter your different genotypes.
4. In the `tanks` sheet, enter the tanks you want to track with locations defined in the `racks` sheet.
    - Genotype ID(s) and DOB(s) are each 1 column. If you have more than 1 genotype in a tank, you can separate them within the same cell by comma
5. Please don't change the column names for any UID, rack, row, column, room, DOB, or genotype column.
6. Make sure UIDs are numbers and DOBs are in mm/dd/yyyy or yyyy-mm-dd format (no need to add zeroes before)
8. Other than the mentioned columns above, feel free to prune the genotypes/tanks sheets or leave cells empty
9. You can also add any columns to track any additional data in the `genotypes` and `tanks, as long as the column names are not SQL keywords and do not contain special characters (underscore is fine). 
    - For example, "fish_exists" would be fine as a column header but "exists" would not be.
    - Spaces will automatically be replaced with underscores.

## Installation Troubleshooting
- If you see something along the lines of `BETTER-SQLITE3 WAS COMPILED AGAINST A DIFFERENT NODE VERSION`, follow the following steps:
    1. Delete the node_modules folder.
    2. Delete the package-lock.json file.
    3. Run `npm install`.
    4. Run `./node_modules/.bin/electron-rebuild`
    5. Try `npm start` again. 

## Workflow
Creating a new cross: 
1. Go to the `crossing` page to set up the parents and create the new genotype.
2. Cross the fish.
3. Make a new Tank on the `tanks` page for these new fish.
4. Add the corresponding new genotype to this new Tank. 

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
