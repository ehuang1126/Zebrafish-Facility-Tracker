import React from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import LandingPage from '../landing/landingPage';
import TanksPage from '../tanks/tanksPage';
import GenesPage from '../genes/genesPage';

import './view.css';

type Props = {};

type State = {
    currentTab: number,
    jumpTank?: (uid: number) => void,
    jumpGene?: (uid: string) => void,
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
            jumpGene: undefined,
        }
    }

    /**
     * This method registers a handler for a 'jump to Tank' event.
     */
    registerJumpTankHandler(handler: (uid: number) => void): void {
        this.setState({ jumpTank: (uid: number) => {
            handler(uid);
            this.setState({currentTab: 1})
        } });
    }

    /**
     * This method registers a handler for a 'jump to Gene' event.
     */
    registerJumpGeneHandler(handler: (uid: string) => void): void {
        this.setState({ jumpGene: (uid: string) => {
            handler(uid);
            this.setState({currentTab: 2})
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
                        <LandingPage jumpTank={ this.state?.jumpTank } jumpGene={ this.state?.jumpGene }/>
                    </TabPanel>
                    <TabPanel key='tanks'>
                        <TanksPage registerJumpHandler={ this.registerJumpTankHandler.bind(this) } />
                    </TabPanel>
                    <TabPanel key='genes'>
                        <GenesPage registerJumpHandler={ this.registerJumpGeneHandler.bind(this) } />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        );
    }
}

export default View;
