import React from 'react';
import { Table, TableContainer, Tbody, Td, Tr, Text, Textarea } from '@chakra-ui/react';
import type { CellValue, Field, Tank, Location } from '../../server/database.js';

type Props = {
    loc: Location,
    isEditing: boolean,
};

type State = {
    tank?: Tank,
};

/**
 * This class represents the visualizer for a single Tank's data. It expects
 * `props.row` and `props.col` to be the location Tank object it should show.
 */
class TankViewer extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            tank: undefined,
        };
    }

    /**
     * returns the current state of this page's Tank object
     */
    getTank(): (Tank | undefined) {
        return this.state.tank;
    }
    
    /**
     * Actually loads the Tank data from the database.
     */
    override componentDidMount() {
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
     * saves the edited field into the current state
     * 
     * This attempts to guess if the input is a number.
     */
    private saveData(fieldNum: number, data: string): void {
        let checkedData: CellValue = data;

        // check if number
        if(data && data.trim().length > 0) {
            const parsedNum: number = Number(data);
            if(!Number.isNaN(parsedNum)) {
                checkedData = parsedNum;
            }
        }

        this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
            if(state.tank) {
                const tank: Tank = {
                    loc: state.tank.loc,
                    gene: state.tank.gene,
                    fields: Array.from(state.tank.fields),
                }
                tank.fields[fieldNum].data = checkedData;
                
                return {
                    tank: tank,
                };
            } else {
                return state;
            }
        });
    }

    /**
     * Converts this tab's Tank object to JSX.
     */
    private generateJSX(): JSX.Element {
        return (
            <TableContainer id='tank-table'>
                <Table variant='striped'>
                    <Tbody> {
                        this.state.tank?.fields.filter((field: Field, i: number, fields: Field[]): boolean => 
                            this.props.isEditing || (this.cellValueNotEmpty(field.label) && this.cellValueNotEmpty(field.data))
                        ).map((field: Field, i: number, fields: Field[]): JSX.Element => {
                            return (
                                <Tr key={ i }>
                                    <Td>{ field.label }</Td>
                                    <Td> {
                                        this.props.isEditing ?
                                            <Textarea value={ field.data } rows={ 1 } 
                                                    onChange={ (e) => { this.saveData(i, e.target.value) } }
                                            /> :
                                            field.data
                                    } </Td>
                                </Tr>
                            );
                        })
                    } </Tbody>
                </Table>
            </TableContainer>
        );
    }

    override render(): JSX.Element {
        console.log(this.state?.tank);
        if(this.state?.tank) {
            return this.generateJSX();
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default TankViewer;
