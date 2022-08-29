import React from 'react';
import { Button, Stack } from '@chakra-ui/react';
import type { Location } from '../../server/database';

type Props = {
    selectTank: (loc: Location) => void,
};

type State = {};

class Maps extends React.Component<Props, State> {
    private getTankLocations(): Location[] {
        return [
            { row: 1, col: 2, },
            { row: 2, col: 2, },
            { row: 3, col: 2, },
            { row: 4, col: 2, },
        ];
    }

    override render() {
        return (
            <Stack>
                { this.getTankLocations().map((loc: Location, i: number, locs: Location[]): JSX.Element => (
                    <Button onClick={ (): void => this.props.selectTank(loc) } key={ i }>
                        <h2>tank ({ `${ loc.row },${ loc.col }` })</h2>
                    </Button>
                )) }
            </Stack>
        );
    }
}

export default Maps;
