import React from 'react';
import ReactDOM from 'react-dom';
import TankTab from './tankTab.js';

import './tanksPage.css';

/**
 * This class is responsible for everything about tanks. The page has some
 * (positive?) number of tank tabs which each show either a maps page for
 * selecting a tank or a tankData page for showing data.
 *
 * `this.state.tabs` is an array of TankTab states.
 */
class TanksPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabs: [],
        };
        this.setTabState = this.setTabState.bind(this);
    }

    /**
     * must wait until the component is mounted to set state
     */
    componentDidMount() {
        this.#newTab();
        this.#newTab();
        this.#newTab();
        this.#newTab();
        this.setState({currentTab: 0});
    }

    /**
     * archives the state from an unmounting tab
     */
    setTabState(tabIndex, tabState) {
        this.state.tabs[tabIndex] = tabState;
        this.setState({tabs: this.state.tabs});
    }

    #newTab() {
        this.setState((state, props) => {
            const tabIndex = state.tabs.length;
            const newTab = {tankSelected: false};
            state.tabs.push(newTab);
            return {
                tabs: state.tabs,
                currentTab: tabIndex,
            };
        });
    }

    #selectTab(tabNum) {
        this.setState({currentTab: tabNum});
    }

    render() {
        const tabRow = [];
        for(let i in this.state.tabs) {
            tabRow.push(
                <div key={i} onClick={() => this.#selectTab(i)} class='tab'>
                    { `tab #${i}` }
                </div>
            );
        }

        if(tabRow.length > 0) {
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
        }
    }
}

export default TanksPage;
