import React from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import LandingPage from '../landing/landingPage';
import TanksPage from '../tanks/tanksPage';
import GenotypesPage from '../genotype/genotypesPage';
import JumpController from '../jumpController';
import CrossingPage from '../crossing/crossingPage';

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
                    <Tab key='news'>news</Tab>
                    <Tab key='tanks'>tanks</Tab>
                    <Tab key='genotypes'>genotypes</Tab>
                    <Tab key='crossing'>crossing</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel key='front'>
                        <LandingPage jumpController={ this.state?.jumpController }/>
                    </TabPanel>
                    <TabPanel key='tanks'>
                        <TanksPage jumpController={ this.state?.jumpController }/>
                    </TabPanel>
                    <TabPanel key='genotypes'>
                        <GenotypesPage jumpController={ this.state?.jumpController }/>
                    </TabPanel>
                    <TabPanel key='crossing'>
                        <CrossingPage jumpController={ this.state?.jumpController } />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        );
    }
}

export default View;
