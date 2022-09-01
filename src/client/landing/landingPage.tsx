import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import JumpController from '../jumpController';

import './landingPage.css';

type Props = {
    jumpController?: JumpController,
};

type State = {};

class LandingPage extends React.Component<Props, State> {
    override render(): JSX.Element {
        return (
            <Flex flexDirection='row'>
                <Box id='news-pane'>
                    {
                        this.props.jumpController?.embedJumps(
                                'This is where the news goes.\n' +
                                'jump to \\T3\n' +
                                'jump to \\G90'
                        )
                    }
                </Box>
                <Box id='warnings-pane'>
                    <Text>This is where the warnings go.</Text>
                </Box>
            </Flex>
        );
    }
}

export default LandingPage;
