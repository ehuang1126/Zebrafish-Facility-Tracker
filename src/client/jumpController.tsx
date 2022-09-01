import { Link, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import View from "./view/view";

class JumpController {
    private view: View;
    private tankJumpHandler?: (uid: number) => void;
    private geneJumpHandler?: (uid: string) => void;

    constructor(view: View) {
        this.view = view;
        this.tankJumpHandler = undefined;
        this.geneJumpHandler = undefined;
    }

    /**
     * Registers a handler for a 'jump to Tank' event.
     */
    registerTankJumpHandler(handler: (uid: number) => void): void {
        this.tankJumpHandler = (uid: number): void => {
            this.view.setState({ currentTab: 1, });
            handler(uid);
        };
    }

    /**
     * Jumps to a certain tank page.
     */
    jumpToTank(uid: number): void {
        if(this.tankJumpHandler !== undefined) {
            this.tankJumpHandler(uid);
        }
    }

    /**
     * Registers a handler for a 'jump to Gene' event.
     */
    registerGeneJumpHandler(handler: (uid: string) => void): void {
        this.geneJumpHandler = (uid: string): void => {
            this.view.setState({ currentTab: 2, });
            handler(uid);
        };
    }

    /**
     * Jumps to a certain gene page.
     */
    jumpToGene(uid: string): void {
        if(this.geneJumpHandler !== undefined) {
            this.geneJumpHandler(uid);
        }
    }

    /**
     * Converts a string to a Text element while converting jump link control
     * sequences to actual jump links.
     */
    embedJumps(text: string): JSX.Element[] {
        return text.split(/\r?\n/).map((line: string, i: number): JSX.Element => (
            <Text key={ i }> {
                line.split(/(\\T.*\b|\\G.*\b)/).map((match: string, j: number): ReactNode => {
                    if(j % 2 !== 0) {
                        if(match.charAt(1) === 'T') {
                            return (
                                <Link onClick={ (): void => {
                                    this.jumpToTank(Number(match.substring(2)));
                                } }>
                                    <u>
                                        tank id#{ match.substring(2) }
                                    </u>
                                </Link>
                            );
                        } else if(match.charAt(1) === 'G') {
                            return (
                                <Link onClick={ (): void => {
                                    this.jumpToGene(match.substring(2));
                                } }>
                                    <u>
                                        gene id#{ match.substring(2) }
                                    </u>
                                </Link>
                            );
                        }
                    }
                    
                    // if it didn't match a tank or gene jump for some reason, just return the regular text
                    return match;
                })
            } </Text>
        ));
    }
}

export default JumpController;
