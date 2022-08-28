import React from 'react';
import Header from '../header/header';
import Landing from '../landing/landing';
import TanksPage from '../tanks/tanksPage';
import Genes from '../genes/genes';

import './view.css';

enum Pages {
    LANDING,
    TANKS,
    GENES,
}

interface Props {}

interface State {
    page: Pages,
}

/**
 * This class represents the entire window.
 */
class View extends React.Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props);
        this.state = {page: Pages.LANDING};
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    handlePageChange(newPage: Pages): void {
        this.setState({page: newPage});
    }

    render(): JSX.Element {
        let page: React.ReactElement;
        if(this.state.page === Pages.LANDING) {
            page = <Landing />;
        } else if(this.state.page === Pages.TANKS) {
            page = <TanksPage />;
        } else if(this.state.page === Pages.GENES) {
            page = <Genes />;
        } else {
            page = <div>View state error</div>;
        }

        return (
            <div id="view">
                <Header onPageChange={this.handlePageChange}
                        currentPage={this.state.page} />
                { page }
            </div>
        );
    }
}

export default View;
export { Pages };
