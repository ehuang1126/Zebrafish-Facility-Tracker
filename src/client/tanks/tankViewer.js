import React from 'react';
import ReactDOM from 'react-dom';

/**
 * This class represents the visualizer for a single Tank's data. It expects
 * `props.row` and `props.col` to be the location Tank object it should show.
 */
class TankViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {tank: 0};
    }

    /**
     * Actually loads the Tank data from the database.
     */
    componentDidMount() {
        (async () => {
            this.setState({
                tank: await window.electronAPI.readTank(this.props.row, this.props.col)
            });
        })();
    }

    /**
     * Converts a Tank object (defined in src/server/database.js) to JSX.
     */
    #generateJSX(tank) {
        const labels = [];
        const data = [];
        for(let i in this.state.tank['labels']) {
            labels.push( <div key={i}>{ this.state.tank['labels'][i] }</div> );
            data  .push( <div key={i}>{ this.state.tank['data'][i] }</div> );
        }

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
    }

    render() {
        if(this.state.tank !== 0) {
            return (
                <div style={ {'display': 'flex', 'flexDirection': 'row',} }>
                    <div style={ {'flexGrow': '6'} } />
                    { this.#generateJSX() }
                </div>
            );
        }
    }
}

export default TankViewer;
