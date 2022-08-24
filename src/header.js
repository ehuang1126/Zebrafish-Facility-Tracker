import React from 'react';
import ReactDOM from 'react-dom';

import "./header.css";

class Header extends React.Component {
    render() {
        return (
            <div id="header">
                <div className="button">
                    <h1>landing page</h1>
                </div>
                <h1>|</h1>
                <div className="button">
                    <h1>view tanks</h1>
                </div>
                <h1>|</h1>
                <div className="button">
                    <h1>gene data</h1>
                </div>
            </div>
        );
    }
}

export default Header;
