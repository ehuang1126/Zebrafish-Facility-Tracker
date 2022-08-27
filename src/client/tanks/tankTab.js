import React from 'react';
import ReactDOM from 'react-dom';
import Maps from './maps.js';
import TankViewer from './tankViewer.js';

/**
 * This class represents a single tab in the tank page.
 */
class TankTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = props.state;
        this.selectTank = this.selectTank.bind(this);
    }

    componentWillUnmount() {
        this.props.archiveState(this.props.tabIndex, this.state);
    }

    selectTank(row, col) {
        this.setState({
            tankSelected: true,
            tankRow: row,
            tankCol: col,
        });
    }

    render() {
        if(!this.state.tankSelected) {
            return <Maps selectTank={this.selectTank}
                         row={this.state.tankRow}
                         col={this.state.tankCol} />;
        } else {
            return <TankViewer row={this.state.tankRow}
                               col={this.state.tankCol} />;
        }
    }
}

export default TankTab;
