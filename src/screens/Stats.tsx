import { useLocation } from 'react-router';
import Records from '../components/Records';
import Table from '../components/Table';
import styles from '../styles/Stats.module.scss';
import {
    useState,
    useEffect
} from "react";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Player } from './Home';

export default function Stats() {

    const [players, setPlayers] = useState<Player[]>([]);
    const [loanPlayers, setLoanPlayers] = useState<Player[]>([]);

    const { state } = useLocation();
    const [scorers, setScorers] = useState<{ assist: number, goal: number, isOurScore: boolean }[]>([]);
    const [isGirlRatio, setIsGirlRatio] = useState(state.isGirlRatio);
    const [startingWithGirlsRatio, _setStartingWithGirlsRatio] = useState<boolean>(state.isGirlRatio)

    useEffect(() => {
        setPlayers(state.team.players);
        setLoanPlayers(state.loanPlayers);
        const storageStats: { id: string, modified: number, opponentName: string, scorers: { assist: number, goal: number, isOurScore: boolean }[], teamId: string }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        let thisStat = storageStats.find(s => s.id === state.id);
        setScorers(thisStat?.scorers ?? []);
    }, []);

    useEffect(() => {
        if (state.isGirlRatio === null || state.isGirlRatio === undefined) return;
        setIsGirlRatio(Math.floor((scorers.length + 1) % 4 / 2) === 0 ? startingWithGirlsRatio : !startingWithGirlsRatio);
    }, [scorers]);

    async function increaseScore(assister: number, scorer: number, isOurScore: boolean) {
        let tmp = [...scorers, { assist: assister, goal: scorer, isOurScore }];
        setScorers(tmp)
        saveStat(tmp);
        await updateDatabaseStat(tmp);
    }

    async function saveStat(scorersList: { assist: number, goal: number, isOurScore: boolean }[]) {
        let savedStats: { modified: number, teamId: string, id: string, opponentName: string, startingWithGirlsRatio: boolean, scorers: { assist: number, goal: number, isOurScore: boolean }[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        let filtered;
        if (!savedStats) savedStats = [{ modified: Date.now(), opponentName: state.opponentName, teamId: state.team.id, id: state.id, scorers: scorersList, startingWithGirlsRatio }];
        else {
            filtered = savedStats.filter(s => s.id !== state.id);
            savedStats = [...filtered, { modified: Date.now(), opponentName: state.opponentName, teamId: state.team.id, id: state.id, scorers: scorersList, startingWithGirlsRatio }]
        }
        localStorage.setItem('stats', JSON.stringify(savedStats));
    }

    async function updateDatabaseStat(scorersList: { assist: number, goal: number, isOurScore: boolean }[]) {
        await updateDoc(doc(db, 'users', state.userId, 'teams', state.team.id, 'stats', state.id), {
            modified: Date.now(),
            scorers: scorersList,
        });
    }

    const [showTable, setShowTable] = useState(false);

    function toggleTable() {
        setShowTable(!showTable);
    }

    async function deleteLast() {
        let tmp = [...scorers];
        tmp = tmp.slice(0, -1)
        setScorers(tmp);
        saveStat(tmp);
        await updateDatabaseStat(tmp);
    }

    return (
        <>
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
                {isGirlRatio !== null && isGirlRatio !== undefined &&
                    <div
                        className={styles.ratio}
                    >
                        {isGirlRatio ?
                            <span>Lány pont</span>
                            :
                            <span>Fiú pont</span>
                        }
                    </div>
                }


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
                        players={players.concat(loanPlayers)}
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
