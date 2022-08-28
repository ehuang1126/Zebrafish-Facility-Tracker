import React from 'react';
import TankTab from './tankTab';
import type {TankState} from './tankTab';

import './tanksPage.css';

interface Props {}

interface State {
    tabs: TankState[],
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
            currentTab: -1,
        };
        this.setTabState = this.setTabState.bind(this);
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
     * archives the state from an unmounting tab
     */
    setTabState(tabIndex: number, tabState: TankState): void {
        const newTabs = this.state.tabs;
        newTabs[tabIndex] = tabState;
        this.setState({tabs: newTabs});
    }

    private newTab(): void {
        this.setState((state: State, props: Props): State => {
            const tabIndex: number = state.tabs.length;
            const newTab: TankState = {
                tankSelected: false,
                tankRow: -1,
                tankCol: -1,
            };
            state.tabs.push(newTab);
            return {
                tabs: state.tabs,
                currentTab: tabIndex,
            };
        });
    }

    selectTab(tabNum: number): void {
        this.setState({currentTab: tabNum});
    }

    render(): JSX.Element {
        const tabRow: JSX.Element[] = [];
        if(this.state.tabs.length > 0) {
            for(let i in this.state.tabs) {
                tabRow.push(
                    <div key={i} onClick={(): void => this.selectTab(parseInt(i))} className='tab'>
                        { `tab #${i}` }
                    </div>
                );
            }

            return (
                <div id='tanks-page'>
                    <div id='tab-row'>
                        { tabRow }
                    </div>
                    <TankTab
                        key={this.state.currentTab}
                        tabIndex={this.state.currentTab}
                        state={this.state.tabs[this.state.currentTab]}
                        archiveState={this.setTabState}
                    />
                </div>
            );
        } else {
            return <div />;
        }
    }
}

export default TanksPage;
