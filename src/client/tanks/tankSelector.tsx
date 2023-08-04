import React from 'react';
import { Button, SimpleGrid, Stack, Text, Textarea, Wrap } from '@chakra-ui/react';
import type { Location, Rack, Tank } from '../../server/database';

type Props = {
    reportTank: (uid: number) => void,
};

type State = {
    racks?: Rack[],
    currentRack?: number, // currentRack is an index of racks
    newTankLocString?: string,
};

class TankSelector extends React.Component<Props, State> {
    /**
     * Actually loads the racks from the database.
     */
    override componentDidMount() {
        (async (): Promise<void> => {
            this.setState({
                racks: await window.electronAPI.getRacks(),
            });
        })();
    }

    /**
     * Updates the state to choose a certain rack.
     */
    private selectRack(currentRack: number): void {
        this.setState({ currentRack: currentRack, })
    }

    /**
     * Reports a tank's uid as the selected item.
     */
    private selectTank(loc: Location): void {
        window.electronAPI.findTank(loc)
                .then((tank: (Tank | undefined)): void => {
                    if(tank !== undefined) {
                        this.props.reportTank(tank.uid);
                    }
                });
    }

    /**
     * makes a new tank and opens that page.
     */
    private newTank(locString: string): void {
        // convert `locString` back to a location
        let loc: Location
        const locStringPieces: (RegExpMatchArray | null) = locString.match(/(\d+),?(\w+),?(\d+)$/);
            
            if (locStringPieces !== null) {
                // if the locString was properly formatted
                loc = {
                    room: 'room',
                    rack: Number(locStringPieces[1]),
                    row: locStringPieces[2].toString().toUpperCase(),
                    col: Number(locStringPieces[3]),
                };
            } else { // TODO: throw an error
                loc = {
                    room: 'room', 
                    rack: 0,
                    row: '',
                    col: 0,
                }
            }
        (async (): Promise<void> => {
            // get next free uid
            const uid: number = (this.state.racks?.map((rack: Rack): number => rack.tanks.length).reduce((prev: number, curr: number): number => prev + curr) ?? -1) + 1;            
            window.electronAPI.writeTank(uid, {
                uid: uid,
                loc: loc,
                genotypes: [],
                dobs: [],
                fields: [],
            })
        })().then((): void => {
            this.selectTank(loc);
        });
    }

    override render(): JSX.Element {
        if(this.state?.racks === undefined) {
            return <Text>loading</Text>;
        }

        return (
            <Stack>
                <Wrap>
                    { this.state.racks.map((rack: Rack, i: number): (JSX.Element | undefined) => (
                        rack !== undefined ?
                            <Button key={ i } isActive={ this.state.currentRack === i }
                                    onClick={ (): void => { this.selectRack(i) }}>
                                <h2>rack { rack.rackNum }</h2>
                            </Button> :
                            undefined
                    )).filter((element: (JSX.Element | undefined)): boolean => (element !== undefined)) }
                </Wrap>
                {
                    this.state.currentRack !== undefined ?
                    <Stack>
                        <hr />
                        <SimpleGrid columns={ this.state.racks[this.state.currentRack].size.width } spacing='10px'>
                            { this.state.racks[this.state.currentRack]?.tanks.map(
                                    (tank: Tank, i: number): JSX.Element => (
                                <Button onClick={ (): void => { this.selectTank(tank.loc) } } key={ i }>
                                    <h2>{ `${ tank.loc.rack }${ tank.loc.row }${ tank.loc.col }` }</h2>
                                </Button>
                            ))}
                        </SimpleGrid>
                    </Stack> :
                    <div />
                }
                <Stack direction={'row'}>
                    <Textarea placeholder='new tank location' value={this.state.newTankLocString} onChange={(event): void => {this.setState({newTankLocString: event.target.value})}} rows={1} width={300}/>

                    <Button onClick={(event): void => {this.newTank(this.state.newTankLocString ?? '')}}>
                        new tank
                    </Button>
                </Stack>
                
            </Stack>
        );
    }
}

export default TankSelector;
