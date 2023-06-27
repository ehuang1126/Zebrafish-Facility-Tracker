import React from 'react';
import { Button, Input, InputGroup, InputRightElement, Stack, Text, Tooltip, Wrap } from '@chakra-ui/react';
import { FaSearch } from "react-icons/fa";
import type { Field, Genotype } from '../../server/database';

type Props = {
    reportGenotype: (uid: string) => void,
};

type State = {
    genotypes?: Map<string, Genotype>,
    filteredGenotypes?: Map<string, Genotype>,
};

class GenotypeSelector extends React.Component<Props, State> {
    /**
     * Actually loads the genotypes from the database.
     */
    override componentDidMount() {
        (async (): Promise<void> => {
            this.setState({
                genotypes: await window.electronAPI.getGenotypes(),
                filteredGenotypes: await window.electronAPI.getGenotypes(),
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

    /**
     * Filters the displayed genotypes. The current algorithm selects for any Genotypes that
     * contain all of the words in the query in at least one field. 
     */
    private filterGenotypes(query: string): void {
        if(query === '') {
            this.setState({
                filteredGenotypes: this.state.genotypes,
            })
            return;
        }
        let words: string[] = query.split(' ');
        this.setState((state: Readonly<State>): Readonly<State> => {
            if(state.genotypes === undefined) {
                return state;
            }
            let newGenotypes: Map<string, Genotype> = new Map();
            for(let [uid, genotype] of Array.from(state.genotypes.entries())) {
                if(newGenotypes.has(uid)) continue;
                let containsAllWords: boolean = true;
                for(let word of words) {
                    let fieldsContainWord: boolean = false
                    for(let field of genotype.fields) {
                        if(field.data.toString().toLowerCase().includes(word.toLowerCase())) fieldsContainWord = true;
                    }
                    if(!fieldsContainWord) containsAllWords = false;
                }
                if(containsAllWords) newGenotypes.set(uid, genotype);
            }
            return {
                genotypes: state.genotypes,
                filteredGenotypes: newGenotypes,
            };
        });
        
    }

    override render(): JSX.Element {
        if(this.state?.filteredGenotypes !== undefined) {
            return (
                <Stack>
                    <InputGroup>
                        <InputRightElement>
                            <FaSearch/>
                        </InputRightElement>
                        <Input placeholder='Search for a genotype' onChange={ (e): void => { this.filterGenotypes(e.target.value) } }/>
                    </InputGroup>
                    
                    <Wrap>
                        { Array.from(this.state.filteredGenotypes.entries(),
                                ([uid, genotype]: [string, Genotype], i: number): JSX.Element => {
                            return (
                                <Tooltip label={ genotype.fields.find((field: Field): boolean => { return field.label === 'fish' }) !== undefined ? 
                                genotype.fields.find((field: Field): boolean => { return field.label === 'fish' })?.data.toString() : genotype.uid } placement='bottom-end'>
                                    <Button onClick={ (): void => { this.selectGenotype(uid) } } key={ i }>
                                        <h2>genotype { `${ uid }` }</h2>
                                    </Button>
                                </Tooltip>
                                
                            );
                        }) }
                    </Wrap>
                </Stack>
                
            );
        } else {
            return <Text>loading</Text>;
        }
    }
}

export default GenotypeSelector;
