import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Button, Flex, CloseButton } from '@chakra-ui/react';
import TankViewer from './tankViewer';
import Maps from './maps';
import type { Location } from '../../server/database';

import './tanksPage.css';

type TabState = {
    tankSelected: boolean,
    loc: Location,
};

type Props = {
    registerJumpHandler: (handler: (loc: Location) => void) => void ,
};

type State = {
    tabs: TabState[],
    currentTab: number,
};

/**
 * This class is responsible for everything about tanks. The page has some
 * (positive?) number of tank tabs which each show either a maps page for
 * selecting a tank or a tankData page for showing data.
 */
class TanksPage extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            tabs: [],
            currentTab: 0,
        };
        props.registerJumpHandler(this.jumpToTank.bind(this));
    }

    /**
     * must wait until the component is mounted to set state
     */
    componentDidMount = this.newTab;

    /**
     * Opens a new tab set to a certain tank.
     */
    jumpToTank(loc: Location): void {
        this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
            const newTabState: Readonly<State> = this._newTab(state, props);
            return this._selectTank(newTabState.currentTab, loc)(newTabState, props);
        });
    }

    /**
     * Open a new tab and set it active. Separate into two functions so it can
     * be called in `closeTab` without breaking the state.
     */
    private newTab(): void { this.setState(this._newTab); }
    private _newTab(state: Readonly<State>, props: Readonly<Props>): Readonly<State> {
        const tabIndex: number = state.tabs.length;
        const newTab: TabState = {
            tankSelected: false,
            loc: {
                row: -1,
                col: -1,
            },
        };

        const newTabs: TabState[] = Array.from(state.tabs);
        newTabs.push(newTab);
        return {
            tabs: newTabs,
            currentTab: tabIndex,
        };
    }

    /**
     * Close a tab. If it isn't the current tab, keep the current tab selected.
     * If it's the current tab, select the tab to the right. If this was the
     * rightmost tab, then select the tab to the left. If this was the last
     * tab, then open a new tab.
     */
    private closeTab(tabNum: number): void {
        this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
            const newTabs: TabState[] = Array.from(state.tabs);
            newTabs.splice(tabNum, 1);
            
            const newTabNum: number = (state.currentTab <= tabNum && tabNum < newTabs.length) ?
                    state.currentTab : state.currentTab - 1;
            const newState: Readonly<State> = {
                tabs: newTabs,
                currentTab: newTabNum,
            };
            
            return newTabs.length > 0 ? newState : this._newTab(newState, props);
        });
    }

    /**
     * Activates a tab, both in this class's state and in the state of the Tabs
     * elements.
     */
    private selectTab(tabNum: number): void {
        this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
            return {
                tabs: state.tabs,
                currentTab: tabNum,
            };
        });
    }

    /**
     * A closure that selects a tank for a given tab. Split into two for use in the jump methods.
     */
    selectTank(tabNum: number): (loc: Location) => void {
        return (loc: Location) => {
            this.setState(this._selectTank(tabNum, loc));
        }
    }
    private _selectTank(tabNum: number, loc: Location): (state: Readonly<State>, props: Readonly<Props>) => Readonly<State> {
        return (state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
            const tabs: TabState[] = Array.from(state.tabs);
            tabs[tabNum] = {
                tankSelected: true,
                loc: loc,
            };
            return {
                tabs: tabs,
                currentTab: state.currentTab,
            };
        };
    }

    override render(): JSX.Element {
        return (
            <Tabs size='sm'
                    index={ this.state.currentTab } onChange={ this.selectTab.bind(this) }>
                <Flex maxWidth='100vw'>
                    <TabList id='tank-tab-row'>
                        { this.state.tabs.map((tabState: TabState, tabNum: number, tabs: TabState[]): JSX.Element =>
                            <Tab className='tank-tab' key={tabNum}>
                                <Flex>
                                    { tabState.tankSelected ? `(${ tabState.loc.row },${ tabState.loc.col })` : 'new tab' }
                                    <CloseButton className='tank-tab-close' size='sm'
                                            onClick={ () => { this.closeTab(tabNum) } } />
                                </Flex>
                            </Tab>
                        ) }
                    </TabList>
                    <Button onClick={ this.newTab.bind(this) }>+</Button>
                </Flex>
                <TabPanels>
                    { this.state.tabs.map((tabState: TabState, tabNum: number, tabs: TabState[]): JSX.Element =>
                        <TabPanel key={ tabNum }>
                            { tabState.tankSelected ?
                                    <TankViewer loc={ tabState.loc } /> :
                                    <Maps selectTank={ this.selectTank(tabNum) } />
                            }
                        </TabPanel>
                    ) }
                </TabPanels>
            </Tabs>
        );
    }
}

export default TanksPage;
