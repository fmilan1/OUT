import styles from '../styles/Table.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface Props {
    scorers: { assist: number, goal: number, isOurScore: boolean }[],
    teamName: string,
    opponentName?: string,
    onToggle: () => void,
    onDeleteLast: () => void,
    ended: boolean,
}
export default function Table(props: Props) {

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
                <thead>
                    <tr>
                        <th colSpan={4} >{props.teamName} <span className={styles.gray}>vs {props.opponentName}</span></th>
                    </tr>
                    <tr>
                        <th colSpan={2}>Állás</th>
                        <th>Assziszt</th>
                        <th>Pont</th>
                    </tr>
                </thead>
                <tbody>
                    {(props.scorers) &&
                        props.scorers.map((s, index) => (
                            <tr
                                key={index}
                            >
                                <td className={`${styles.small} ${!s.isOurScore && styles.gray}`}>{props.scorers.filter((s1, index1) => s1.isOurScore && index >= index1).length}</td>
                                <td className={`${styles.small} ${s.isOurScore && styles.gray}`}>{props.scorers.filter((s1, index1) => !s1.isOurScore && index >= index1).length}</td>
                                {s.isOurScore &&
                                    <>
                                        <td>{s.assist === s.goal ? 'C' : s.assist}</td>
                                        <td>{s.goal}</td>
                                    </>
                                }
                                {!s.isOurScore &&
                                    <td colSpan={2}>-</td>
                                }
                            </tr>
                        ))
                    }
                </tbody>
                <tfoot>
                    {!props.ended && props.scorers.length > 0 &&
                        <tr>
                            <td
                                className={styles.delete}
                                colSpan={4}
                                onClick={props.onDeleteLast}
                            >
                                Visszavonás
                            </td>
                        </tr>
                    }
                </tfoot>
            </table>
        </div>
    )
}
