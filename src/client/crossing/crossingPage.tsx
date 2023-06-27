import React from "react";
import CrossingTable from "./crossingTable";
import GenotypeSelector from "../genotype/genotypeSelector";
import { Stack, Text } from "@chakra-ui/react";
import TabsPage, { State, TabState } from "../bases/tabsPage";


class CrossingPage extends TabsPage {

    /**
     * Opens the tab for the given uid, while closing the current crossing page.
     */
    override jumpToID(uid: (string | number)): void {
        this.props.jumpController.jumpToGenotype(uid.toString());
        this.closeTab(this.state.currentTab);
    }

    /**
     * Helper function to determine how many parents to pick. 
     */
    private numParentsPicked(): number {
        if(this.state.tabs[this.state.currentTab].contentSelected) {
            return 2;
        } else if(this.state.tabs[this.state.currentTab].contentID === -1) {
            return 0;
        } else {
            return 1;
        }
    }

    /**
     * Sets the selected parent ID to the selected uid by storing them in the contentID of the current tab.
     */
    private selectParent(parent: number): (uid: string) => void {
        return (uid: string): void => {
            // select mother
            if(parent === 0) {
                this.setState((state: Readonly<State>): Readonly<State> => {                    
                    const tabs: TabState[] = Array.from(state.tabs);
                    tabs[state.currentTab] = {
                        contentSelected: false,
                        contentID: uid,
                        name: 'Crossing Setup',
                    };
                    return {
                        tabs: tabs,
                        currentTab: state.currentTab,
                    }
                });
            // select father
            } else {
                this.setState((state: Readonly<State>): Readonly<State> => {                    
                    const tabs: TabState[] = Array.from(state.tabs);
                    tabs[state.currentTab] = {
                        contentSelected: true,
                        contentID: state.tabs[state.currentTab].contentID + ' x ' + uid,
                        name: `genotype ${state.tabs[state.currentTab].contentID} x genotype ${uid}`
                    };
                    return {
                        tabs: tabs,
                        currentTab: state.currentTab,
                    }
                });
            }
        };
    }

    override renderTabContent(): JSX.Element {
        let numPicked = this.numParentsPicked();
        let parent = 'mother';
        
        if(numPicked === 2) { // both parents have been picked, display the table
            let parentIDs = this.state.tabs[this.state.currentTab].contentID.toString().split(' x ');
            return (<CrossingTable motherId = { parentIDs[0] } fatherId = { parentIDs[1] } jumpController={ this.props.jumpController } onClose = { this.jumpToID.bind(this) }/>);
        } else if(numPicked === 1) { 
            parent = 'father';
        }
        // select the correct parent
        return (<Stack>
            <Text fontSize={'x-large'} textColor={'blue'}>Please select a { parent }. </Text>
            <GenotypeSelector reportGenotype={ this.selectParent(numPicked) } />
        </Stack>);
        
    }

}

export default CrossingPage