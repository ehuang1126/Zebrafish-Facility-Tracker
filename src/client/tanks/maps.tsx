import React from 'react';

interface Props {
    row: number,
    col: number,
    selectTank: (row: number, col: number) => void,
}

interface State {
    tankRow: number,
    tankCol: number,
}

class Maps extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            tankRow: this.props.row,
            tankCol: this.props.col,
        };
    }

    render() {
        return (
            <div>
                <div onClick={(): void => this.props.selectTank(1, 2)}>
                    <h2>select tank #1</h2>
                </div>
                <div onClick={(): void => this.props.selectTank(2, 2)}>
                    <h2>select tank #2</h2>
                </div>
                <div onClick={(): void => this.props.selectTank(3, 2)}>
                    <h2>select tank #3</h2>
                </div>
                <div onClick={(): void => this.props.selectTank(4, 2)}>
                    <h2>select tank #4</h2>
                </div>
            </div>
        );
    }
}

export default Maps;
