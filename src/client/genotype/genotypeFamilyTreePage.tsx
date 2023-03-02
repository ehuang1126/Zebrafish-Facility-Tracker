import TabsPage from '../bases/tabsPage';
import type { Genotype, CellValue } from '../../server/database';
import GenotypeViewer from './genotypeViewer';
import GenotypeSelector from './genotypeSelector';
import XLSXDatabase from '../../server/xlsxDatabase';


class genotypeFamilyTreePage extends TabsPage {
    
    override jumpToID(uid: string | number): void {
        throw new Error('Method not implemented.');
    }
    protected override renderTabContent(tabNum: number): JSX.Element {
        throw new Error('Method not implemented.');
    }

    public displayLine(genotype: Genotype, width: number, height: number): void {
        let genotypesMap = new Map<string, Genotype>; // TODO: access from database
        this.displayParentLine(genotype, height, genotypesMap);
        let siblings: Genotype[] = genotypeFamilyTreePage.getSiblings(genotype, width, genotypesMap);
        // TODO: deal with siblings and children
    }

    /**
     * Helper function that returns the 2 parents of the given genotype in a Genotype array
     */
    private static getParents(genotype: Genotype, genotypesMap: Map<string, Genotype>): (Genotype[]) {
        let parents : Genotype[] = new Array(2); 
        let motherID: CellValue;
        let fatherID: CellValue;
        let i: number = 0;
        while (i < genotype.fields.length) {
            if (genotype.fields[i].label == "mother") {
                motherID = genotype.fields[i].data;
                continue;
            }
            if (genotype.fields[i].label == "father") {
                fatherID = genotype.fields[i].data;
                continue;
            }
            i++;
        }
        // TODO: get Genotype object from genotypesMap
        // will be either "AB", "RNF", or "gID-{x}", also check for None

        return parents;
    }

    private displayedParents: Genotype[] = []; // store any already displayed parents to ensure no cycles/infinite recursion
    /**
     * Recursive function that displays all parents, up to numGenerations generations
     */
    private displayParentLine(genotype: Genotype, numGenerations: number, genotypesMap: Map<string, Genotype>): void  {
        // base cases: AB, RNF (end of family line) or numGenerations == 0
        if (genotype.uid == 'AB' || genotype.uid == 'RNF' || numGenerations == 0) { 
            genotypeFamilyTreePage.displayGenotype(genotype);
        }
        let parents: Genotype[] = genotypeFamilyTreePage.getParents(genotype, genotypesMap);


        // TODO: check for cycles using displayedParents list

        // need to check traversal order
        genotypeFamilyTreePage.displayGenotype(parents[0]);
        genotypeFamilyTreePage.displayGenotype(parents[1]);

        this.displayParentLine(parents[0], numGenerations-1, genotypesMap);
        this.displayParentLine(parents[1], numGenerations-1, genotypesMap);
        
    }


    /**
     * Helper function to get a number of children for the given genotype. 
     */
    private static getChildren(genotype: Genotype, maxToDisplay: number, genotypesMap: Map<string, Genotype>): Genotype[] {
        let result: Genotype[] = [];
        let counter: number = 0;
        for (let entry of Array.from(genotypesMap.entries())) {
            let parents: Genotype[] = genotypeFamilyTreePage.getParents(entry[1], genotypesMap);
            if (parents[0].uid == genotype.uid || parents[1].uid == genotype.uid) {
                result.push(entry[1]);
                counter++;
            }
            if (counter >= maxToDisplay) break;
        }
        return result;
    }

    /**
     * Helper function to get a number of siblings for the given genotype. Assumes the "sibling" column has been added to genotypes. 
     */
    private static getSiblings(genotype: Genotype, width: number, genotypesMap: Map<string, Genotype>): Genotype[] {
        let result: Genotype[] = [];
        let counter: number = 0;
        for (let entry of Array.from(genotypesMap.entries())) {
            for (let i = 0; i < entry[1].fields.length; i++) {
                // TODO: this is wrong probably
                if (entry[1].fields[i].label == 'siblings') {
                    result.push(entry[1]);
                    counter++;
                }
                if (counter >= width) break;
            }
            
        }
        return result;
    }


    /**
     * Displays the genotype. For now, just log to console.
     */
    private static displayGenotype(genotype: Genotype): void {
        console.log(genotype.uid);
    }   

}

export default genotypeFamilyTreePage

