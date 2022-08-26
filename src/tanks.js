import React from 'react';
import ReactDOM from 'react-dom';

class Tanks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {tankData: 0};
    }
    
    componentDidMount() {
        (async () => {
            this.setState({tankData: await window.electronAPI.readTank(1, 2)});
        })();
    }

    /**
     * Converts a Tank object (defined in src/database.js) to JSX.
     */
    tankToJSX(tank) {
        const tankRow: JSX.Element[] = [];
        for(let i = 0; i < tank['labels'].length; i++) {
            tankRow.push(
                <div className='row' key={i}>
                    {
                        tank['labels'][i] + ' ' + tank['data'][i]
                    }
                </div>
            );
        }
        return tankRow;
    }

    render() {
        if(this.state.tankData !== 0) {
            return (
                <div>
                    { this.tankToJSX(this.state.tankData) }
                </div>
            );
        } else {
            return (
                <div>
                    Tanks page no data yet
                </div>
            );
        }
    }
}

export default Tanks;
