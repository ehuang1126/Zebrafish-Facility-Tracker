import { ReactNode } from 'react';
import ReactFamilyTree from 'react-family-tree';
import { ExtNode } from 'relatives-tree/lib/types';
import type { Genotype, CellValue } from '../../server/database';
import GenotypeViewer from './genotypeViewer';


const upperLim: number = 50; // default value for the max number to recurse through

class genotypeFamilyTreePage {
    private baseGenotype: Genotype;
    private genotypesMap: Map<string, Genotype>;
    private element: JSX.Element[];
    private line: string; // temp for now just to display and to test

    private constructor(gv: GenotypeViewer, uid: string, width: number = upperLim, numParentGens: number = upperLim, numChildGens: number = upperLim) {
        this.baseGenotype = gv.getGenotype() as Genotype;
        this.genotypesMap = gv.getAllGenotypes() as Map<string, Genotype>;
        this.element = []; 
        this.line = '';
    }

    public static generateJSX(gv: GenotypeViewer, uid: number | string, width: number = upperLim, numParentGens: number = upperLim, numChildGens: number = upperLim): JSX.Element | string {
        let gftp: genotypeFamilyTreePage = new genotypeFamilyTreePage(gv, uid.toString(), width, numParentGens, numChildGens);
        gftp.displayLine(numParentGens, numChildGens, width);
        //return gftp.line;
        return (<div>{gftp.element}
            <ReactFamilyTree nodes={[]} rootId={''} width={0} height={0} renderNode={function (node: ExtNode): ReactNode {
                throw new Error('Function not implemented.');
        } }></ReactFamilyTree></div>);
    }

    private displayLine(numParentGens: number = upperLim, numChildGens: number = upperLim, numChildrenPerGens: number = upperLim): void {
        this.displayGenotype(this.baseGenotype);
        this.line += "PARENTS: "
        this.element.push(<div>PARENTS</div>)
        this.displayParentLine(this.baseGenotype, numParentGens);
        this.line += "CHILDREN: "
        this.element.push(<div>CHILDREN</div>)
        this.displayChildrenLines(this.baseGenotype, numChildGens, numChildrenPerGens);


        // TODO: deal with siblings and children (must wait on siblings implementation)
        /*let siblings: Genotype[] = this.getSiblings(this.baseGenotype, width);
        for(let sibling of siblings) {
            this.displayGenotype(sibling);
            this.displayChildrenLines(sibling, numChildGens, numChildrenPerGens);
        }*/
        
    }

    /**
     * Helper function that returns the 2 parents of the given genotype in a Genotype array. 
     */
    private getParents(genotype: Genotype): (Genotype[]) {
        
        let parents : Genotype[] = new Array(2); 
        
        let motherID: CellValue = '';
        let fatherID: CellValue = '';
        
        for(let field of genotype.fields) {
            if(field.label === "mother") {
                if (field.data === "AB" || field.data === "RNF") { // no longer necessary?
                    parents[0] = {
                        uid: field.data,
                        fields: [],
                        tanks: []
                    };
                } else {
                    motherID = field.data.toString().split('-')[1] as string;
                    parents[0] = this.genotypesMap.get(motherID) as Genotype;
                }
            } else if(field.label === "father") {
                if (field.data === "AB" || field.data === "RNF") { // no longer necessary?
                    parents[1] = {
                        uid: field.data,
                        fields: [],
                        tanks: []
                    };
                } else {
                    fatherID = field.data.toString().split('-')[1] as string;
                    parents[1] = this.genotypesMap.get(fatherID) as Genotype;
                }
            } 
        }
        
        // TODO: add error check here
        // TODO: check for AB and RNF in a better way to be more modular
        // will be either "AB", "RNF", or "gID-{x}", also check for None

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
        
        if(genotype.uid === 'AB' || genotype.uid === 'RNF' || numGenerations <= 0 || this.displayedParents.includes(genotype)) { 
            return;
        }
        
        let parents: Genotype[] = this.getParents(genotype);
        if(parents[0] === undefined || parents[1] === undefined) { // will bypass any parents with undefined formats
            return;
        }

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
        if(genotype.uid === 'AB' || genotype.uid === 'RNF' || numGenerations <= 0 || this.displayedChildren.includes(genotype) || children.length <= 0) { 
            return;
        }


        for(let child of children) {
            this.displayGenotype(child)
        }
        
        for(let child of children) {
            this.displayChildrenLines(child, numGenerations-1, maxPerGeneration);
            this.displayedChildren.push(child);
        }
    }

    /**
     * Helper function to get a number of children for the given genotype. To be replaced by API function
     */
    private getChildren(genotype: Genotype, maxToDisplay: number = upperLim): Genotype[] {
        let result: Genotype[] = [];
        let counter: number = 0;
        for(let entry of Array.from(this.genotypesMap.entries())) {
            let parents: Genotype[] = this.getParents(entry[1]);
            if(parents[0] === undefined || parents[1] === undefined) { // bypass undefined parents
                continue;
            }
            if(parents[0].uid === genotype.uid || parents[1].uid === genotype.uid) {
                result.push(entry[1]);
                counter++;
            }
            if (counter >= maxToDisplay) break;
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
                if(entry[1].fields[i].label === 'siblings') {
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
        this.line += genotype.uid + " ";
        this.element.push(<div>{genotype.uid}</div>)
        // TODO: add genotype to the element

    }   

}

export default genotypeFamilyTreePage.generateJSX;

