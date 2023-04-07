-- any changes here will probably need to be paired with appropriate changes in sqliteDatabase.ts
CREATE TABLE IF NOT EXISTS genotypes (
    db_id INTEGER PRIMARY KEY AUTOINCREMENT, -- consider removing AUTOINCREMENT to trade possible stability for performance
    genotype_id INTEGER NOT NULL,
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
    room TEXT,
    rack INTEGER,
    row_num INTEGER,
    col_num INTEGER,
    genotype_id TEXT
);
