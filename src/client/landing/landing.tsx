import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

import './landing.css';

class Landing extends React.Component {
    render(): JSX.Element {
        return (
            <Flex flexDirection='row'>
                <Box id='news-pane'>
                    <Text>This is where the news goes.</Text>
                </Box>
                <Box id='warnings-pane'>
                    <Text>This is where the warnings go.</Text>
                </Box>
            </Flex>
        );
    }
}

export default Landing;
