import React from 'react';
import { Button, Text, Wrap } from '@chakra-ui/react';
import type { Genotype } from '../../server/database';

type Props = {
    reportGenotype: (uid: string) => void,
};

type State = {
    genotypes?: Map<string, Genotype>,
};

class GenotypeSelector extends React.Component<Props, State> {
    /**
     * Actually loads the genotypes from the database.
     */
    override componentDidMount() {
        (async (): Promise<void> => {
            this.setState({
                genotypes: await window.electronAPI.getGenotypes(),
            });
        })();
    }

    /**
     * Reports a genotype's uid as the selected item.
     */
    private selectGenotype(uid: string): void {
        window.electronAPI.readGenotype(uid)
                .then((genotype: (Genotype | undefined)): void => {
                    if(genotype !== undefined) {
                        this.props.reportGenotype(uid);
                    }
                });
    }

    override render(): JSX.Element {
        if(this.state?.genotypes !== undefined) {
            return (
                <Wrap>
                    { Array.from(this.state.genotypes.entries(),
                            ([uid, genotype]: [string, Genotype], i: number): JSX.Element => {
                        return (
                            <Button onClick={ (): void => { this.selectGenotype(uid) } } key={ i }>
                                <h2>genotype { `${ uid }` }</h2>
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

export default GenotypeSelector;
