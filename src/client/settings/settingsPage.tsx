import React from 'react';
import JumpController from '../jumpController';
import { Button, Card, CardBody, CardHeader, Divider, Heading, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';

type Props = {
    jumpController?: JumpController,
};

type State = {};

class SettingsPage extends React.Component<Props, State> {
    override render(): JSX.Element {
        return (
            <Card>
                <CardHeader>
                    <Heading>Settings</Heading>
                </CardHeader>
                <Divider></Divider>
                <CardBody>
                    <TableContainer>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>
                                        instruction
                                    </Th>
                                    <Th>
                                        option
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>
                                        <Stack>
                                            <Text>
                                                Import from data/input.xlsx (THIS WILL OVERWRITE THE CURRENT DATA). 
                                            </Text>
                                            <Text>
                                                If the pages are buggy after importing, close and reopen the database. 
                                            </Text>
                                        </Stack>
                                        
                                    </Td>
                                    <Td>
                                        <Button onClick={(event): void => { window.electronAPI.importFromXLSX('./data/input.xlsx'); }} width={20}>
                                            Import
                                        </Button>
                                    </Td>
                                </Tr>
                            </Tbody>
                            
                        </Table>
                    </TableContainer>
                        
                </CardBody>
                
            </Card>
        );
    }
}

export default SettingsPage