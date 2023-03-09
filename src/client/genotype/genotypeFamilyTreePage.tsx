import TabsPage from '../bases/tabsPage';
import type { Props, State, TabState } from '../bases/tabsPage';
import type { Genotype, CellValue } from '../../server/database';
import GenotypeSelector from './genotypeSelector';
import GenotypeViewer from './genotypeViewer';
import GenotypesPage from './genotypesPage';

const upperLim: number = 50; // default value for the max number of generations to display

class genotypeFamilyTreePage extends GenotypesPage {
    constructor(props: Readonly<Props>) {
        super(props);
        this.props.jumpController.registerGenotypeJumpHandler(this.jumpToID.bind(this));
    }
    
    override jumpToID(uid: string | number): void {
        this.newTab();
        this.selectGenotype(this.state.currentTab)(uid.toString());
    }

    protected override renderTabContent(tabNum: number): JSX.Element {
        // TODO: figure this out
        if(this.state.tabs[tabNum] === undefined) {
            return <div />
        }

        /*
        if(this.state.tabs[tabNum].contentSelected) {
            return <GenotypeViewer uid={ this.state.tabs[tabNum].contentID.toString() } jumpController={ this.props.jumpController } />
        } else {
            return <GenotypeSelector reportGenotype={ this.selectGenotype(tabNum) } />
        }*/
    }

    
    public displayLine(genotype: Genotype, width: number, numParentGens: number = upperLim, numChildGens: number = upperLim): void {
        
        // TODO: the number parameters should all be optional
        let genotypesMap = new Map<string, Genotype>; // TODO: access from database
        this.displayParentLine(genotype, numParentGens, genotypesMap);
        let siblings: Genotype[] = genotypeFamilyTreePage.getSiblings(genotype, genotypesMap, width);
        // TODO: deal with siblings and children
        let children: Genotype[] = genotypeFamilyTreePage.getChildren(genotype, genotypesMap, numChildGens);
    }

    /**
     * Helper function that returns the 2 parents of the given genotype in a Genotype array. Possibly could be moved to another file
     */
    private static getParents(genotype: Genotype, genotypesMap: Map<string, Genotype>): (Genotype[]) {
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
        
        parents[0] = genotypesMap.get(motherID as string) as Genotype;
        parents[1] = genotypesMap.get(fatherID as string) as Genotype;
        return parents;
    }

    private displayedParents: Genotype[] = []; // store any already displayed parents to ensure no cycles/infinite recursion
    /**
     * Recursive function that displays all parents, up to numGenerations generations
     */
    private displayParentLine(genotype: Genotype, numGenerations: number, genotypesMap: Map<string, Genotype>): void  {
        // base cases: AB, RNF (end of family line) or numGenerations == 0 or already displayed 
        // TODO: check already displayed condition and consider using generation number
        // TODO: numGenerations should be optional
        if(genotype.uid == 'AB' || genotype.uid == 'RNF' || numGenerations == 0 || this.displayedParents.includes(genotype)) { 
            genotypeFamilyTreePage.displayGenotype(genotype);
            return;
        }
        let parents: Genotype[] = genotypeFamilyTreePage.getParents(genotype, genotypesMap);


        // check for cycles using displayedParents list
        this.displayedParents.push(genotype);
        // need to check traversal order
        genotypeFamilyTreePage.displayGenotype(parents[0]);
        genotypeFamilyTreePage.displayGenotype(parents[1]);

        this.displayParentLine(parents[0], numGenerations-1, genotypesMap);
        this.displayParentLine(parents[1], numGenerations-1, genotypesMap);
        
    }


    /**
     * Helper function to get a number of children for the given genotype. Possibly could be moved to another file
     */
    private static getChildren(genotype: Genotype, genotypesMap: Map<string, Genotype>, maxToDisplay: number): Genotype[] {
        let result: Genotype[] = [];
        let counter: number = 0;
        for(let entry of Array.from(genotypesMap.entries())) {
            let parents: Genotype[] = genotypeFamilyTreePage.getParents(entry[1], genotypesMap);
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
    private static getSiblings(genotype: Genotype, genotypesMap: Map<string, Genotype>, width: number): Genotype[] {
        let result: Genotype[] = [];
        let counter: number = 0;
        for(let entry of Array.from(genotypesMap.entries())) {
            for(let i = 0; i < entry[1].fields.length; i++) {
                // TODO: this is wrong probably, will depend on implementation
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
        console.log(genotype.uid + " ");
    }   

}

export default genotypeFamilyTreePage

