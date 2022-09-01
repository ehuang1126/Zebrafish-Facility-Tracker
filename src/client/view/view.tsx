import React from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import LandingPage from '../landing/landingPage';
import TanksPage from '../tanks/tanksPage';
import GenesPage from '../genes/genesPage';
import JumpController from '../jumpController';

import './view.css';

type Props = {};

type State = {
    currentTab: number,
    jumpController: JumpController,
};

/**
 * This class represents the entire window.
 */
class View extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            currentTab: 0,
            jumpController: new JumpController(this),
        }
    }

    /**
     * Activates a tab, both in this class's state and in the state of the Tabs
     * elements.
     */
    private selectTab(tabNum: number): void {
        this.setState({ currentTab: tabNum, });
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
                        <LandingPage jumpController={ this.state?.jumpController }/>
                    </TabPanel>
                    <TabPanel key='tanks'>
                        <TanksPage jumpController={ this.state?.jumpController }/>
                    </TabPanel>
                    <TabPanel key='genes'>
                        <GenesPage jumpController={ this.state?.jumpController }/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        );
    }
}

export default View;
