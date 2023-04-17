import React from "react";
import { Td, Text, Textarea, Tr } from '@chakra-ui/react';
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

    private generateJSX(fields: Field[]): JSX.Element {
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