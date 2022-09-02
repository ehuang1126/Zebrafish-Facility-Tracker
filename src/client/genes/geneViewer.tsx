import { Td, Text, Tr } from '@chakra-ui/react';
import TabsViewer from '../bases/tabsViewer';
import type { CellValue, Gene } from '../../server/database';
import JumpController from '../jumpController';

type Props = {
    uid: string,
    jumpController: JumpController,
};

type State = {
    gene?: Gene,
    isEditing: boolean,
};

class GeneViewer extends TabsViewer<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            gene: undefined,
            isEditing: false,
        };
    }

    /**
     * returns the current state of this page's Gene object
     */
    getGene(): (Gene | undefined) {
        return this.state.gene;
    }

    /**
     * Actually loads the Tank data from the database.
     */
    override componentDidMount() {
        (async (): Promise<void> => {
            this.setState({
                gene: await window.electronAPI.readGene(this.props.uid),
            });
        })();
    }

    /**
     * Saves the new tank UID into the current state.
     */
    private saveUID(uid: string): void {
        this.setState((state: Readonly<State>): Readonly<State> => ({
            gene: state.gene !== undefined ? {
                uid: uid,
                fields: state.gene.fields,
                tanks: state.gene.tanks,
            } : undefined,
            isEditing: state.isEditing,
        }));
    }

    /**
     * saves the edited field into the current state
     * 
     * This attempts to guess if the input is a number.
     */
    protected override saveField(fieldNum: number, data: string): void {
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
            if(state.gene === undefined) {
                return state;
            }

            const gene: Gene = {
                uid: state.gene.uid,
                fields: Array.from(state.gene.fields),
                tanks: state.gene.tanks,
            }
            if(gene.fields[fieldNum] !== undefined) {
                gene.fields[fieldNum].data = checkedData;
            }
            
            return {
                gene: gene,
                isEditing: state.isEditing,
            };
        });
    }

    /**
     * This toggles between edit and view. Importantly, it also saves back to
     * the database when toggling back from edit.
     */
    protected override toggleEdit(): void {
        // send it back to the database
        if(this.state.isEditing && this.state.gene !== undefined) {
            window.electronAPI.writeGene(this.state.gene);
        }

        // toggle editing state
        this.setState((state: Readonly<State>): Readonly<State> => {
            return {
                gene: state.gene,
                isEditing: !state.isEditing,
            }
        })
    }

    /**
     * Converts the Gene object's fields *other* than `fields` to JSX
     */
    protected override metadataToJSX(): JSX.Element[] {
        if(this.state.gene === undefined) {
            return [ <div>loading</div>, ];
        }

        return [
            <Tr key='uid'>
                <Td>UID</Td>
                <Td>
                    { this.state.gene.uid }
                </Td>
            </Tr>,
            <Tr key='tanks'>
                <Td>tanks</Td>
                <Td>
                    { this.props.jumpController.embedJumps(this.state.gene.tanks.map(
                            (uid: number): string => `\\T${uid}` ).join('\n'))
                    }
                </Td>
            </Tr>,
        ];
    }

    override render(): JSX.Element {
        if(this.state?.gene !== undefined) {
            return this.generateJSX(this.state.isEditing, this.state.gene.fields);
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default GeneViewer;
