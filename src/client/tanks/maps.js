import React from 'react';
import ReactDOM from 'react-dom';

class Maps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tankRow: this.props.row,
            tankCol: this.props.col,
        };
    }

    render() {
        return (
            <div>
                <div onClick={() => this.props.selectTank(1, 2)}>
                    <h2>select tank #1</h2>
                </div>
                <div onClick={() => this.props.selectTank(2, 2)}>
                    <h2>select tank #2</h2>
                </div>
                <div onClick={() => this.props.selectTank(3, 2)}>
                    <h2>select tank #3</h2>
                </div>
                <div onClick={() => this.props.selectTank(4, 2)}>
                    <h2>select tank #4</h2>
                </div>
            </div>
        );
    }
}

export default Maps;
