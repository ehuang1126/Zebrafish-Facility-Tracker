import React from 'react';
import { Box, Flex, Link, Text } from '@chakra-ui/react';

import './landingPage.css';

type Props = {
    jumpTank?: (uid: number) => void,
    jumpGene?: (uid: string) => void,
};

type State = {};

class LandingPage extends React.Component<Props, State> {
    /**
     * These functions currently take some uid and convert it to a jump link.
     * 
     * Hopefully, it will eventually be able to take a whole body of text and
     * convert tank and gene UIDs into jump links.
     */
    // TODO this needs to be moved, probably to a utils file.
    private embedTankJumps(uid: number): JSX.Element {
        const text = `tank id#${ uid }`;

        // on error or not quite yet loaded
        if(this.props.jumpTank === undefined) {
            return (
                <Text>
                    { text }
                </Text>
            );
        }

        // generate jump link
        return (
            <Link onClick={ (): void => {
                if(this.props.jumpTank !== undefined) {
                    this.props.jumpTank(uid);
                }
            } }>
                <u>
                    { text }
                </u>
            </Link>
        );
    }
    private embedGeneJumps(uid: string): JSX.Element {
        // TODO figure out how these jumps should be labeled
        const text = `gene ${ uid }`;

        // on error or not quite yet loaded
        if(this.props.jumpGene !== undefined) {
            return (
                <Text>
                    { text }
                </Text>
            );
        }

        // generate jump link
        return (
            <Link onClick={ (): void => {
                if(this.props.jumpGene) {
                    this.props.jumpGene(uid);
                }
            } }>
                <u>
                    { text }
                </u>
            </Link>
        );
    }

    override render(): JSX.Element {
        return (
            <Flex flexDirection='row'>
                <Box id='news-pane'>
                    <Text>This is where the news goes.</Text>
                    <Text>jump to { this.embedTankJumps(3) }</Text>
                    <Text>jump to { this.embedGeneJumps('90') }</Text>
                </Box>
                <Box id='warnings-pane'>
                    <Text>This is where the warnings go.</Text>
                </Box>
            </Flex>
        );
    }
}

export default LandingPage;
