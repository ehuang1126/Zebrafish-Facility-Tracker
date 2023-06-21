import React from "react";
import JumpController from "../jumpController";
import CrossingTable from "./crossingTable";
import GenotypeSelector from "../genotype/genotypeSelector";
import { Stack, Text } from "@chakra-ui/react";

type Props = {
    jumpController: JumpController,
};

type State = {
    motherId?: string,
    fatherId?: string,
};

class CrossingPage extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);   
        this.state = {
            motherId: undefined,
            fatherId: undefined,
        }
    }
    /**
     * Sets the selected parent ID to the selected uid.
     */
    private selectParent(parent: number): (uid: string) => void {
        return (uid: string): void => {
            if(parent === 0) {
                this.setState((state: Readonly<State>): Readonly<State> => {                    
                    return {
                        motherId: uid,
                        fatherId: state.fatherId,
                    }
                });
            } else {
                this.setState((state: Readonly<State>): Readonly<State> => {                    
                    return {
                        motherId: state.motherId,
                        fatherId: uid,
                    }
                });
            }
        };
    }

    override render(): JSX.Element {
        if(this.state.motherId === undefined) {
            return (<Stack>
                <Text fontSize={'x-large'} textColor={'blue'}>Please select a mother. </Text>
                <GenotypeSelector reportGenotype={ this.selectParent(0) } />
            </Stack>);
        }
        
        if(this.state.fatherId === undefined) {
            return (<Stack>
                <Text fontSize={'x-large'} textColor={'blue'}>Please select a father. </Text>
                <GenotypeSelector reportGenotype={ this.selectParent(1) } />
            </Stack>);
        }

        return (<CrossingTable motherId = { this.state.motherId } fatherId = { this.state.fatherId } jumpController={ this.props.jumpController } />);
    }

}

export default CrossingPage