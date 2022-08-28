import React from 'react';
import {Pages} from '../view/view';

import "./header.css";

interface Props {
    onPageChange: (newPage: Pages) => void,
    currentPage: Pages,
}

interface State {

}

class Header extends React.Component<Props, State> {
    changePage(newPage: number): () => void {
        return (): void => {
            this.props.onPageChange(newPage);
        };
    }

    render(): JSX.Element {
        return (
            <div id="header">
                <div className="button"
                     style={this.props.currentPage === Pages.LANDING ? {'background': 'turquoise'} : {}}
                     onClick={this.changePage(Pages.LANDING)}>
                    <h1>landing page</h1>
                </div>
                <h1>|</h1>
                <div className="button"
                     style={this.props.currentPage === Pages.TANKS ? {'background': 'turquoise'} : {}}
                     onClick={this.changePage(Pages.TANKS)}>
                    <h1>view tanks</h1>
                </div>
                <h1>|</h1>
                <div className="button"
                     style={this.props.currentPage === Pages.GENES ? {'background': 'turquoise'} : {}}
                     onClick={this.changePage(Pages.GENES)}>
                    <h1>gene data</h1>
                </div>
            </div>
        );
    }
}

export default Header;
