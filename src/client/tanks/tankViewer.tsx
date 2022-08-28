import React from 'react';
import type {Tank} from '../../server/database.js';

interface Props {
    row: number,
    col: number,
}

interface State {
    tank?: Tank,
}

/**
 * This class represents the visualizer for a single Tank's data. It expects
 * `props.row` and `props.col` to be the location Tank object it should show.
 */
class TankViewer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {tank: undefined};
    }

    /**
     * Actually loads the Tank data from the database.
     */
    componentDidMount() {
        (async () => {
            const tank: Tank = await window.electronAPI.readTank(this.props.row, this.props.col);
            this.setState({
                tank: tank,
            });
        })();
    }

    /**
     * Converts this tab's Tank object to JSX.
     */
    private generateJSX(): JSX.Element {
        if(this.state.tank) {
            const labels: JSX.Element[] = [];
            const data: JSX.Element[] = [];
            for(let i in this.state.tank.labels) {
                labels.push( <div key={i}>{ this.state.tank.labels[i] }</div> );
                data.push( <div key={i}>{ this.state.tank.data[i] }</div> );
            }

            // TODO replace all this
            return (
                <div style={ {
                    'flexGrow': '4',
                    'display': 'flex',
                    'flexDirection': 'row',
                } }>
                    <div style={ {
                        'flexGrow': '1',
                        'display': 'flex',
                        'flexDirection': 'column',
                        'alignItems': 'flex-end',
                        'gap': '0.3em',
                    } }>
                        <h3>labels</h3>
                        { labels }
                    </div>
                    <div style={ {'width': '2ch'} }/>
                    <div style={ {
                        'flexGrow': '1',
                        'display': 'flex',
                        'flexDirection': 'column',
                        'alignItems': 'flex-start',
                        'gap': '0.3em',
                    } }>
                        <h3>data</h3>
                        { data }
                    </div>
                </div>
            );
        } else {
            return <div />;
        }
    }

    render(): JSX.Element {
        return (
            <div style={ {'display': 'flex', 'flexDirection': 'row',} }>
                <div style={ {'flexGrow': '6'} } />
                { this.generateJSX() }
            </div>
        );
    }
}

export default TankViewer;
