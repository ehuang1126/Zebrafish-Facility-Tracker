import React from 'react';
import ReactDOM from 'react-dom';

import './landing.css';

class Landing extends React.Component {
    render() {
        return (
            <div id="page">
                <div id="news-pane">
                    This is where the news goes.
                </div>
                <div id="warnings-pane">
                    This is where the warnings go.
                </div>
            </div>
        );
    }
}

export default Landing;
