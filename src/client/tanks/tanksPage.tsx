import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
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
    componentDidMount(): void {
        this.newTab();
        this.newTab();
        this.newTab();
        this.newTab();
        this.setState({currentTab: 0});
    }

    /**
     * Open a new tab and set it active.
     */
    private newTab(): void {
        this.setState((state: State, props: Props): State => {
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
        });
    }

    render(): JSX.Element {
        return (
            <Tabs defaultIndex={this.state.currentTab}>
                <TabList>
                    {
                        this.state.tabs.map((tabState: TabState, tabNum: number, tabs: TabState[]): JSX.Element =>
                            <Tab key={tabNum}>tab #{tabNum}</Tab>
                        )
                    }
                </TabList>
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
