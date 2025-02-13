import React, { useState, useEffect } from 'react';
import styles from '../styles/Table.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface Props {
    scorers: [{ assist: {}, goal: {}, nth: number }],
    opponentScorers: [{ assist: {}, goal: {}, nth: number }],
    teamName: string,
    opponentName?: string,
    onToggle: () => void,
}
export default function Table(props: Props) {

    const [order, setOrder] = useState([]);

    useEffect(() => {
        let o = [...props.scorers, ...props.opponentScorers];
        o.sort((a, b) => a.nth - b.nth);
        setOrder(o);
    });

    return (
        <div
            className={styles.container}
        >
            <div
                className={styles.close}
                onClick={props.onToggle}
            >
                <FontAwesomeIcon icon={faXmark} />

            </div>
            <table
                className={styles.table}
            >
                <tr>
                    <th colspan='2'>{props.teamName}</th>
                    {props.opponentName && <th colspan='2'>{props.opponentName}</th>}
                </tr>
                <tr>
                    <th>Assist</th>
                    <th>Goal</th>
                    {props.opponentName &&
                        <>
                            <th>Assist</th>
                            <th>Goal</th>
                        </>
                    }
                </tr>
                {(props.scorers || props.opponentScorers) &&
                    order.map((order, index) => (

                        <tr>
                            {order.isOurScore &&
                                <>
                                    <td>{order.assist === order.goal ? 'C' : order.assist}</td>
                                    <td>{order.goal}</td>
                                    {props.opponentName &&
                                        <>
                                            <td>-</td>
                                            <td>-</td>
                                        </>
                                    }
                                </>
                            }
                            {!order.isOurScore &&
                                <>
                                    <td>-</td>
                                    <td>-</td>
                                    {props.opponentName &&
                                        <>
                                            <td>{order.assist == order.goal ? 'C' : order.assist}</td>
                                            <td>{order.goal}</td>
                                        </>
                                    }
                                </>
                            }
                        </tr>
                    ))
                }
            </table>
        </div>
    )
}
