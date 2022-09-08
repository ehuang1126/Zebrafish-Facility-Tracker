import TabsPage from '../bases/tabsPage';
import type { Props, State, TabState } from '../bases/tabsPage';
import GenotypeViewer from './genotypeViewer';
import GenotypeSelector from './genotypeSelector';

class GenotypesPage extends TabsPage {
    constructor(props: Readonly<Props>) {
        super(props);
        this.props.jumpController.registerGenotypeJumpHandler(this.jumpToID.bind(this));
    }

    /**
     * Opens a new tab set to a certain genotype.
     */
    override jumpToID(uid: (string | number)): void {
        this.newTab();
        this.selectGenotype(-1)(uid.toString());
    }

    /**
     * A closure that selects a genotype for a given tab.
     * Uses the current tab if -1 is given for the tabnum.
     */
    selectGenotype(tabNum: number): (uid: string) => void {
        return (uid: string): void => {
            this.setState((state: Readonly<State>): Readonly<State> => {
                const tabs: TabState[] = Array.from(state.tabs);
                tabs[tabNum >= 0 ? tabNum : state.currentTab] = {
                    contentSelected: true,
                    contentID: uid,
                    name: `genotype ${ uid }`,
                };
                return {
                    tabs: tabs,
                    currentTab: state.currentTab,
                };
            });
        };
    }

    protected override renderTabContent(tabNum: number): JSX.Element {
        if(this.state.tabs[tabNum] === undefined) {
            return <div />
        }

        if(this.state.tabs[tabNum].contentSelected) {
            return <GenotypeViewer uid={ this.state.tabs[tabNum].contentID.toString() } jumpController={ this.props.jumpController } />
        } else {
            return <GenotypeSelector reportGenotype={ this.selectGenotype(tabNum) } />
        }
    }
}

export default GenotypesPage;
