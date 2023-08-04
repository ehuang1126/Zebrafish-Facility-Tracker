import { Td, Text, Textarea, Tr } from '@chakra-ui/react';
import TabsViewer from '../bases/tabsViewer';
import type { CellValue, Tank, Location, Field } from '../../server/database';
import JumpController from '../jumpController';

type Props = {
    uid: number,
    jumpController: JumpController,
};

type State = {
    tank?: Tank,
    locString?: string,
    dobsString?: string,
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
            dobsString: undefined,
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
                    dobsString: TankViewer.dobsToString(tank.dobs),
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
     * Converts an array of Dates into a human-readable and machine-parseable string.
     */
    private static dobsToString(dobs: Date[]): string {
        return dobs.map((date: Date): string => {
            date = new Date(date);
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        }).join(',\n');
    }

    /**
     * Saves the new `locString` into the current state.
     */
    private saveLocString(locString: string): void {
        this.setState({ locString: locString, });
    }

    /**
     * Saves the new genotype UID into the current state.
     */
    private saveGenotype(genotypes: string): void {
        this.setState((state: Readonly<State>): Readonly<State> => ({
            tank: state.tank !== undefined ? {
                loc: state.tank.loc,
                genotypes: genotypes.replaceAll(' ', '').split(','), // parses by removing whitespace and splitting using commas
                dobs: state.tank.dobs,
                uid: state.tank.uid,
                fields: state.tank.fields,
            } : undefined,
            isEditing: state.isEditing,
        }));
    }

    /**
     * Saves the DOBs into the current state.
     */
    private saveDOBString(dobs: string): void {
        this.setState({dobsString: dobs});
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
                genotypes: state.tank.genotypes,
                dobs: state.tank.dobs,
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
        if(this.state.tank === undefined) {
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
        Promise.all(this.state.tank.fields.map((field: Field): Promise<string> => {
            if(!field.data) field.data = '';
            return this.props.jumpController.convertLocationJumpLink(field.data.toString());
        })).then((fields: string[]): void => {
            // TODO This improperly updates state without checking current state,
            // but I don't think there's a way to do it right.
            this.setState((state: Readonly<State>, props: Readonly<Props>): Readonly<State> => {
                if(state.tank === undefined) {
                    return state;
                }

                // deep-ish copy state
                const newState: State = {
                    tank: {
                        loc: state.tank.loc,
                        genotypes: state.tank.genotypes,
                        dobs: state.dobsString?.split(',').map((dob: string): Date => new Date(dob)) ?? [],
                        uid: state.tank.uid,
                        fields: [],
                    },
                    isEditing: !state.isEditing, // toggle editing
                    locString: state.locString,
                    dobsString: state.dobsString,
                };

                // I don't know why this is necessary
                newState.tank = newState.tank as Tank;

                // update state with parsed data
                for(let i = 0; i < fields.length; i++) {
                    newState.tank.fields.push({
                        label: state.tank.fields[i].label,
                        data: fields[i],
                    });
                }

                // read the location back into a Location object
                if(newState.locString !== undefined) {
                    // convert `locString` back to a location
                    const locStringPieces: (RegExpMatchArray | null) = newState.locString.match(/(\d+),?(\w+),?(\d+)$/);
                    if (locStringPieces !== null) {
                        // if the locString was properly formatted
                        const loc: Location = {
                            room: state.tank.loc.room,
                            rack: Number(locStringPieces[1]),
                            row: locStringPieces[2].toString().toUpperCase(),
                            col: Number(locStringPieces[3]),
                        };
                        newState.tank.loc = loc;
                    }

                    // write back to database
                    window.electronAPI.writeTank(props.uid, newState.tank);
                }

                return newState;
            });
        });
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
            <Tr key='genotypes'>
                <Td>genotype IDs</Td>
                <Td>
                    { this.state.isEditing ?
                        <Textarea value={ this.state.tank?.genotypes.toString() } rows={ 1 }
                                onChange={ (e): void => this.saveGenotype(e.target.value) }
                        /> :
                        this.state.tank?.genotypes !== undefined ?
                                this.state.tank.genotypes.map((genotype: string): JSX.Element[] => {
                                    return this.props.jumpController.embedJumps('\\G' + genotype)
                                }) :
                                undefined
                    }
                </Td>
            </Tr>,
            <Tr key='dobs'>
                <Td>DOB(s)</Td>
                <Td>
                    { this.state.isEditing ?
                        <Textarea value={ this.state.dobsString } onChange={ (e): void => this.saveDOBString(e.target.value) }/> 
                        :
                        this.state.tank?.dobs !== undefined ?
                                this.state.tank.dobs.map((date: Date): JSX.Element => <Text>{ new Date(date).toDateString() }</Text>)
                            :   undefined
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
