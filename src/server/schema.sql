-- any changes here will probably need to be paired with appropriate changes in sqliteDatabase.ts
CREATE TABLE IF NOT EXISTS genotypes (
    db_id INTEGER PRIMARY KEY AUTOINCREMENT, -- consider removing AUTOINCREMENT to trade possible stability for performance
    genotypeID INTEGER NOT NULL,
    published_id TEXT,
--    owner TEXT NOT NULL,
    fish TEXT NOT NULL,
    notes TEXT
--    exists INTEGER NOT NULL,
--    light_cycle INTEGER,
--    generation INTEGER,
--    x_cross INTEGER,
--    crossing_method INTEGER,
--    intrchg INTEGER,
--    mother_id INTEGER,
--    father_id INTEGER,
--    genotyped TEXT, -- column label is just 'genotyped?' and is somehow not just a boolean field
--    attached_files TEXT, -- comma-separated file paths
--    locus_1_type INTEGER,
--    locus_1_condition TEXT,
--    locus_1_count INTEGER,
--    locus_2_type INTEGER,
--    locus_2_type INTEGER,
--    locus_2_condition TEXT,
--    locus_3_count INTEGER,
--    locus_3_condition TEXT,
--    locus_3_count INTEGER
);

CREATE TABLE IF NOT EXISTS tanks (
    db_id INTEGER PRIMARY KEY AUTOINCREMENT, -- consider removing AUTOINCREMENT to trade possible stability for performance
    tank_uid INTEGER,
    rack INTEGER,
    row_num INTEGER,
    col_num INTEGER,
    genotype_id_1 TEXT,
    genotype_id_2 TEXT,
    genotype_id_3 TEXT,
    DOB_1 DATE,
    DOB_2 DATE,
    DOB_3 DATE
);

CREATE TABLE IF NOT EXISTS racks (
    rack_id INTEGER PRIMARY KEY AUTOINCREMENT,
    room TEXT,
    rows INTEGER,
    cols INTEGER
);

CREATE TABLE IF NOT EXISTS users (
    db_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER
    -- add settings/preferences as necessary
);

CREATE TABLE IF NOT EXISTS graveyard (
    db_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tank_uid INTEGER,
    cull_date DATE,
    rack INTEGER,
    row_num INTEGER,
    col_num INTEGER,
    genotype_id_1 TEXT,
    genotype_id_2 TEXT,
    genotype_id_3 TEXT,
    DOB_1 DATE,
    DOB_2 DATE,
    DOB_3 DATE
);