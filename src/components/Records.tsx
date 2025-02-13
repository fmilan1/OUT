import React from 'react';
import styles from '../styles/Records.module.css';
import { useState } from "react";

interface Props {
    names: string[],
    numbers: number[],
    header: string,
    onScored: (assister: string, scorer: string) => void,
    onOpponentScored?: (assister: string, scorer: string) => void,
}

export default function Records(props: Props) {

    const [assister, setAssister] = useState('');
    const [scorer, setScorer] = useState('');

    const record = (name, number) => {
        return (
            <div
                className={`${styles.record} ${number === assister || number === scorer ? styles.selected : ''}`}
                onClick={() => {
                    if (!assister) setAssister(number);
                    else if (!scorer) setScorer(number);
                    else {
                        setAssister(number);
                        setScorer('');
                    }
                }}
            >
                <span
                    className={styles.number}
                >
                    <span
                        className={styles.label}
                    > {assister === scorer && assister === number ? 'CALLAHAN' : number === assister ? 'ASSIST' : number === scorer ? 'GOAL' : ''}
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
                    setAssister('');
                    setScorer('');
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
                        record(name, props.numbers[index] || '-')
                    ))}
                </div>
                {props.onOpponentScored &&
                    <div
                        className={styles.opponent}
                        onClick={() => props.onOpponentScored('', '')}
                    >
                        Ellenfél szerzett pontot :(
                    </div>
                }
                {assister && scorer && contineuButton()}
            </div>
        </>
    )
}
