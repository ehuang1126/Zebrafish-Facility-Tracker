import React from 'react';
import { Button, CloseButton, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';

import './tabsPage.css';

type TabState = {
    contentSelected: boolean,
    contentID: (string | number),
    name: string,
};

type Props = {
    registerJumpHandler: (handler: (uid: (string | number)) => void) => void ,
};

type State = {
    tabs: TabState[],
    currentTab: number,
};

/**
 * This class is an interface for pages that use tabs and have selectors, such
 * as the tanks and gene pages. Implementing classes should override `jumpToID`
 * and `renderTabContent`.
 */
abstract class TabsPage extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            tabs: [],
            currentTab: 0,
        };
        props.registerJumpHandler(this.jumpToID.bind(this));
    }

    /**
     * must wait until the component is mounted to set state
     */
    override componentDidMount = this.newTab;

    /**
     * Handles jump links. Override this.
     */
    abstract jumpToID(uid: (string | number)): void;

    /**
     * Open a new tab and set it active. Separate into two functions so it can
     * be called in `closeTab` without breaking the state.
     */
    protected newTab(): void { this.setState(this._newTab); }
    protected _newTab(state: Readonly<State>, props: Readonly<Props>): Readonly<State> {
        const tabIndex: number = state.tabs.length;
        const newTab: TabState = {
            contentSelected: false,
            contentID: -1,
            name: 'new tab',
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
    protected closeTab(tabNum: number): void {
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
    protected selectTab(tabNum: number): void {
        this.setState((state: Readonly<State>): Readonly<State> => {
            return {
                tabs: state.tabs,
                currentTab: tabNum,
            };
        });
    }

    override render(): JSX.Element {
        return (
            <Tabs size='sm' variant='enclosed-colored'
                    index={ this.state.currentTab } onChange={ this.selectTab.bind(this) }>
                <Flex maxWidth='100vw'>
                    <TabList id='tab-handle-row'>
                        { this.state.tabs.map((tabState: TabState, tabNum: number): JSX.Element =>
                            <Tab className='tab-handle' key={ tabNum }>
                                <Flex>
                                    { tabState.name }
                                    <CloseButton className='tab-close' size='sm'
                                            onClick={ (): void => { this.closeTab(tabNum) } } />
                                </Flex>
                            </Tab>
                        ) }
                    </TabList>
                    <Button onClick={ this.newTab.bind(this) }>+</Button>
                </Flex>
                <TabPanels>
                    { this.state.tabs.map((tabState: TabState, tabNum: number): JSX.Element =>
                        <TabPanel key={ tabNum }>
                            { this.renderTabContent(tabNum) }
                        </TabPanel>
                    ) }
                </TabPanels>
            </Tabs>
        );
    }

    /**
     * This renders the actual view inside the tab
     */
    protected abstract renderTabContent(tabNum: number): JSX.Element;
}

export default TabsPage;
export type {
    Props,
    State,
    TabState,
};
