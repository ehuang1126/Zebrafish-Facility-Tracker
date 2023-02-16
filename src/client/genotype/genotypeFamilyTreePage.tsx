import { None } from 'framer-motion';
import type { Genotype } from '../../server/database';
import type { Tank } from '../../server/database';


// create some test data, will integrate later
/*
integration notes: 
- Genotype.field is just an array(?), how to access a specific field?
- can call getGenotypes to get the Map of all genotypes
*/
const genotypes = new Map<string, Genotype>;
const emptyGenotype : Genotype = {
    uid: '!',
    fields: [],
    tanks:[],
};
const genotype1: Genotype = {
    uid: '1',
    fields: [],
    tanks: [],
};


class genotypeFamilyTreePage {
    getParents(genotype : Genotype): (Genotype[] | None) {
        let parents : Genotype[] = [emptyGenotype, emptyGenotype]; // TODO fix to be a better null case
        // TODO get the genotype's parents from fields
        return parents;
    }

    // TODO: implement a method to loop through all genotypes. will end up being an O(n^2) time complexity
    // TODO: think about how to show siblings/cousins and how far to go
    // TODO: just print to console for now, but will later need to figure out UI integration

}


export {}

