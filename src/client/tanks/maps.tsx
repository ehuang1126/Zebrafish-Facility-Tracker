import React from 'react';
import { Button, Stack } from '@chakra-ui/react';
import type { Location, Tank } from '../../server/database';

type Props = {
    reportTank: (uid: number) => void,
};

type State = {};

class Maps extends React.Component<Props, State> {
    private getTankLocations(): Location[] {
        return [
            { rack: 1, row: 'A', col: 1, },
            { rack: 1, row: 'A', col: 2, },
            { rack: 1, row: 'B', col: 1, },
            { rack: 1, row: 'B', col: 2, },
        ];
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

    override render() {
        return (
            <Stack>
                { this.getTankLocations().map((loc: Location, i: number, locs: Location[]): JSX.Element => (
                    <Button onClick={ (): void => { this.selectTank(loc) } } key={ i }>
                        <h2>tank { `${ loc.row }${ loc.col }` }</h2>
                    </Button>
                )) }
            </Stack>
        );
    }
}

export default Maps;
