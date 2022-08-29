import React from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react';

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
            <ButtonGroup>
                <Button onClick={(): void => this.props.selectTank(1, 2)}>
                    <h2>tank #1</h2>
                </Button>
                <Button onClick={(): void => this.props.selectTank(2, 2)}>
                    <h2>tank #2</h2>
                </Button>
                <Button onClick={(): void => this.props.selectTank(3, 2)}>
                    <h2>tank #3</h2>
                </Button>
                <Button onClick={(): void => this.props.selectTank(4, 2)}>
                    <h2>tank #4</h2>
                </Button>
            </ButtonGroup>
        );
    }
}

export default Maps;
