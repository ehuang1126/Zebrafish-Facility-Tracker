import React from 'react';
import Header from './header.js';
import Landing from './landing.js';
import Tanks from './tanks.js';
import Genes from './genes.js';

import './view.css';

const Pages = {LANDING: 100,
               TANKS: 101,
               GENES: 102};

class View extends React.Component {
    constructor(props) {
        super(props);
        this.state = {page: Pages.LANDING};
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    handlePageChange(newPage) {
        this.setState({page: newPage});
    }

    render() {
        let page;
        if(this.state.page === Pages.LANDING) {
            page = <Landing />;
        } else if(this.state.page === Pages.TANKS) {
            page = <Tanks />;
        } else if(this.state.page === Pages.GENES) {
            page = <Genes />;
        } else {
            page = <div>View state error</div>;
        }

        return (
            <div id="view">
                <Header onPageChange={this.handlePageChange} />
                { page }
            </div>
        );
    }
}

export default View;
export { Pages };
