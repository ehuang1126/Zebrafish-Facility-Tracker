import React from "react";
import { Button, Modal, Stack, Table, TableContainer, Tbody, Td, Text, Textarea, Tr } from '@chakra-ui/react';
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
    father?: Genotype,
    genotypes?: Map<string, Genotype>,
}

class CrossingPage extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            child: undefined,
            mother: undefined,
            father: undefined,
            genotypes: undefined,
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
                genotypes: await window.electronAPI.getGenotypes(),
            });

            // auto-populate child UID, with mother and father UID fields
            // TODO: is this the right place to call this?
            this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
                if(state.mother === undefined || state.father === undefined || state.genotypes === undefined) {
                    return state;
                }
 
                const newState: State = {
                    child: {
                        uid: String(state.genotypes.size + 1),
                        fields: [{
                            label: 'mother',
                            data: state.mother.uid,
                        }, {
                            label: 'father',
                            data: state.father.uid,
                        }],
                        tanks: [],
                    },
                    mother: state.mother,
                    father: state.father,
                    genotypes: state.genotypes,
                }

                return newState;
            })
        })();
    }

    /**
     * Saves child field to current state. 
     */
    private saveField(fieldNum: number, data: string): void {
        let checkedData: CellValue = data;

        // check if number
        if(data.trim().length > 0) {
            const parsedNum: number = Number(data);
            if(!Number.isNaN(parsedNum)) {
                checkedData = parsedNum;
            }
        }

        // save the data into state
        this.setState((state: Readonly<State>): Readonly<State> => {
            if(state.child === undefined) {
                return state;
            }

            const child: Genotype = {
                uid: state.child.uid,
                fields: Array.from(state.child.fields),
                tanks: state.child.tanks,
            }
            if(child.fields[fieldNum] !== undefined) {
                child.fields[fieldNum].data = checkedData;
            }
            
            return {
                child: child,
                mother: state.mother,
                father: state.father,
            };
        });
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
            // TODO: tell user to put in UID?
            return;
        } else if(this.state.genotypes?.has(this.state.child.uid)) {
            // TODO: inform user to put in new UID
            return;
        } 
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

    // TODO: fix this to also show mother/father fields and make child's mother/father fields immutable
    private fieldsToJSX(fields: Field[]): JSX.Element[] {
        return fields.map((field: Field, i: number): JSX.Element => {
            return (
                <Tr key={ i }>
                    <Td key='label'>{ field.label }</Td>
                    <Td key='data'>
                        { 
                            <Textarea value={ field.data } rows={ 1 } 
                                    onChange={ (e): void => { this.saveField(i, e.target.value) } }
                            /> 
                        }
                    </Td>
                </Tr>
            );
        });
    }

    private generateJSX(fields: Field[]): JSX.Element {
        return (
            <Stack>
                <TableContainer id='crossing-table'>
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

    /**
     * This function will pop up with an error page using Chakra modal in case
     * the child's input is incompatible. This will happen when the UID is taken 
     * already, any of the tanks are taken already, other cases??? Maybe this
     * can be more modular and be somewhere else. 
     */
    private generateErrorPopup(errorType: string): JSX.Element {
        // TODO: add isValid or something to state to determine whether to call this or not
        return <></>;
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