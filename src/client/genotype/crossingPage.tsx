import React from "react";
import { Genotype } from "../../server/database";
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
            child: undefined
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

    /**
     * Saves child Genotype back to database. 
     */
    private saveGenotype(): void {

    }
}

export default CrossingPage