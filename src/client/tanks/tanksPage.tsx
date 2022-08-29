import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Button, Flex } from '@chakra-ui/react';
import TankViewer from './tankViewer';
import Maps from './maps';

import './tanksPage.css';

interface TabState {
    tankSelected: boolean,
    row: number,
    col: number,
}

interface Props {}

interface State {
    tabs: TabState[],
    currentTab: number,
}

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
    }

    selectTank(tabNum: number): (row: number, col: number) => void {
        return (row: number, col: number) => {
            this.setState((state: Readonly<State>, props: Readonly<Props>): State => {
                const tabs: TabState[] = Array.from(state.tabs);
                tabs[tabNum] = {
                    tankSelected: true,
                    row: row,
                    col: col,
                };
                return {
                    tabs: tabs,
                    currentTab: state.currentTab,
                };
            });
        }
    }

    /**
     * must wait until the component is mounted to set state
     */
    componentDidMount = this.newTab;

    /**
     * Open a new tab and set it active. Separate into two functions so it can
     * be called in `closeTab` without breaking the state.
     */
    private newTab(): void { this.setState(this._newTab); }
    private _newTab(state: State, props: Props): State {
        const tabIndex: number = state.tabs.length;
        const newTab: TabState = {
            tankSelected: false,
            row: -1,
            col: -1,
        };
        state.tabs.push(newTab);
        return {
            tabs: state.tabs,
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
        this.setState((state: State, props: Props): State => {
            const newTabs: TabState[] = Array.from(state.tabs);
            newTabs.splice(tabNum, 1);
            
            const newTabNum: number = (state.currentTab <= tabNum && tabNum < newTabs.length) ?
                    state.currentTab : state.currentTab - 1;
            const newState: State = {
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
        this.setState((state: State, props: Props): State => {
            return {
                tabs: state.tabs,
                currentTab: tabNum,
            };
        });
    }

    override render(): JSX.Element {
        return (
            <Tabs index={this.state.currentTab} onChange={this.selectTab.bind(this)}>
                <Flex>
                    <TabList flexGrow='1'>
                        {
                            this.state.tabs.map((tabState: TabState, tabNum: number, tabs: TabState[]): JSX.Element =>
                                <Tab key={tabNum}>
                                    {
                                        tabState.tankSelected ? `(${tabState.row},${tabState.col})` : 'new tab'
                                    }
                                    <Button onClick={ () => {this.closeTab(tabNum)} } size='xs' marginLeft='1ch'>X</Button>
                                </Tab>
                            )
                        }
                    </TabList>
                    <Button onClick={this.newTab.bind(this)}>+</Button>
                </Flex>
                <TabPanels>
                    {
                        this.state.tabs.map((tabState: TabState, tabNum: number, tabs: TabState[]): JSX.Element => 
                            <TabPanel key={tabNum}>
                                {
                                    tabState.tankSelected ?
                                        <TankViewer row={tabState.row} col={tabState.col} /> :
                                        <Maps row={tabState.row} col={tabState.col} selectTank={this.selectTank(tabNum)} />
                                }
                            </TabPanel>
                        )
                    }
                </TabPanels>
            </Tabs>
        );
    }
}

export default TanksPage;
