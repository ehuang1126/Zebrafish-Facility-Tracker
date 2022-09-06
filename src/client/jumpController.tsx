import { Link, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import View from "./view/view";
import type { Location, Tank } from '../server/database';

const CONTROL_SEQUENCES: RegExp = /(\\T.*?\b|\\G.*?\b)/;
const TANK_SEQUENCE: RegExp = /(\\T.*?\b)/;
const TANK_PIECES: RegExp = /^\\T(\d+),?(\w+),?(\d+)$/;

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
            // for each line
            <Text key={ i }> {
                line.split(CONTROL_SEQUENCES).map((match: string, j: number): ReactNode => {
                    // split the line around the control sequences, KEEPING the control sequences in
                    if(j % 2 !== 0) {
                        // odd indexed elements are the control sequences
                        if(match.charAt(1) === 'T') {
                            // tank jump link
                            return (
                                <Link key={ j } onClick={ (): void => {
                                    this.jumpToTank(Number(match.substring(2)));
                                } }>
                                    <u>
                                        tank id#{ match.substring(2) }
                                    </u>
                                </Link>
                            );
                        } else if(match.charAt(1) === 'G') {
                            // gene jump link
                            return (
                                <Link key={ j } onClick={ (): void => {
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

    /**
     * Parses a string and converts any jump link control sequences based on a
     * tank's location to the link based on the tank's uid
     */
    async convertLocationJumpLink(text: string): Promise<string> {
        const pieces: string[] = await Promise.all(text.split(TANK_SEQUENCE).map(
                async (match: string, i: number): Promise<string> => {
            if(i % 2 !== 0) {
                // convert the tank jump link sequence back to a location
                const locStringPieces: (RegExpMatchArray | null) = match.match(TANK_PIECES);
                if(locStringPieces !== null) {
                    // if the locString was properly formatted
                    const loc: Location = {
                        rack: Number(locStringPieces[1]),
                        row: locStringPieces[2].toString().toUpperCase(),
                        col: Number(locStringPieces[3]),
                    };
                    
                    // find the tank at that location
                    const tank: (Tank | undefined) = await window.electronAPI.findTank(loc);
                    return tank !== undefined ? ('\\T' + tank.uid.toString()) : match;
                }
            }
            return match;
        }));

        // concatenate the pieces together with no joining character
        return pieces.join('');
    }
}

export default JumpController;
