import React from 'react';
import { Button, Stack, Text, Wrap } from '@chakra-ui/react';
import type { Location, Rack, Tank } from '../../server/database';

type Props = {
    reportTank: (uid: number) => void,
};

type State = {
    racks?: Rack[],
    currentRack?: number, // currentRack is an index of racks
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

    override render(): JSX.Element {
        if(this.state?.racks === undefined) {
            return <Text>loading</Text>;
        }

        return (
            <Stack>
                <Wrap>
                    { this.state.racks.map((rack: Rack, i: number): JSX.Element => (
                        <Button key={ i } isActive={ this.state.currentRack === i }
                                onClick={ (): void => { this.selectRack(i) }}>
                            <h2>rack { rack.rackNum }</h2>
                        </Button>
                    )) }
                </Wrap>
                {
                    this.state.currentRack !== undefined ?
                    <Stack>
                        <hr />
                        <Wrap>
                            { this.state.racks[this.state.currentRack]?.tanks.map(
                                    (tank: Tank, i: number): JSX.Element => (
                                <Button onClick={ (): void => { this.selectTank(tank.loc) } } key={ i }>
                                    <h2>tank { `${ tank.loc.rack }${ tank.loc.row }${ tank.loc.col }` }</h2>
                                </Button>
                            ))}
                        </Wrap>
                    </Stack> :
                    <div />
                }
            </Stack>
        );
    }
}

export default TankSelector;
