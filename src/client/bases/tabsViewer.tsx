import React from 'react';
import { Table, TableContainer, Tbody, Td, Tr, Textarea, Stack, Button } from '@chakra-ui/react';
import type { CellValue, Field } from '../../server/database';
import JumpController from '../jumpController';

type Props = {
    jumpController: JumpController,
};

abstract class TabsViewer<P, S> extends React.Component<(P & Props), S> {
    /**
     * a test to check if a cell's value is actually empty
     * 
     * Excludes undefined, empty string, and 'nan'
     */
    private static cellValueNotEmpty(value: CellValue): boolean {
        return (typeof value === 'number' || (value !== 'nan' && value.trim().length > 0));
    }
 
    /**
     * saves the edited field into the current state
     */
    protected abstract saveData(fieldNum: number, data: string): void;

    /**
     * This toggles between edit and view. Importantly, it also saves back to
     * the database when toggling back from edit.
     */
    protected abstract toggleEdit(): void;

    /**
     * Converts this tab's Tank object to JSX.
     */
    protected generateJSX(isEditing: boolean, fields: Field[]): JSX.Element {
        return (
            <Stack>
                <TableContainer id='tank-table'>
                    <Table variant='striped'>
                        <Tbody> {
                            fields.filter((field: Field): boolean => 
                                isEditing ||
                                        (TabsViewer.cellValueNotEmpty(field.label) &&
                                        TabsViewer.cellValueNotEmpty(field.data))
                            ).map((field: Field, i: number): JSX.Element => {
                                return (
                                    <Tr key={ i }>
                                        <Td>{ field.label }</Td>
                                        <Td> {
                                            isEditing ?
                                                <Textarea value={ field.data } rows={ 1 } 
                                                        onChange={ (e): void => { this.saveData(i, e.target.value) } }
                                                /> :
                                                this.props.jumpController.embedJumps(field.data.toString()) // TODO is always converting to a string fine?
                                        } </Td>
                                    </Tr>
                                );
                            })
                        } </Tbody>
                    </Table>
                </TableContainer>
                <Button onClick={ this.toggleEdit.bind(this) }> {
                    isEditing ? 'save' : 'edit'
                } </Button>
            </Stack>
        );
    }
}

export default TabsViewer;
