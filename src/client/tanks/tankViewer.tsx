import { Td, Text, Textarea, Tr } from '@chakra-ui/react';
import TabsViewer from '../bases/tabsViewer';
import type { CellValue, Tank, Location } from '../../server/database';
import JumpController from '../jumpController';

type Props = {
    uid: number,
    jumpController: JumpController,
};

type State = {
    tank?: Tank,
    locString?: string,
    isEditing: boolean,
};

/**
 * This class represents the visualizer for a single Tank's data.
 */
class TankViewer extends TabsViewer<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {
            tank: undefined,
            locString: undefined,
            isEditing: false,
        };
    }

    /**
     * returns the current state of this page's Tank object
     */
    getTank(): (Tank | undefined) {
        return this.state.tank;
    }
    
    /**
     * Actually loads the Tank data from the database.
     */
    override componentDidMount() {
        (async (): Promise<void> => {
            const tank: (Tank | undefined) = await window.electronAPI.readTank(this.props.uid);
            if(tank !== undefined) {
                this.setState({
                    tank: tank,
                    locString: TankViewer.locToString(tank.loc),
                });
            }
        })();
    }

    /**
     * Converts a location to a human-readable string.
     */
    private static locToString(loc: Location): string {
        return `${loc.rack}${loc.row}${loc.col}`;
    }

    /**
     * Saves the new tank UID into the current state.
     */
    private saveUID(uid: number): void {
        this.setState((state: Readonly<State>): Readonly<State> => ({
            tank: this.state.tank !== undefined ? {
                loc: this.state.tank.loc,
                gene: this.state.tank.gene,
                uid: uid,
                fields: this.state.tank.fields,
            } : undefined,
            isEditing: this.state.isEditing,
        }));
    }

    /**
     * Saves the new `locString` into the current state.
     */
    private saveLocString(locString: string): void {
        this.setState({ locString: locString, });
    }

    /**
     * Saves the new gene UID into the current state.
     */
    private saveGene(gene: string): void {
        this.setState((state: Readonly<State>): Readonly<State> => ({
            tank: this.state.tank !== undefined ? {
                loc: this.state.tank.loc,
                gene: gene,
                uid: this.state.tank.uid,
                fields: this.state.tank.fields,
            } : undefined,
            isEditing: this.state.isEditing,
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
        if(data && data.trim().length > 0) {
            const parsedNum: number = Number(data);
            if(!Number.isNaN(parsedNum)) {
                checkedData = parsedNum;
            }
        }

        // save the data into state
        this.setState((state: Readonly<State>): Readonly<State> => {
            if(state.tank === undefined) {
                return state;
            }

            const tank: Tank = {
                loc: state.tank.loc,
                gene: state.tank.gene,
                uid: state.tank.uid,
                fields: Array.from(state.tank.fields),
            }
            if(tank.fields[fieldNum] !== undefined) {
                tank.fields[fieldNum].data = checkedData;
            }
            
            return {
                tank: tank,
                locString: state.locString,
                isEditing: state.isEditing,
            };
        });
    }

    /**
     * This toggles between edit and view. Importantly, it also converts the
     * location back from `locString` and saves the Tank back to the database
     * when toggling back from edit.
     */
    protected override toggleEdit(): void {
        if(this.state.isEditing && this.state.tank !== undefined && this.state.locString !== undefined) {
            // convert `locString` back to a location
            const locStringPieces: (RegExpMatchArray | null) = this.state.locString.match(/^(\d+),?(\w+),?(\d+)$/);
            if(locStringPieces !== null) {
                // if the locString was properly formatted
                const loc: Location = {
                    rack: Number(locStringPieces[1]),
                    row: locStringPieces[2].toString(),
                    col: Number(locStringPieces[3]),
                };
                this.setState((state: Readonly<State>): Readonly<State> => {
                    return {
                        tank: this.state.tank !== undefined ? {
                            loc: loc,
                            gene: this.state.tank.gene,
                            uid: this.state.tank.uid,
                            fields: this.state.tank.fields,
                        } : undefined,
                        isEditing: this.state.isEditing,
                    }
                });
            }

            // write back to database
            window.electronAPI.writeTank(this.props.uid, this.state.tank);
        }
        // toggle `isEditing`
        this.setState({ isEditing: !this.state.isEditing, });
    }

    /**
     * Converts the Tank object's fields *other* than `fields` to JSX
     */
    protected override metadataToJSX(): JSX.Element[] {
        return [
            <Tr key='uid'>
                <Td>UID</Td>
                <Td>
                    { this.state.tank?.uid }
                </Td>
            </Tr>,
            <Tr key='loc'>
                <Td>Location</Td>
                <Td>
                    { this.state.isEditing ?
                        <Textarea value={ this.state.locString } rows={ 1 }
                                onChange={ (e): void => this.saveLocString(e.target.value) }
                        /> :
                        this.state.locString
                    }
                </Td>
            </Tr>,
            <Tr key='gene'>
                <Td>gene ID</Td>
                <Td>
                    { this.state.isEditing ?
                        <Textarea value={ this.state.tank?.gene } rows={ 1 }
                                onChange={ (e): void => this.saveGene(e.target.value) }
                        /> :
                        this.state.tank?.gene !== undefined ?
                                this.props.jumpController.embedJumps('\\G' + this.state.tank.gene) :
                                undefined
                    }
                </Td>
            </Tr>
        ];
    }

    override render(): JSX.Element {
        if(this.state?.tank !== undefined) {
            return this.generateJSX(this.state.isEditing, this.state.tank.fields);
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default TankViewer;
