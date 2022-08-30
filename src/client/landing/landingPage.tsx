import React from 'react';
import { Box, Flex, Link, Text } from '@chakra-ui/react';

import './landingPage.css';

type Props = {
    jumpTank?: (uid: number) => void,
};

type State = {};

class LandingPage extends React.Component<Props, State> {
    /**
     * This function currently takes some location and converts it to a jump
     * link.
     * 
     * Hopefully, it will eventually be able to take a whole body of text and
     * convert tank and gene references into jump links.
     */
    // TODO this needs to be moved, probably to a utils file.
    private embedJumps(uid: number): JSX.Element {
        // TODO figure out how these jumps should be labeled
        const text = `tank id#${ uid }`;
        if(this.props.jumpTank !== undefined) {
            return (
                <Link onClick={ (): void => {
                    if(this.props.jumpTank) {
                        this.props.jumpTank(uid);
                    }
                } }>
                    <u>
                        { text }
                    </u>
                </Link>
            );
        } else {
            return (
                <Text>
                    { text }
                </Text>
            );
        }
    }

    override render(): JSX.Element {
        return (
            <Flex flexDirection='row'>
                <Box id='news-pane'>
                    <Text>This is where the news goes.</Text>
                    <Text>jump to { this.embedJumps(3) }</Text>
                </Box>
                <Box id='warnings-pane'>
                    <Text>This is where the warnings go.</Text>
                </Box>
            </Flex>
        );
    }
}

export default LandingPage;
