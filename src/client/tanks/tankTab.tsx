import React from 'react';
import Maps from './maps';
import TankViewer from './tankViewer';

interface Props {
    state: State,
    tabIndex: number,
    archiveState: (tabIndex: number, tabState: State) => void,
}

interface State {
    tankSelected: boolean,
    tankRow: number,
    tankCol: number,
}

/**
 * This class represents a single tab in the tank page.
 */
class TankTab extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = props.state;
        this.selectTank = this.selectTank.bind(this);
    }

    componentWillUnmount(): void {
        this.props.archiveState(this.props.tabIndex, this.state);
    }

    selectTank(row: number, col: number): void {
        this.setState({
            tankSelected: true,
            tankRow: row,
            tankCol: col,
        });
    }

    render(): JSX.Element {
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
export type {State as TankState}
