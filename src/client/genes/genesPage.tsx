import TabsPage from '../bases/tabsPage';
import type { Props, State, TabState } from '../bases/tabsPage';
import GeneViewer from './geneViewer';
import GeneSelector from './geneSelector';

class GenesPage extends TabsPage {
    /**
     * Opens a new tab set to a certain gene.
     */
    override jumpToID(uid: (string | number)): void {
        this.newTab();
        this.selectGene(-1)(uid.toString());
    }

    /**
     * A closure that selects a gene for a given tab.
     * Uses the current tab if -1 is given for the tabnum.
     */
    selectGene(tabNum: number): (uid: string) => void {
        return (uid: string): void => {
            console.log(uid)
            this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
                const tabs: TabState[] = Array.from(state.tabs);
                tabs[tabNum >= 0 ? tabNum : state.currentTab] = {
                    contentSelected: true,
                    contentID: uid,
                    name: `gene ${ uid }`,
                };
                return {
                    tabs: tabs,
                    currentTab: state.currentTab,
                };
            });
        };
    }

    protected override renderTabContent(tabNum: number): JSX.Element {
        if(this.state.tabs[tabNum].contentSelected) {
            return <GeneViewer uid={ this.state.tabs[tabNum].contentID.toString() } />
        } else {
            return <GeneSelector reportGene={ this.selectGene(tabNum) } />
        }
    }
}

export default GenesPage;
