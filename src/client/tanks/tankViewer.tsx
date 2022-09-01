import { Text } from '@chakra-ui/react';
import TabsViewer from '../bases/tabsViewer';
import type { CellValue, Tank } from '../../server/database';
import JumpController from '../jumpController';

type Props = {
    uid: number,
    jumpController: JumpController,
};

type State = {
    tank?: Tank,
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
            this.setState({
                tank: await window.electronAPI.readTank(this.props.uid),
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
                isEditing: state.isEditing,
            };
        });
    }

    /**
     * This toggles between edit and view. Importantly, it also saves back to
     * the database when toggling back from edit.
     */
    protected override toggleEdit(): void {
        if(this.state.isEditing && this.state.tank !== undefined) {
            window.electronAPI.writeTank(this.props.uid, this.state.tank);
        }
        this.setState({ isEditing: !this.state.isEditing, });
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
