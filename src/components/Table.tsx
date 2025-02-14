import { useState, useEffect } from 'react';
import styles from '../styles/Table.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface Props {
    scorers: { assist: number, goal: number, nth: number, isOurScore: boolean }[],
    opponentScorers: { assist: number, goal: number, nth: number, isOurScore: boolean }[],
    teamName: string,
    opponentName?: string,
    onToggle: () => void,
}
export default function Table(props: Props) {

    const [order, setOrder] = useState<{ assist: number, goal: number, nth: number, isOurScore: boolean }[]>([]);

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
                    <th colSpan={4} >{props.teamName}</th>
                </tr>
                <tr>
                    <th colSpan={2}>Állás</th>
                    <th>Asszist</th>
                    <th>Pont</th>
                </tr>
                {(props.scorers || props.opponentScorers) &&
                    order.map((o) => (
                        <tr>
                            <td className={styles.small}>{order.filter(o1 => o1.isOurScore && o1.nth <= o.nth).length}</td>
                            <td className={styles.small}>{order.filter(o1 => !o1.isOurScore && o1.nth <= o.nth).length}</td>
                            {o.isOurScore &&
                                <>
                                    <td>{o.assist === o.goal ? 'C' : o.assist}</td>
                                    <td>{o.goal}</td>
                                </>
                            }
                            {!o.isOurScore &&
                                <>
                                    <td>-</td>
                                    <td>-</td>
                                </>
                            }
                        </tr>
                    ))
                }
            </table>
        </div>
    )
}
