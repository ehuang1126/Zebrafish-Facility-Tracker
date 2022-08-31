import { Text } from '@chakra-ui/react';
import TabsViewer from '../bases/tabsViewer';
import type { CellValue, Gene } from '../../server/database';

type Props = {
    uid: string,
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
        (async () => {
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
    protected override saveData(fieldNum: number, data: string): void {
        let checkedData: CellValue = data;

        // check if number
        if(data && data.trim().length > 0) {
            const parsedNum: number = Number(data);
            if(!Number.isNaN(parsedNum)) {
                checkedData = parsedNum;
            }
        }

        // save the data into state
        this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
            if(state.gene) {
                const gene: Gene = {
                    uid: state.gene.uid,
                    fields: Array.from(state.gene.fields),
                }
                gene.fields[fieldNum].data = checkedData;
                
                return {
                    gene: gene,
                    isEditing: state.isEditing,
                };
            } else {
                return state;
            }
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
        this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
            return {
                gene: state.gene,
                isEditing: !state.isEditing,
            }
        })
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
