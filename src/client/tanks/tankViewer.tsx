import React from 'react';
import { Table, TableContainer, Tbody, Td, Tr, Text } from '@chakra-ui/react';
import type { CellValue, Field, Tank, Location } from '../../server/database.js';

type Props = {
    loc: Location,
};

type State = {
    tank: Tank,
};

/**
 * This class represents the visualizer for a single Tank's data. It expects
 * `props.row` and `props.col` to be the location Tank object it should show.
 */
class TankViewer extends React.Component<Props, State> {
    /**
     * Actually loads the Tank data from the database.
     */
    componentDidMount() {
        (async () => {
            const tank: Tank = await window.electronAPI.readTank(this.props.loc);
            this.setState({
                tank: tank,
            });
        })();
    }

    /**
     * a test to check if a cell's value is actually empty
     * 
     * Excludes undefined, empty string, and 'nan'
     */
    private cellValueNotEmpty(value: CellValue): boolean {
        return value !== undefined && (typeof value === 'number' || (value !== 'nan' && value.trim().length > 0));
    }

    /**
     * Converts this tab's Tank object to JSX.
     */
    private generateJSX(): JSX.Element {
        return (
            <TableContainer id='tank-table'>
                <Table variant='striped'>
                    <Tbody> {
                        this.state.tank.filter((field: Field, i: number, tank: Tank): boolean => 
                            (this.cellValueNotEmpty(field.label) && this.cellValueNotEmpty(field.data))
                        ).map((field: Field, i: number, tank: Tank): JSX.Element => {
                            return (
                                <Tr key={ i }>
                                    <Td>{ field.label }</Td>
                                    <Td>{ field.data }</Td>
                                </Tr>
                            );
                        })
                    }
                    </Tbody>
                </Table>
            </TableContainer>
        );
    }

    override render(): JSX.Element {
        if(this.state?.tank) {
            return this.generateJSX();
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default TankViewer;
