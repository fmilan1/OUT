import { useEffect, useState } from 'react';
import styles from '../styles/New.module.css';
import { useLocation, useNavigate } from 'react-router';
import { uid } from 'uid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function New() {

    const { state } = useLocation();
    const navigate = useNavigate();

    const [team, _] = useState<{ id: string, name: string, players: { name: string, number: number }[] }>(state.team);

    const [opponentName, setOpponentName] = useState<string>('');

    const [savedStats, setSavedStats] = useState<{ modified: number, id: string, teamId: string, opponentName: string, scorers: {}[], opponentScorers: {}[] }[]>([]);

    useEffect(() => {
        const storageStats: { modified: number, id: string, teamId: string, opponentName: string, scorers: {}[], opponentScorers: {}[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        const filtered = storageStats.filter(s => s.teamId === team.id);
        setSavedStats(filtered);
    }, []);

    return (
        <div
            className={styles.container}
        >
            <h1>{team.name}</h1>
            <h2>Játékosok</h2>
            {team.players.map(player => (
                <div
                    className={styles.player}
                >
                    <span>{player.number}</span>
                    <span>{player.name}</span>
                </div>
            ))}
            <h2>Ellenfél</h2>
            <input type="text" placeholder='Csapatnév' onChange={(e) => setOpponentName(e.target.value)} />
            <br />
            <br />
            <button
                className='button'
                onClick={() => {
                    navigate('/stats', { state: { ...state, opponentName: opponentName ?? '', id: uid() } });
                }}
            >Új jegyzőkönyv indítása</button>
            {savedStats.length > 0 &&
                <>
                    <h2
                        className={styles.h2}
                    >Legutóbbi jegyzőkönyvek</h2>
                    <div
                        className={styles.savedStatsContainer}
                    >
                        {savedStats.sort((a, b) => b.modified - a.modified).map(stat => (
                            <div
                                className={styles.stat}
                                onClick={(e) => {
                                    navigate('/stats', { state: { ...state, opponentName: stat.opponentName, id: stat.id } });
                                }}
                            >
                                <div
                                    className={styles.score}
                                >
                                    {stat.scorers.length}
                                    <span>-</span>
                                    {stat.opponentScorers.length}
                                </div>

                                <FontAwesomeIcon
                                    className={styles.icon}
                                    icon={faTrash}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        let stats: { modified: number, id: string, teamId: string, opponentName: string, scorers: {}[], opponentScorers: {}[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
                                        stats = stats.filter(s => s.id !== stat.id);
                                        localStorage.setItem('stats', JSON.stringify(stats));
                                        setSavedStats(stats);
                                    }}
                                />
                                <div
                                    className={styles.opponentName}
                                >{stat.opponentName}</div>
                            </div>
                        ))}
                    </div>
                </>
            }
        </div >
    )
}
