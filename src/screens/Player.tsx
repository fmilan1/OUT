import { useEffect, useState } from "react";
import { useLocation } from "react-router"
import styles from '../styles/Player.module.scss';

export default function Player() {
    const { state } = useLocation();
    const [player, _setPlayer] = useState<{ name: string, number: number }>(state.player)
    const [stats, _setStat] = useState<[{ opponentName: string, scorers: [{ assist: number, goal: number }] }]>(state.stats);

    return (
        <div
            className={styles.container}
        >
            <div
                className={styles.row}
            >
                <h1>{player.name}</h1>
                <h1>#{player.number}</h1>
            </div>
            {stats.filter(s => s.scorers.find(s2 => s2.assist === player.number || s2.goal === player.number)).map((s, index) => (
                <table
                    key={index}
                    className={styles.table}
                >
                    <thead>
                        <tr>
                            <th colSpan={2}>{s.opponentName}</th>
                        </tr>
                        <tr>
                            <th>Assziszt</th>
                            <th>Pont</th>
                        </tr>
                    </thead>
                    <tbody>
                    {s.scorers.map((s2, index2) => (s2.assist === player.number || s2.goal === player.number) && (
                        <tr
                            key={index2}
                        >
                            {s2.assist === s2.goal ?
                                <td colSpan={2} className={styles.highlight}>CALLAHAN</td>
                                :
                                <>
                                    <td
                                        className={`${s2.assist === player.number ? styles.highlight : ''} `}
                                    >
                                        #{s2.assist}
                                    </td>
                                    <td
                                        className={`${s2.goal === player.number ? styles.highlight : ''}`}
                                    >
                                        #{s2.goal}
                                    </td>
                                </>
                            }
                        </tr>
                    ))}
                    </tbody>
                </table>
            ))}


        </div>
    )
}

