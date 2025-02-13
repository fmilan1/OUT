import { useLocation } from 'react-router';
import Records from '../components/Records';
import Table from '../components/Table';
import styles from '../styles/Stats.module.css';
import {
    useState,
    useEffect
} from "react";
import React from 'react';

export default function Stats() {

    const [players, setPlayers] = useState([]);

    const { state } = useLocation();

    useEffect(() => {
        setPlayers(state.players);
    });

    const [scorers, setScorers] = useState([]);
    const [opponentScorers, setOpponenScorers] = useState([]);

    function increaseScore(assister, scorer) {
        setScorers(prev => {
            return [...prev, { assist: assister, goal: scorer, nth: scorers.length + opponentScorers.length, isOurScore: true }];
        })
    }
    
    function increaseOpponentScore(assister, scorer) {
        setOpponenScorers(prev => {
            return [...prev, { assist: assister, goal: scorer, nth: scorers.length + opponentScorers.length }];
        })
    }

    const [showTable, setShowTable] = useState(false);

    function toggleTable() {
        setShowTable(!showTable);
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    }

    return (
        <>
            <div
                className={styles.fullscreen}
                onClick={toggleFullscreen}
            >⛶</div>
            <div
                className={styles.container}
            >
                <div
                    className={styles.score}
                    onClick={toggleTable}
                >
                    {scorers.length}
                    <span>-</span>
                    {opponentScorers.length}
                </div>


                <div
                    className={styles.teamContainer}
                >
                    <div
                        className={styles.easterEgg}
                    >
                        hi :)
                    </div>

                    <Records
                        onScored={increaseScore}
                        onOpponentScored={!state.opponentName ? increaseOpponentScore : null}
                        header={state.teamName}
                        names={players.map(p => p.name)}
                        numbers={players.map(p => p.number)}
                    />
                    {state.opponentName &&
                        <Records
                            onScored={increaseOpponentScore}
                            header={state.opponentName}
                            names={players.map(p => p.name)}
                            numbers={players.map(p => p.number)}
                        />
                    }
                </div>
            </div>
            {showTable &&
                <Table
                    onToggle={() => setShowTable(!showTable)}
                    teamName={state.teamName}
                    opponentName={state.opponentName}
                    scorers={scorers}
                    opponentScorers={opponentScorers}
                />
                // <></>
            }
        </>
    );
}