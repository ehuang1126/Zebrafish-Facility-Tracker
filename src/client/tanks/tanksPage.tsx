import TabsPage from '../bases/tabsPage';
import type { Props, State, TabState } from '../bases/tabsPage';
import TankViewer from './tankViewer';
import TankSelector from './tankSelector';
import type { Tank } from '../../server/database';

/**
 * This class is responsible for everything about tanks. The page has some
 * (positive?) number of tank tabs which each show either a maps page for
 * selecting a tank or a tankData page for showing data.
 */
class TanksPage extends TabsPage {
    constructor(props: Readonly<Props>) {
        super(props);
        this.props.jumpController.registerTankJumpHandler(this.jumpToID.bind(this));
    }

    /**
     * Opens a new tab set to a certain tank.
     */
    override jumpToID(uid: (string | number)): void {
        this.newTab();
        this.selectTank(-1)(Number(uid)); // -1 selects the "current" (new) tab
    }

    /**
     * A closure that selects a tank for a given tab.
     * Uses the current tab if -1 is given for the tabnum.
     */
    selectTank(tabNum: number): (uid: number) => void {
        return (uid: number): void => {
            window.electronAPI.readTank(uid).then((tank: (Tank | undefined)): void => {
                if(tank === undefined) {
                    return;
                }

                this.setState((state: Readonly<State>): Readonly<State> => {
                    const tabs: TabState[] = Array.from(state.tabs);
                    tabs[tabNum >= 0 ? tabNum : state.currentTab] = {
                        contentSelected: true,
                        contentID: uid,
                        name: `tank ${ tank.loc.row }${ tank.loc.col }`,
                    };
                    return {
                        tabs: tabs,
                        currentTab: state.currentTab,
                    };
                });
            });
        };
    }

    override renderTabContent(tabNum: number): JSX.Element {
        if(this.state.tabs[tabNum] === undefined) {
            return <div />
        }

        if(this.state.tabs[tabNum].contentSelected) {
            return <TankViewer uid={ Number(this.state.tabs[tabNum].contentID) } jumpController={ this.props.jumpController } />
        } else {
            return <TankSelector reportTank={ this.selectTank(tabNum) } />
        }
    }
}

export default TanksPage;
