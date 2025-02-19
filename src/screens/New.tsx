import { useEffect, useState } from 'react';
import styles from '../styles/New.module.css';
import { useLocation, useNavigate } from 'react-router';
import { uid } from 'uid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function New() {

    const { state } = useLocation();
    const navigate = useNavigate();

    const [team, _] = useState<{ id: string, name: string, players: {name: string, number: number}[] }>(state.team);

    const [opponentName, setOpponentName] = useState<string>('');

    const [savedStats, setSavedStats] = useState<{ modified: number, id: string, teamId: string, opponentName: string, scorers: { name: string, number: number, isOurScore: boolean }[] }[]>([]);

    useEffect(() => {
        const storageStats: { modified: number, id: string, teamId: string, opponentName: string, scorers: { name: string, number: number, isOurScore: boolean }[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        const filtered = storageStats.filter(s => s.teamId === team.id);
        setSavedStats(filtered);
    }, []);

    return (
        <div
            className={styles.container}
        >
            <h1>{team.name}</h1>
            <h2>Játékosok</h2>
            {team.players.sort((a, b) => a.number - b.number).map((player, index)=> (
                <div
		    key={index}
                    className={`${styles.player} player`}
                >
		    <span>{player.number}</span>
		    <span>{player.name}</span>
                </div>
            ))}
	    <h2>Ellenfél</h2>
	    <form
		onSubmit={(e) => {
		    e.preventDefault();
		    if (e.currentTarget.checkValidity()) navigate('/stats', { state: { ...state, opponentName: opponentName ?? '', id: uid() } });
		    
		    else e.currentTarget.reportValidity();
		}}
	    >
		<input
		    required
		    type="text" 
		    placeholder='Csapatnév'
		    onChange={(e) => setOpponentName(e.target.value)}
		/>
		<br />
		<button
		    className='button'
		>Új jegyzőkönyv indítása</button>
	    </form>
            {savedStats.length > 0 &&
                <>
                    <h2
                        className={styles.h2}
                    >Legutóbbi jegyzőkönyvek</h2>
                    <div
                        className={styles.savedStatsContainer}
                    >
                        {savedStats.sort((a, b) => b.modified - a.modified).map((stat, index)=> (
                            <div
				key={index}
                                className={styles.stat}
                                onClick={() => {
                                    navigate('/stats', { state: { ...state, opponentName: stat.opponentName, id: stat.id } });
                                }}
                            >
                                <div
                                    className={styles.score}
                                >
                                    {stat.scorers.filter(s => s.isOurScore).length}
                                    <span>-</span>
                                    {stat.scorers.filter(s => !s.isOurScore).length}
                                </div>

                                <FontAwesomeIcon
                                    className={styles.icon}
                                    icon={faTrash}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        let stats: { modified: number, id: string, teamId: string, opponentName: string, scorers: { name: string, number: number, isOurScore: boolean }[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
                                        stats = stats.filter(s => s.id !== stat.id);
                                        localStorage.setItem('stats', JSON.stringify(stats));
					stats = stats.filter(s => s.teamId === team.id);
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
