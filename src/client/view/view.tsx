import React from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import LandingPage from '../landing/landingPage';
import TanksPage from '../tanks/tanksPage';
import type { Location } from '../../server/database';
import GenesPage from '../genes/genesPage';

import './view.css';

type Props = {};

type State = {
    currentTab: number,
    jumpTank?: (loc: Location) => void,
};

/**
 * This class represents the entire window.
 */
class View extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            currentTab: 0,
            jumpTank: undefined,
        }
    }

    /**
     * This method registers a handler for a 'jump to Tank' event.
     */
    registerJumpTankHandler(handler: (loc: Location) => void): void {
        this.setState({ jumpTank: (loc: Location) => {
            handler(loc);
            this.setState({currentTab: 1})
        } });
    }

    /**
     * Activates a tab, both in this class's state and in the state of the Tabs
     * elements.
     */
    private selectTab(tabNum: number): void {
        this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
            return {
                currentTab: tabNum,
            };
        });
    }

    override render(): JSX.Element {
        return (
            <Tabs id='view' isFitted size='lg'
                    index={ this.state.currentTab } onChange={ this.selectTab.bind(this) }>
                <TabList>
                    <Tab key='front'>front page</Tab>
                    <Tab key='tanks'>tanks page</Tab>
                    <Tab key='genes'>genes page</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel key='front'>
                        <LandingPage jumpTank={this.state?.jumpTank}/>
                    </TabPanel>
                    <TabPanel key='tanks'>
                        <TanksPage registerJumpHandler={ this.registerJumpTankHandler.bind(this) } />
                    </TabPanel>
                    <TabPanel key='genes'>
                        <GenesPage />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        );
    }
}

export default View;
