import { Table, TableContainer, Tbody, Td, Tr, Text } from '@chakra-ui/react';
import React from 'react';
import type {Tank} from '../../server/database.js';

type CellValue = (string | number);

interface Props {
    row: number,
    col: number,
}

interface State {
    tank: Tank,
}

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
            const tank: Tank = await window.electronAPI.readTank(this.props.row, this.props.col);
            this.setState({
                tank: tank,
            });
        })();
    }

    /**
     * Converts this tab's Tank object to JSX.
     */
    private generateJSX(): JSX.Element {
        console.log(this.state.tank);
        return (
            <TableContainer>
                <Table>
                    <Tbody>
                        {
                            this.state.tank.labels.map((label: CellValue, i: number, labels: CellValue[]): JSX.Element => (
                                <Tr>
                                    <Td> {label} </Td>
                                    <Td> {this.state.tank.data[i]}</Td>
                                </Tr>
                            ))
                        }
                    </Tbody>
                </Table>
            </TableContainer>
        );
    }

    render(): JSX.Element {
        if(this.state?.tank) {
            return this.generateJSX();
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default TankViewer;
