import React from 'react';
import { createRoot } from 'react-dom/client';
import Header from './header.js';
import Landing from './landing.js';

import './index.css';

const LANDING = 100;
const TANKS = 101;
const GENES = 102;

class View extends React.Component {
    constructor(props) {
        super(props);
        this.state = {page: LANDING};
    }

    render() {
        return (
            <div id="view">
                <Header />
                { // this is an if/else block
                    this.state.page === LANDING ?
                        <Landing />
                    : (this.state.page === TANKS ?
                        <Tanks />
                    : (this.state.page === GENES ?
                        <Genes />
                    : 
                        <div>View state error</div>
                    ))
                }
            </div>
        );
    }
}

const root = createRoot(document.getElementById('root'));
root.render(<View />);
