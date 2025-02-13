import React, { useState } from 'react';
import styles from '../styles/New.module.css';
import { useLocation, useNavigate } from 'react-router';

export default function New() {

    const { state } = useLocation();
    const navigate = useNavigate();

    const [opponentName, setOpponentName] = useState('');
    const [doOpponentScores, setDoOpponentScores] = useState(false);

    return (
        <div
            className={styles.container}
        >
            <h1>{state.teamName}</h1>
            <h2>Játékosok</h2>
            {state.players.map(player => (
                <div
                    className={styles.player}
                >
                    <span>{player.number}</span>
                    <span>{player.name}</span>
                </div>
            ))}
            <h2>Ellenfél</h2>
            <input type="text" placeHolder='Csapatnév' onChange={(e) => setOpponentName(e.target.value)} />
            <br />
            <div
                className={styles.opponentCheckboxContainer}
            >
                <label for='opponent'>Jegyzőkönyvelés</label>
                <input type="checkbox" id="opponent" onChange={() => setDoOpponentScores(!doOpponentScores)} />
            </div>
            <br />
            <button
                className='button'
                onClick={() => {
                    navigate('/stats', { state: { ...state, opponentName: doOpponentScores ? opponentName : null} });
                }}
            >Új jegyzőkönyv indítása</button>
        </div >
    )
}
