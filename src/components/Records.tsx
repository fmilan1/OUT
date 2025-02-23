import styles from '../styles/Records.module.scss';
import { useState } from "react";

interface Props {
    names: string[],
    numbers: number[],
    teamName: string,
    opponentName: string,
    onScored: (assister: number, scorer: number, isOurScore: boolean) => void,
}

export default function Records(props: Props) {

    const [assister, setAssister] = useState<number>(-Infinity);
    const [scorer, setScorer] = useState<number>(-Infinity);

    const record = (name: string, number: number, key: string) => {
        return (
            <div
                key={key}
                className={`${styles.record} ${number === assister || number === scorer ? styles.selected : ''}`}
                onClick={() => {
                    if (assister === -1) setAssister(number);
                    else if (scorer === -1) setScorer(number);
                    else {
                        setAssister(number);
                        setScorer(-1);
                    }
                }}
            >
                <span
                    className={styles.number}
                >
                    <span
                        className={styles.label}
                    > {assister !== -1 && scorer !== -1 && assister === scorer && assister === number ? 'CALLAHAN' : number === assister ? 'ASSIST' : number === scorer ? 'GOAL' : ''}
                    </span>
                    {number}
                </span>

                <span
                    className={styles.name}
                >
                    {name}
                </span>
            </div>
        )
    }

    const contineuButton = () => {
        return (
            <div
                className={styles.continueButton}
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
                    {props.names.map((name, index) => (
                        record(name, props.numbers[index], index.toString())
                    ))}
                </div>
                <div
                    className={`${styles.opponent} ${assister === -1 && scorer === -1 ? styles.selected : ''}`}
                    //onClick={() => props.onScored(assister, scorer, false)}
                    onClick={() => {
                        setAssister(-1);
                        setScorer(-1);
                    }}
                >
                    Ellenfél szerzett pontot :(
                </div>
                {assister >= -1 && contineuButton()}
            </div>
        </>
    )
}
