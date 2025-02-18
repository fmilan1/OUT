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
    const [scorers, setScorers] = useState<{ assist: number, goal: number, isOurScore: boolean }[]>([]);

    useEffect(() => {
        setPlayers(state.team.players);
    });
    
    useEffect(() => {
        const storageStats: { modified: number, teamId: string, id: string, scorers: { assist: number, goal: number, isOurScore: boolean }[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        let thisStorageStat = storageStats.find(s => s.id === state.id);
        setScorers(thisStorageStat?.scorers ?? []);

    }, []);

    useEffect(() => {
        saveStat();
    }, [scorers])

    function increaseScore(assister: number, scorer: number, isOurScore: boolean) {
	console.log(scorers);
        setScorers([...scorers, { assist: assister, goal: scorer, isOurScore }])
    }
    
    function saveStat() {
        let savedStats: { modified: number, teamId: string, id: string, opponentName: string, scorers: { assist: number, goal: number, isOurScore: boolean }[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        let filtered;
        if (!savedStats) savedStats = [{ modified: Date.now(), opponentName: state.opponentName, teamId: state.team.id, id: state.id, scorers }];
        else {
            filtered = savedStats.filter(s => s.id !== state.id);
            savedStats = [...filtered, { modified: Date.now(), opponentName: state.opponentName, teamId: state.team.id, id: state.id, scorers }]
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

    function deleteLast() {
	setScorers(prev => prev.slice(0, -1));
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
                    {scorers.filter(s => s.isOurScore).length}
                    <span>-</span>
                    {scorers.filter(s => !s.isOurScore).length}
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
                        teamName={state.team.name}
                        opponentName={state.opponentName}
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
		    onDeleteLast={deleteLast}
                />
            }
        </>
    );
}
