import React from "react";
import { Button, Stack, Table, TableContainer, Tbody, Td, Text, Textarea, Tr } from '@chakra-ui/react';
import { CellValue, Field, Genotype } from "../../server/database";
import JumpController from "../jumpController";


type Props = {
    motherId: string,
    fatherId: string,
    jumpController: JumpController,
};

type State = {
    child?: Genotype,
    mother?: Genotype,
    father?: Genotype
}

class CrossingPage extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            child: undefined,
            mother: undefined,
            father: undefined,
        };
    }

    /**
     * returns the current state of this page's child's Genotype object
     */
    getChild(): (Genotype | undefined) {
        return this.state.child;
    }

/**
     * Actually loads the parent Genotype data from the database.
     */
    override componentDidMount() {
        (async (): Promise<void> => {
            this.setState({
                mother: await window.electronAPI.readGenotype(this.props.motherId),
                father: await window.electronAPI.readGenotype(this.props.fatherId),
            });
        })();
    }

    /**
     * Saves field to current state. 
     */
    private saveField(fieldNum: number, data: string): void {

    }

    private saveUID(uid: string): void {
        // TODO: make sure UID is not taken already. autofill?
    }

    private saveTanks(): void {
        // TODO: check how to implement this
    }

    /**
     * Saves child Genotype back to database. 
     */
    private saveGenotype(): void {
        if(this.state.child === undefined || this.state.child.uid === undefined) {
            // TODO: tell user to put in UID
        } else {
            // parses all the new fields for location-based jump links and collects
        // the converted results
        Promise.all(this.state.child.fields.map((field: Field): Promise<string> => {
            return this.props.jumpController.convertLocationJumpLink(field.data.toString());
        })).then((fields: string[]): void => {
            // TODO This improperly updates state without checking current state,
            // but I don't think there's a way to do it right.
            this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
                if(state.child === undefined) {
                    return state;
                }

                // deep-ish copy state
                const newState: State = {
                    child: {
                        uid: state.child.uid,
                        fields: [],
                        tanks: state.child.tanks,
                    },
                    mother: state.mother,
                    father: state.father,
                };

                // I don't know why this is necessary
                newState.child = newState.child as Genotype;

                // update state with parsed data
                for(let i = 0; i < fields.length; i++) {
                    newState.child.fields.push({
                        label: state.child.fields[i].label,
                        data: fields[i],
                    });
                }

                // write back to database
                window.electronAPI.writeGenotype(newState.child);

                return newState;
            });
        });
        }
    }
    /**
     * Converts the Genotype object's fields *other* than `fields` to JSX
     */
    private metadataToJSX(): JSX.Element[] {
        if(this.state.child === undefined || this.state.mother === undefined || this.state.father === undefined) {
            return [ <div>loading</div>, ];
        }

        return [
            <Tr key='uid'>
                <Td>UID</Td>
                <Td>
                    { this.state.mother.uid }
                </Td>
                <Td>
                    { this.state.father.uid }
                </Td>
                <Td>
                { 
                    <Textarea value={ this.state.child.uid } rows={ 1 } 
                            onChange={ (e): void => { this.saveUID(e.target.value) } }
                    />
                }
                </Td>
            </Tr>,
            <Tr key='tanks'>
                <Td>tanks</Td>
                <Td>
                    { this.props.jumpController.embedJumps(this.state.mother.tanks.map(
                            (uid: number): string => `\\T${uid}` ).join('\n'))
                    }
                </Td>
                <Td>
                    { this.props.jumpController.embedJumps(this.state.father.tanks.map(
                            (uid: number): string => `\\T${uid}` ).join('\n'))
                    }
                </Td>
            </Tr>,
        ];
    }

    private fieldsToJSX(fields: Field[]): JSX.Element {
        return <></>;
    }

    private generateJSX(fields: Field[]): JSX.Element {
        return (
            <Stack>
                <TableContainer id='tank-table'>
                    <Table variant='striped'>
                        <Tbody>
                            { this.metadataToJSX() }
                            { this.fieldsToJSX(fields) }
                        </Tbody>
                    </Table>
                </TableContainer>
                <Button onClick={ this.saveGenotype.bind(this) }>
                    { 'save' }
                </Button>
            </Stack>
        );
    }

    override render(): JSX.Element {
        if(this.state?.child !== undefined) {
            return this.generateJSX(this.state.child.fields);
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default CrossingPage