import React from "react";
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Stack, Table, TableContainer, Tbody, Td, Text, Textarea, Th, Tr } from '@chakra-ui/react';
import { CellValue, Field, Genotype } from "../../server/database";
import JumpController from "../jumpController";
import CrossingPage from "./crossingPage";


type Props = {
    motherId: string,
    fatherId: string,
    jumpController: JumpController,
    crossingPage: CrossingPage
};

type State = {
    child?: Genotype,
    mother?: Genotype,
    father?: Genotype,
    genotypes?: Map<string, Genotype>,
    invalidUID: string
}

const TAKEN_UID_MESSAGE: string = 'The UID you have entered is already taken by another Genotype. Please enter a new UID. ';
const INVALID_UID_MESSAGE: string = 'The UID you have entered is in an unrecognized format. Please enter a number. '

class CrossingTable extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            child: undefined,
            mother: undefined,
            father: undefined,
            genotypes: undefined,
            invalidUID: '',
        };
    }

    /**
     * returns the current state of this page's child's Genotype object
     */
    getChild(): (Genotype | undefined) {
        return this.state.child;
    }

    /**
     * Actually loads the parents' Genotype data from the database.
     */
    override componentDidMount() {
        (async (): Promise<void> => {

            this.setState({
                mother: await window.electronAPI.readGenotype(this.props.motherId),
                father: await window.electronAPI.readGenotype(this.props.fatherId),
                genotypes: await window.electronAPI.getGenotypes(),
            });
            

            // auto-populate child UID, with mother and father UID fields
            this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
                if(state.mother === undefined || state.father === undefined || state.genotypes === undefined) {
                    return state;
                }

                const newChild = {
                    uid: String(state.genotypes.size + 1),
                    fields: state.mother.fields.map((field: Field): Field => {
                        let newData = '';
                        if(field.label === 'mother') {
                            newData = this.props.motherId;
                        } else if(field.label === 'father') {
                            newData = this.props.fatherId;
                        }
                        return {
                            label: field.label,
                            data: newData,
                        };
                    }),
                    tanks: [],
                }

                const newState: State = {
                    child: newChild,
                    mother: state.mother,
                    father: state.father,
                    genotypes: state.genotypes,
                    invalidUID: state.invalidUID,
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
                genotypes: state.genotypes,
                invalidUID: state.invalidUID,
            };
        });
    }

    private saveUID(uid: string): void {
        this.setState((state: Readonly<State>): Readonly<State> => {
            if(state.child === undefined) {
                return state;
            }

            const child: Genotype = {
                uid: uid,
                fields: state.child.fields,
                tanks: state.child.tanks,
            }
            
            return {
                child: child,
                mother: state.mother,
                father: state.father,
                genotypes: state.genotypes,
                invalidUID: state.invalidUID,
            }
        });
        

    }


    /**
     * Saves child Genotype back to database, checking if the UID is valid. TODO: close current tab and open genotype tab
     */
    private saveGenotype(): void {
        if(this.state.child === undefined || this.state.child.uid === undefined || Number.isNaN(Number.parseInt(this.state.child.uid))) {
            this.setState({invalidUID: INVALID_UID_MESSAGE})
            return;
        } else if(this.state.genotypes?.has(this.state.child.uid.trim())) {
            this.setState({invalidUID: TAKEN_UID_MESSAGE})
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
                        uid: state.child.uid.trim(),
                        fields: [],
                        tanks: state.child.tanks,
                    },
                    mother: state.mother,
                    father: state.father,
                    genotypes: state.genotypes,
                    invalidUID: state.invalidUID,
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
        }).then((): void => {
            // close the crossing table and open the new child Genotype's page
            if(this.state.child !== undefined) {
                this.props.crossingPage.jumpToID(this.state.child.uid)
            }
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
            <Th></Th>,
            <Th> Mother </Th>,
            <Th> Father </Th>,
            <Th> Child </Th>,
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
                <Td>
                {/* 
                    // TODO: should tanks be able to be edited here?
                    <Textarea value={ '' } rows={ 1 } 
                            onChange={ (e): void => {  } }
                    />
                */}
                </Td>
            </Tr>,
        ];
    }

    private fieldsToJSX(fields: Field[]): JSX.Element[] {
        return fields.filter((value: Field): boolean => {
            return value.label.toString().trim().length > 0;
        }).map((field: Field, i: number): JSX.Element => {
            return (
                <Tr key={ i }>
                    <Td key='label'>{ field.label }</Td>
                    <Td key='mother data'>{ this.props.jumpController.embedJumps(field.data.toString()) }</Td>
                    <Td key='father data'>{ this.props.jumpController.embedJumps(this.state.father?.fields[i].data.toString() as string) }</Td>
                    <Td key='child data'>
                        { 
                            <Textarea value={ this.state.child?.fields[i].data } rows={ 1 } 
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
                    { 'done' }
                </Button>
                <Modal onClose={ (): void => { this.setState({invalidUID: ''}) } } isOpen={ this.state.invalidUID !== '' }>
                <ModalOverlay />
                    <ModalContent>
                    <ModalHeader>Error: Invalid UID</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        { this.state.invalidUID }
                    </ModalBody>
                    </ModalContent>
                </Modal>
            </Stack>
        );
    }


    override render(): JSX.Element {
        if(this.state?.mother !== undefined) {
            return this.generateJSX(this.state.mother.fields);
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default CrossingTable