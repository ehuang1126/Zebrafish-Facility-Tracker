import { Td, Text, Tr } from '@chakra-ui/react';
import TabsViewer from '../bases/tabsViewer';
import type { CellValue, Field, Gene } from '../../server/database';
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
     * This toggles between edit and view. Importantly, it also saves the Gene
     * back to the database when toggling back from edit.
     */
    protected override toggleEdit(): void {
        if(this.state.gene === undefined) {
            return;
        }

        // TODO This improperly updates state without checking current state,
        // but I don't think there's a way to do it right.
        if(!this.state.isEditing) {
            this.setState({isEditing: true,});
            return;
        }

        // parses all the new fields for location-based jump links and collects
        // the converted results
        Promise.all(this.state.gene.fields.map((field: Field): Promise<string> => {
            return this.props.jumpController.convertLocationJumpLink(field.data.toString());
        })).then((fields: string[]): void => {
            // TODO This improperly updates state without checking current state,
            // but I don't think there's a way to do it right.
            this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
                if(state.gene === undefined) {
                    return state;
                }

                // deep-ish copy state
                const newState: State = {
                    gene: {
                        uid: state.gene.uid,
                        fields: [],
                        tanks: state.gene.tanks,
                    },
                    isEditing: !state.isEditing, // toggle editing
                };

                // I don't know why this is necessary
                newState.gene = newState.gene as Gene;

                // update state with parsed data
                for(let i = 0; i < fields.length; i++) {
                    newState.gene.fields.push({
                        label: state.gene.fields[i].label,
                        data: fields[i],
                    });
                }

                // write back to database
                window.electronAPI.writeGene(newState.gene);

                return newState;
            });
        });
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
