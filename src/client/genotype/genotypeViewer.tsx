import { Td, Text, Tr } from '@chakra-ui/react';
import TabsViewer from '../bases/tabsViewer';
import type { CellValue, Field, Genotype } from '../../server/database';
import JumpController from '../jumpController';

type Props = {
    uid: string,
    jumpController: JumpController,
};

type State = {
    genotype?: Genotype,
    isEditing: boolean,
};

class GenotypeViewer extends TabsViewer<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            genotype: undefined,
            isEditing: false,
        };
    }

    /**
     * returns the current state of this page's Genotype object
     */
    getGenotype(): (Genotype | undefined) {
        return this.state.genotype;
    }

    /**
     * Actually loads the Tank data from the database.
     */
    override componentDidMount() {
        (async (): Promise<void> => {
            this.setState({
                genotype: await window.electronAPI.readGenotype(this.props.uid),
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
            if(state.genotype === undefined) {
                return state;
            }

            const genotype: Genotype = {
                uid: state.genotype.uid,
                fields: Array.from(state.genotype.fields),
                tanks: state.genotype.tanks,
            }
            if(genotype.fields[fieldNum] !== undefined) {
                genotype.fields[fieldNum].data = checkedData;
            }
            
            return {
                genotype: genotype,
                isEditing: state.isEditing,
            };
        });
    }

    /**
     * This toggles between edit and view. Importantly, it also saves the
     * Genotype back to the database when toggling back from edit.
     */
    protected override toggleEdit(): void {
        if(this.state.genotype === undefined) {
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
        Promise.all(this.state.genotype.fields.map((field: Field): Promise<string> => {
            if(!field.data) field.data = '';
            return this.props.jumpController.convertLocationJumpLink(field.data.toString());
        })).then((fields: string[]): void => {
            // TODO This improperly updates state without checking current state,
            // but I don't think there's a way to do it right.
            this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
                if(state.genotype === undefined) {
                    return state;
                }

                // deep-ish copy state
                const newState: State = {
                    genotype: {
                        uid: state.genotype.uid,
                        fields: [],
                        tanks: state.genotype.tanks,
                    },
                    isEditing: !state.isEditing, // toggle editing
                };

                // I don't know why this is necessary
                newState.genotype = newState.genotype as Genotype;

                // update state with parsed data
                for(let i = 0; i < fields.length; i++) {
                    newState.genotype.fields.push({
                        label: state.genotype.fields[i].label,
                        data: fields[i],
                    });
                }

                // write back to database
                window.electronAPI.writeGenotype(newState.genotype);

                return newState;
            });
        });
    }

    /**
     * Converts the Genotype object's fields *other* than `fields` to JSX
     */
    protected override metadataToJSX(): JSX.Element[] {
        if(this.state.genotype === undefined) {
            return [ <div>loading</div>, ];
        }

        return [
            <Tr key='uid'>
                <Td>UID</Td>
                <Td>
                    { this.state.genotype.uid }
                </Td>
            </Tr>,
            <Tr key='tanks'>
                <Td>tanks</Td>
                <Td>
                    { this.props.jumpController.embedJumps(this.state.genotype.tanks.map(
                            (uid: number): string => `\\T${uid}` ).join('\n'))
                    }
                </Td>
            </Tr>,
        ];
    }

    override render(): JSX.Element {
        if(this.state?.genotype !== undefined) {
            return this.generateJSX(this.state.isEditing, this.state.genotype.fields);
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default GenotypeViewer;
