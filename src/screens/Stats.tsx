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
    const [scorers, setScorers] = useState<{ assist: number, goal: number, nth: number, isOurScore: boolean }[]>([]);
    const [opponentScorers, setOpponenScorers] = useState<{ assist: number, goal: number, nth: number, isOurScore: boolean }[]>([]);

    useEffect(() => {
        setPlayers(state.team.players);
    });
    
    useEffect(() => {
        if (scorers.length + opponentScorers.length === 0) return;
        saveStat();
    }, [scorers, opponentScorers])

    useEffect(() => {
        const storageStats: { modified: number, teamId: string, id: string, scorers: { assist: number, goal: number, nth: number, isOurScore: boolean }[], opponentScorers: { assist: number, goal: number, nth: number, isOurScore: boolean }[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        let thisStorageStat = storageStats.find(s => s.id === state.id);
        setScorers(thisStorageStat?.scorers ?? []);
        setOpponenScorers(thisStorageStat?.opponentScorers ?? []);

    }, []);

    function increaseScore(assister: number, scorer: number) {
        setScorers([...scorers, { assist: assister, goal: scorer, nth: scorers.length + opponentScorers.length, isOurScore: true }])
    }
    
    function increaseOpponentScore() {
        setOpponenScorers([...opponentScorers, { assist: -1, goal: -1, nth: scorers.length + opponentScorers.length, isOurScore: false }]);
    }

    function saveStat() {
        let savedStats: { modified: number, teamId: string, id: string, opponentName: string, scorers: { assist: number, goal: number, nth: number, isOurScore: boolean }[], opponentScorers: { assist: number, goal: number, nth: number, isOurScore: boolean }[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        let filtered;
        if (!savedStats) savedStats = [{ modified: Date.now(), opponentName: state.opponentName, teamId: state.team.id, id: state.id, scorers, opponentScorers }];
        else {
            filtered = savedStats.filter(s => s.id !== state.id);
            savedStats = [...filtered, { modified: Date.now(), opponentName: state.opponentName, teamId: state.team.id, id: state.id, scorers, opponentScorers }]
        }
        localStorage.setItem('stats', JSON.stringify(savedStats));
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
                        header={state.team.name}
                        names={players.map(p => p.name)}
                        numbers={players.map(p => p.number)}
                    />
                </div>
            </div>
            {showTable &&
                <Table
                    onToggle={() => setShowTable(!showTable)}
                    teamName={state.team.name}
                    opponentName={state.opponentName}
                    scorers={scorers}
                    opponentScorers={opponentScorers}
                />
            }
        </>
    );
}