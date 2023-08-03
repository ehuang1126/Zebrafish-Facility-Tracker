import React from 'react';
import { Box, Flex, ListItem, Stack, Text, UnorderedList } from '@chakra-ui/react';
import JumpController from '../jumpController';

import './landingPage.css';
import { Genotype, Rack, Tank } from '../../server/database';

type Props = {
    jumpController?: JumpController,
};

type State = {
    genotypes?: Map<string, Genotype>,
    racks?: Rack[],
    tanksToCross?: Tank[],
};

class LandingPage extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            genotypes: new Map<string, Genotype>(),
            racks: [],
            tanksToCross: []
        }
    }
    override componentDidMount(): void {
        (async (): Promise<void> => {
            this.setState({
                genotypes: await window.electronAPI.getGenotypes(),
                racks: await window.electronAPI.getRacks(),
            });
        })().then((): void => {
            this.setState((state: Readonly<State>): Readonly<State> => {
                const tanks: Tank[] = [];
                if(state.racks !== undefined) {
                    for(let rack of state.racks) {
                        for(let tank of rack.tanks) {
                            if(tank.dobs.some((date: Date): boolean => Number(new Date()) - Number(new Date(date)) > Number(new Date(1970, 0, 90)))) {
                                tanks.push(tank);
                            }
                        }
                    }
                }
                return {
                    genotypes: state.genotypes,
                    racks: state.racks,
                    tanksToCross: tanks,
                }
            })
        });
    }
    
    override render(): JSX.Element {
        return (
            <Flex flexDirection='row'>
                <Box id='news-pane'>
                    { this.props.jumpController?.embedJumps(
                                'This is where the news goes.\n' +
                                'jump to \\T9\n' +
                                'jump to \\G93'
                        )
                    }
                </Box>
                    <Box id='warnings-pane'>
                        { this.state.tanksToCross !== undefined && this.state.tanksToCross.length > 0 ? 
                            <Stack>
                                <Text>The following tanks are 90 days old: </Text>
                                <UnorderedList>
                                    {
                                        this.state.tanksToCross?.map((tank: Tank): JSX.Element => {
                                            return (<ListItem>
                                                { this.props.jumpController?.embedJumps(`\\T${tank.uid}`)}
                                            </ListItem>);
                                        }) 
                                    }
                                </UnorderedList>
                            </Stack>
                            : <Text>This is where the warnings go.</Text>
                        }
                    </Box>
            </Flex>
            
        );
    }
}

export default LandingPage;
