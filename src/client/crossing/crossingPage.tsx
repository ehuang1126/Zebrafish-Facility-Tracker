import React from "react";
import JumpController from "../jumpController";
import CrossingTable from "./crossingTable";
import GenotypeSelector from "../genotype/genotypeSelector";

type Props = {
    jumpController: JumpController,
};

type State = {
    motherId?: string,
    fatherId?: string,
};

class CrossingPage extends React.Component<Props, State> {

    private selectParent(parent: number): (uid: string) => void {
        return (uid: string): void => {
            if(parent === 0) {
                this.setState((state: Readonly<State>): Readonly<State> => {                    
                    return {
                        motherId: uid,
                        fatherId: this.state.fatherId,
                    }
                });
            } else {
                this.setState((state: Readonly<State>): Readonly<State> => {                    
                    return {
                        motherId: this.state.motherId,
                        fatherId: uid,
                    }
                });
            }
        };
    }

    override render(): JSX.Element {
        if(this.state.motherId === undefined) {
            return <GenotypeSelector reportGenotype={ this.selectParent(0) } />
        }
        
        if(this.state.fatherId === undefined) {
            return <GenotypeSelector reportGenotype={ this.selectParent(1) } />
        }

        return <CrossingTable motherId = { this.state.motherId } fatherId = { this.state.fatherId } jumpController={ this.props.jumpController } />
    }

}

export default CrossingPage