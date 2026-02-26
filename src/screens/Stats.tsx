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

export interface Stat {
    id: string,
    modified: number,
    opponentName: string,
    scorers: { assist: number, goal: number, isOurScore: boolean }[],
    teamId: string,
    ended: boolean,
    startingWithGirlsRatio: boolean,
}

export default function Stats() {

    const [players, setPlayers] = useState<Player[]>([]);
    const [loanPlayers, setLoanPlayers] = useState<Player[]>([]);

    const { state } = useLocation();
    const [scorers, setScorers] = useState<{ assist: number, goal: number, isOurScore: boolean }[]>([]);
    const [isGirlRatio, setIsGirlRatio] = useState(state.isGirlRatio);
    const [startingWithGirlsRatio, _setStartingWithGirlsRatio] = useState<boolean>(state.isGirlRatio)
    const [ended, setEnded] = useState(state.ended);

    useEffect(() => {
        setPlayers(state.team.players);
        setLoanPlayers(state.loanPlayers);
        const storageStats: Stat[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        let thisStat = storageStats.find(s => s.id === state.id);
        setEnded(thisStat?.ended ?? false);
        setScorers(thisStat?.scorers ?? []);
    }, []);

    useEffect(() => {
        if (state.isGirlRatio === null || state.isGirlRatio === undefined) return;
        setIsGirlRatio(Math.floor((scorers.length + 1) % 4 / 2) === 0 ? startingWithGirlsRatio : !startingWithGirlsRatio);
    }, [scorers]);

    useEffect(() => {
        if (!ended) return;
        async function update() {
            await saveStat(scorers);
            await updateDatabaseStat(scorers);
        }
        update();
    }, [ended]);

    async function increaseScore(assister: number, scorer: number, isOurScore: boolean) {
        let tmp = [...scorers, { assist: assister, goal: scorer, isOurScore }];
        setScorers(tmp)
        saveStat(tmp);
        await updateDatabaseStat(tmp);
    }

    async function saveStat(scorersList: { assist: number, goal: number, isOurScore: boolean }[]) {
        let savedStats: Stat[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        let filtered;
        if (!savedStats) savedStats = [{ modified: Date.now(), ended: ended, opponentName: state.opponentName, teamId: state.team.id, id: state.id, scorers: scorersList, startingWithGirlsRatio }];
        else {
            filtered = savedStats.filter(s => s.id !== state.id);
            savedStats = [...filtered, { modified: Date.now(), ended: ended, opponentName: state.opponentName, teamId: state.team.id, id: state.id, scorers: scorersList, startingWithGirlsRatio }]
        }
        localStorage.setItem('stats', JSON.stringify(savedStats));
    }

    async function updateDatabaseStat(scorersList: { assist: number, goal: number, isOurScore: boolean }[]) {
        await updateDoc(doc(db, 'users', state.userId, 'teams', state.team.id, 'stats', state.id), {
            modified: Date.now(),
            scorers: scorersList,
            ended,
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

                {!ended &&
                    <>
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
                        <div
                            className={styles.close}
                            onClick={() => {
                                if (confirm("Biztosan le akarja zárni a mérkőzést?") === true) {
                                    setEnded(true);
                                }
                            }}
                        >
                            Mérkőzés lezárása
                        </div>

                    </>
                }
                {ended &&
                    <h1>A mérkőzés lezárult.</h1>
                }
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
