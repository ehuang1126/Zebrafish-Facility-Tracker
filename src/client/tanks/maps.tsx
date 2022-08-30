import React from 'react';
import { Button, Stack, Text } from '@chakra-ui/react';
import type { Location, Rack, Tank } from '../../server/database';

type Props = {
    reportTank: (uid: number) => void,
};

type State = {
    racks: Rack[],
};

class Maps extends React.Component<Props, State> {
    /**
     * Actually loads the racks from the database.
     */
    override componentDidMount() {
        (async () => {
            this.setState({
                racks: await window.electronAPI.getRacks(),
            });
        })();
    }

    /**
     * Reports a tank's uid as the selected tank.
     */
    private selectTank(loc: Location): void {
        window.electronAPI.findTank(loc)
                .then((tank: (Tank | undefined)): void => {
                    if(tank !== undefined) {
                        this.props.reportTank(tank.uid);
                    }
                });
    }

    private generateJSX(): JSX.Element {
        return (
            <Stack>
                { this.state.racks.flatMap((rack: Rack, i: number, racks: Rack[]): JSX.Element[] => (
                    rack?.tanks.map((tank: Tank, j: number, tanks: Tank[]) => (
                        <Button onClick={ (): void => { this.selectTank(tank.loc) } } key={ `${ i },${ j }` }>
                            <h2>tank { `${ tank.loc.rack }${ tank.loc.row }${ tank.loc.col }` }</h2>
                        </Button>
                    ))
                )) }
            </Stack>
        );
    }

    override render(): JSX.Element {
        if(this.state?.racks !== undefined) {
            return this.generateJSX();
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default Maps;
