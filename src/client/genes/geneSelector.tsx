import React from 'react';
import { Button, Text, Wrap } from '@chakra-ui/react';
import type { Gene } from '../../server/database';

type Props = {
    reportGene: (uid: string) => void,
};

type State = {
    genes?: Map<string, Gene>,
};

class GeneSelector extends React.Component<Props, State> {
    /**
     * Actually loads the genes from the database.
     */
    override componentDidMount() {
        (async (): Promise<void> => {
            this.setState({
                genes: await window.electronAPI.getGenes(),
            });
        })();
    }

    /**
     * Reports a gene's uid as the selected item.
     */
    private selectGene(uid: string): void {
        window.electronAPI.readGene(uid)
                .then((gene: (Gene | undefined)): void => {
                    if(gene !== undefined) {
                        this.props.reportGene(uid);
                    }
                });
    }

    override render(): JSX.Element {
        if(this.state?.genes !== undefined) {
            return (
                <Wrap>
                    { Array.from(this.state.genes.entries(),
                            ([uid, gene]: [string, Gene], i: number): JSX.Element => {
                        return (
                            <Button onClick={ (): void => { this.selectGene(uid) } } key={ i }>
                                <h2>gene { `${ uid }` }</h2>
                            </Button>
                        );
                    }) }
                </Wrap>
            );
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default GeneSelector;
