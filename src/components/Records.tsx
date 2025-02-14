import styles from '../styles/Records.module.css';
import { useState } from "react";

interface Props {
    names: string[],
    numbers: number[],
    header: string,
    onScored: (assister: number, scorer: number) => void,
    onOpponentScored: () => void,
}

export default function Records(props: Props) {

    const [assister, setAssister] = useState<number>(-1);
    const [scorer, setScorer] = useState<number>(-1);

    const record = (name: string, number: number) => {
        return (
            <div
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
                    setAssister(-1);
                    setScorer(-1);
                    props.onScored(assister, scorer);
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
                    <div>
                        {props.header}
                    </div>
                </div>
                <div
                    className={styles.recordContainer}
                >
                    {props.names.map((name, index) => (
                        record(name, props.numbers[index])
                    ))}
                </div>
                {props.onOpponentScored &&
                    <div
                        className={styles.opponent}
                        onClick={() => props.onOpponentScored()}
                    >
                        Ellenfél szerzett pontot :(
                    </div>
                }
                {assister !== -1 && scorer !== -1 && contineuButton()}
            </div>
        </>
    )
}
