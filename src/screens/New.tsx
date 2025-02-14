import { useState } from 'react';
import styles from '../styles/New.module.css';
import { useLocation, useNavigate } from 'react-router';

export default function New() {

    const { state } = useLocation();
    const navigate = useNavigate();

    const [players, _] = useState<{name: string, number: number}[]>(state.players);

    const [opponentName, setOpponentName] = useState<string>('');

    return (
        <div
            className={styles.container}
        >
            <h1>{state.teamName}</h1>
            <h2>Játékosok</h2>
            {players.map(player => (
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
                    navigate('/stats', { state: { ...state, opponentName: opponentName ?? ''} });
                }}
            >Új jegyzőkönyv indítása</button>
        </div >
    )
}
