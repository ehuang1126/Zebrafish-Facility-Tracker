import React from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import Landing from '../landing/landing';
import TanksPage from '../tanks/tanksPage';
import Genes from '../genes/genes';

import './view.css';

interface Props {}

interface State {}

/**
 * This class represents the entire window.
 */
class View extends React.Component<Props, State> {
    render(): JSX.Element {
        return (
            <Tabs id='view' isFitted size='lg'>
                <TabList>
                    <Tab key='front'>front page</Tab>
                    <Tab key='tanks'>tanks page</Tab>
                    <Tab key='genes'>genes page</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel key='front'>
                        <Landing />
                    </TabPanel>
                    <TabPanel key='tanks'>
                        <TanksPage />
                    </TabPanel>
                    <TabPanel key='genes'>
                        <Genes />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        );
    }
}

export default View;
