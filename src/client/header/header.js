import React from 'react';
import ReactDOM from 'react-dom';
import { Pages } from '../view/view.js';

import "./header.css";

class Header extends React.Component {
    changePage(newPage) {
        return () => {
            this.props.onPageChange(newPage);
        };
    }

    render() {
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
