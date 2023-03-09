import type { Genotype, CellValue } from '../../server/database';
import GenotypeViewer from './genotypeViewer';


const upperLim: number = 50; // default value for the max number of generations to display

class genotypeFamilyTreePage {
    private baseGenotype: Genotype;
    private genotypesMap: Map<string, Genotype>;
    private element: JSX.Element;

    private constructor(gv: GenotypeViewer, uid: string, width: number = upperLim, numParentGens: number = upperLim, numChildGens: number = upperLim) {
        this.baseGenotype = gv.getGenotype() as Genotype;
        this.genotypesMap = new Map<string, Genotype>(); // TODO: figure out getting map
        this.element = <></>; // TODO: initialize element?
    }

    public static generateJSX(gv: GenotypeViewer, uid: number | string, width: number = upperLim, numParentGens: number = upperLim, numChildGens: number = upperLim): JSX.Element {
        let gftp: genotypeFamilyTreePage = new genotypeFamilyTreePage(gv, uid.toString(), width, numParentGens, numChildGens);
        // TODO: actually call functions
        return gftp.element;
    }

    // TODO: change args to take in uid? and remove unnecessary args. 
    private displayLine(width: number, numParentGens: number = upperLim, numChildGens: number = upperLim): void {
        

        this.displayParentLine(this.baseGenotype, numParentGens);
        let siblings: Genotype[] = this.getSiblings(this.baseGenotype, width);
        // TODO: deal with siblings and children
        let children: Genotype[] = this.getChildren(this.baseGenotype, numChildGens);

    }

    /**
     * Helper function that returns the 2 parents of the given genotype in a Genotype array. 
     */
    private getParents(genotype: Genotype): (Genotype[]) {
        let parents : Genotype[] = new Array(2); 
        let motherID: CellValue = '';
        let fatherID: CellValue = '';
        let i: number = 0;
        while(i < genotype.fields.length) {
            if(genotype.fields[i].label == "mother") {
                motherID = genotype.fields[i].data;
                continue;
            }
            if(genotype.fields[i].label == "father") {
                fatherID = genotype.fields[i].data;
                continue;
            }
            i++;
        }
        // TODO: add error check here
        // will be either "AB", "RNF", or "gID-{x}", also check for None
        
        parents[0] = this.genotypesMap.get(motherID as string) as Genotype;
        parents[1] = this.genotypesMap.get(fatherID as string) as Genotype;
        return parents;
    }

    private displayedParents: Genotype[] = []; // store any already displayed parents to ensure no cycles/infinite recursion
    /**
     * Recursive function that displays all parents, up to numGenerations generations
     */
    private displayParentLine(genotype: Genotype, numGenerations: number): void  {
        // base cases: AB, RNF (end of family line) or numGenerations == 0 or already displayed 
        // TODO: check already displayed condition and consider using generation number
        // TODO: numGenerations should be optional
        if(genotype.uid == 'AB' || genotype.uid == 'RNF' || numGenerations == 0 || this.displayedParents.includes(genotype)) { 
            this.displayGenotype(genotype);
            return;
        }
        let parents: Genotype[] = this.getParents(genotype);


        // check for cycles using displayedParents list
        this.displayedParents.push(genotype);
        // need to check traversal order
        this.displayGenotype(parents[0]);
        this.displayGenotype(parents[1]);

        this.displayParentLine(parents[0], numGenerations-1);
        this.displayParentLine(parents[1], numGenerations-1);
        
    }

    private displayedChildren: Genotype[] = []; // TODO: need to consider how to check if children (and parents) are the same and if to link
    private displayChildrenLines(genotype: Genotype, numGenerations: number, maxPerGeneration: number): void {
        const children: Genotype[] = this.getChildren(genotype, maxPerGeneration);
        if(genotype.uid == 'AB' || genotype.uid == 'RNF' || numGenerations == 0 || this.displayedParents.includes(genotype) || children.length <= 0) { 
            this.displayGenotype(genotype);
            return;
        }


        for(let child of children) {
            this.displayedChildren.push(child);
            this.displayGenotype(child)
        }
        
        for(let child of children) {
            this.displayChildrenLines(child, numGenerations-1, maxPerGeneration);
        }
    }

    /**
     * Helper function to get a number of children for the given genotype. Possibly could be moved to another file
     */
    private getChildren(genotype: Genotype, maxToDisplay: number): Genotype[] {
        let result: Genotype[] = [];
        let counter: number = 0;
        for(let entry of Array.from(this.genotypesMap.entries())) {
            let parents: Genotype[] = this.getParents(entry[1]);
            if(parents[0].uid == genotype.uid || parents[1].uid == genotype.uid) {
                result.push(entry[1]);
                counter++;
            }
            if(typeof maxToDisplay !== undefined) {
                if (counter >= maxToDisplay) break;
            } 
        }
        return result;
    }

    /**
     * Helper function to get a number of siblings for the given genotype. 
     * Assumes the "sibling" column has been added to genotypes. This will depend on the implementation of the sibling column, so it can be implemented later. 
     */
    private getSiblings(genotype: Genotype, width: number): Genotype[] {
        let result: Genotype[] = [];
        let counter: number = 0;
        for(let entry of Array.from(this.genotypesMap.entries())) {
            for(let i = 0; i < entry[1].fields.length; i++) {
                // TODO: this is wrong probably, will depend on implementation
                if(entry[1].fields[i].label == 'siblings') {
                    result.push(entry[1]);
                    counter++;
                }
                if(counter >= width) break;
            }
            
        }
        return result;
    }


    /**
     * Displays the genotype. For now, just log to console. 
     */
    private displayGenotype(genotype: Genotype): void {
        console.log(genotype.uid + " ");
        // TODO: add genotype to the element
    }   

}

export default genotypeFamilyTreePage.generateJSX;

