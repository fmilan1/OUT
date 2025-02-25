import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '../styles/Records.module.scss';
import { useState } from "react";
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface Props {
    players: { name: string, number: number }[],
    teamName: string,
    opponentName: string,
    onScored: (assister: number, scorer: number, isOurScore: boolean) => void,
}

export default function Records(props: Props) {

    const [assister, setAssister] = useState<number>(-Infinity);
    const [scorer, setScorer] = useState<number>(-Infinity);

    const record = (player: { name: string, number: number }, key: number) => {
        return (
            <div
                key={key}
                className={`${styles.record} ${player.number === assister || player.number === scorer ? styles.selected : ''}`}
                onClick={() => {
                    if (assister === -Infinity) setAssister(player.number);
                    else if (scorer === -Infinity) setScorer(player.number);
                    else {
                        setAssister(number);
                        setScorer(-Infinity);
                    }
                }}
            >
                <span
                    className={styles.number}
                >
                    <span
                        className={styles.label}
                    > {assister !== -1 && scorer !== -1 && assister === scorer && assister === player.number ? 'CALLAHAN' : player.number === assister ? 'ASSIST' : player.number === scorer ? 'GOAL' : ''}
                    </span>
                    {player.number}
                </span>

                <span
                    className={styles.name}
                >
                    {player.name}
                </span>
            </div>
        )
    }

    function contineuButton() {
        return (
            <div
                className={`${styles.button} ${styles.continueButton}`}
                onClick={() => {
                    setAssister(-Infinity);
                    setScorer(-Infinity);
                    props.onScored(assister, scorer, assister !== -1);
                }}
            >
                ✓
            </div>
        );
    }

    function backButton() {
        return (
            <div
                className={`${styles.button} ${styles.backButton}`}
                onClick={() => {
                    setAssister(-Infinity);
                    setScorer(-Infinity);
                }}
            >
                <FontAwesomeIcon
                    icon={faXmark}
                />
            </ div>
        )
    }

    return (
        <>
            <div
                className={styles.container}
            >
                <div
                    className={styles.header}
                >
                    <span>{props.teamName}</span>
                    <span>vs</span>
                    <span>{props.opponentName}</span>
                </div>
                <div
                    className={styles.recordContainer}
                >
                    {props.players.sort((a, b) => a.number - b.number).map((player, index) => (
                        record(player, index)
                    ))}
                </div>
                <div
                    className={`${styles.opponent} ${assister === -1 && scorer === -1 ? styles.selected : ''}`}
                    onClick={() => {
                        setAssister(-1);
                        setScorer(-1);
                    }}
                >
                    Ellenfél szerzett pontot :(
                </div>
                {assister >= -1 &&
                    <div
                        className={styles.buttons}
                    >
                        {scorer >= -1 &&
                            <>{contineuButton()}</>
                        }
                        <>{backButton()}</>
                    </div>
                }
            </div>
        </>
    )
}
