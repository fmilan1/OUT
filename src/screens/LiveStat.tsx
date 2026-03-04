import { collection, collectionGroup, getDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react"
import { db } from "../firebase";
import styles from '../styles/LiveStat.module.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong, faCaretLeft, faChevronLeft, faCross, faCrosshairs, faSkullCrossbones, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Player } from "./Home";
import { useNavigate } from "react-router";

export default function LiveStat() {
    const [id, _setId] = useState(window.location.search.replace('?', ''));
    const [teamId, _setTeamId] = useState('');
    const [scorers, setScorers] = useState<{ assist: number, goal: number, isOurScore: boolean }[]>([]);
    const [ended, setEnded] = useState(false);
    const [isGirlRatio, setIsGirlRatio] = useState();
    const [teamName, setTeamName] = useState('');
    const [opponentName, setOpponenTeamName] = useState('');
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        async function fetch() {
            const q = query(collectionGroup(db, 'stats'), where('id', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.docs.forEach(stat => {
                const unsubscribe = onSnapshot(stat.ref, async snap => {
                    if (stat.ref.parent.parent) {
                        const team = await getDoc(stat.ref.parent.parent);
                        setTeamName(team.get('name'));
                        _setTeamId(team.id);
                        const players = collection(db, team.ref.path, 'players');
                        const playersSnap = await getDocs(players);
                        const playersData = playersSnap.docs.map(p => ({
                            number: parseInt(p.id),
                            name: p.get('name'),
                        }));
                        setPlayers(playersData);
                    }
                    const scorersData = snap.data()?.scorers;
                    setScorers(scorersData);
                    setEnded(snap.data()?.ended);
                    const startingWithGirlsRatio = snap.data()?.startingWithGirlsRatio;
                    setIsGirlRatio(Math.floor((scorersData.length + 1) % 4 / 2) === 0 ? startingWithGirlsRatio : !startingWithGirlsRatio);
                    setOpponenTeamName(stat.get('opponentName'));
                });
                return () => {
                    unsubscribe();
                }
            });
        }
        fetch();
    }, []);

    const navigate = useNavigate();
    return (
        <>
            <div
                className={styles.crossBtn}
                onClick={() => {
                    navigate(`/live?${teamId}`)
                }}
            >
                <FontAwesomeIcon
                    icon={faChevronLeft}
                />
            </div>
            <div
                className={styles.container}
            >
                <div
                    className={styles.innerContainer}
                >
                    <div
                        className={styles.scoreContainer}
                    >
                        <span>{teamName}</span>
                        <div
                            className={styles.scores}
                        >
                            <h1>{scorers.filter(sc => sc.isOurScore).length}</h1>
                            <h1>:</h1>
                            <h1>{scorers.filter(sc => !sc.isOurScore).length}</h1>
                        </div>
                        <span>{opponentName}</span>
                        {!ended &&
                            <span
                                className={styles.ratio}
                            >
                                {isGirlRatio ? 'Lány pont' : 'Fiú pont'}
                            </span>
                        }
                        <span
                            className={styles.status}
                        >
                            {ended ? 'Vége' : 'Élő'}
                        </span>
                    </div>
                    <div
                        className={styles.rows}
                    >
                        {scorers.map((sc, index) => (
                            <div
                                key={index}
                                className={styles.row}
                            >
                                {sc.isOurScore &&
                                    <div
                                        className={styles.our}
                                    >
                                        {sc.assist !== sc.goal ?
                                            <div>#{sc.assist} {players.find(p => p.number === sc.assist)?.name}</div>
                                            :
                                            <div>CALLAHAN</div>
                                        }
                                        <FontAwesomeIcon
                                            icon={faArrowRightLong}
                                        />
                                        <div>#{sc.goal} {players.find(p => p.number === sc.goal)?.name}</div>
                                    </div>
                                }
                                <div
                                    className={styles.actualScore}
                                >
                                    <span>{scorers.filter((s, idx) => s.isOurScore && index >= idx).length}</span>
                                    <span> : </span>
                                    <span>{scorers.filter((s, idx) => !s.isOurScore && index >= idx).length}</span>
                                </div>
                                {!sc.isOurScore &&
                                    <div
                                        className={styles.opponent}
                                    >
                                        <span>Ellenfél szerzett pontot :(</span>
                                    </div>
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

