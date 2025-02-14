import { useLocation } from 'react-router';
import Records from '../components/Records';
import Table from '../components/Table';
import styles from '../styles/Stats.module.css';
import {
    useState,
    useEffect
} from "react";

export default function Stats() {

    const [players, setPlayers] = useState<{ name: string, number: number }[]>([]);

    const { state } = useLocation();

    useEffect(() => {
        setPlayers(state.players);
    });

    const [scorers, setScorers] = useState<{ assist: number, goal: number, nth: number, isOurScore: boolean }[]>([]);
    const [opponentScorers, setOpponenScorers] = useState<{ assist: number, goal: number, nth: number, isOurScore: boolean }[]>([]);

    function increaseScore(assister: number, scorer: number) {
        setScorers([...scorers, { assist: assister, goal: scorer, nth: scorers.length + opponentScorers.length, isOurScore: true }])
    }

    function increaseOpponentScore() {
        setOpponenScorers([...opponentScorers, { assist: -1, goal: -1, nth: scorers.length + opponentScorers.length, isOurScore: false }]);
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
                        onOpponentScored={increaseOpponentScore}
                        header={state.teamName}
                        names={players.map(p => p.name)}
                        numbers={players.map(p => p.number)}
                    />
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