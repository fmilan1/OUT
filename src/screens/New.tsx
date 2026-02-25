import { useEffect, useState } from 'react';
import styles from '../styles/New.module.scss';
import { useLocation, useNavigate } from 'react-router';
import { uid } from 'uid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Player, Team } from './Home';

export default function New() {

    const { state } = useLocation();
    const navigate = useNavigate();

    const [team, _] = useState<Team>(state.team);
    const [players, _setPlayers] = useState<Player[]>(state.team.players);
    const [loanPlayers, setLoanPlayers] = useState<Player[]>([]);

    const [opponentName, setOpponentName] = useState<string>('');

    const [savedStats, setSavedStats] = useState<{ modified: number, id: string, teamId: string, opponentName: string, startingWithGirlsRatio: boolean, scorers: { assist: number, goal: number, isOurScore: boolean }[] }[]>([]);

    const [assistDic, setAssistDic] = useState<{ [key: string]: number }>({});
    const [goalDic, setGoalDic] = useState<{ [key: string]: number }>({});

    const [tablePlayers, setTablePlayers] = useState<Player[]>([]);

    const [showRatioOptions, setShowRatioOptions] = useState(false);
    const [isGirlRatio, setIsGirlRatio] = useState(true)

    const [collapsePlayers, setCollapsePlayers] = useState(false);
    const [newLoanPlayer, setNewLoanPlayer] = useState(false);
    const [newLoanPlayerName, setNewLoanPlayerName] = useState('');
    const [newLoanPlayerNumber, setNewLoanPlayerNumber] = useState<number>(-1);

    useEffect(() => {
        const storageStats: { modified: number, id: string, teamId: string, opponentName: string, startingWithGirlsRatio: boolean, scorers: { assist: number, goal: number, isOurScore: boolean }[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
        const filtered = storageStats.filter(s => s.teamId === team.id);
        setSavedStats(filtered);

        async function fetchLoanPlayers() {
            const loanPlayersRef = collection(db, 'users', state.userId, 'teams', team.id, 'loanPlayers');
            const loanPlayersSnap = await getDocs(loanPlayersRef);
            const loanPlayersData = loanPlayersSnap.docs.map(p => ({
                name: p.get('name') as string,
                number: parseInt(p.id),
            }));
            setLoanPlayers(loanPlayersData);
        }
        fetchLoanPlayers();

        async function fetchStats() {
            const statsRef = collection(db, 'users', state.userId, 'teams', team.id, 'stats');
            const statsSnap = await getDocs(statsRef);
            const statsData = statsSnap.docs.map(s => ({
                id: s.id,
                modified: s.get('modified'),
                scorers: s.get('scorers'),
                opponentName: s.get('opponentName'),
                teamId: team.id,
                startingWithGirlsRatio: s.get('startingWithGirlsRatio'),
            }));

            setSavedStats([]);
            statsData.forEach(async s => {
                const storageStat = filtered.find(storage => s.id === storage.id);

                if (storageStat && storageStat.modified > s.modified) {
                    setSavedStats(prev => { return [...prev, storageStat] });
                }
                else {
                    setSavedStats(prev => { return [...prev, s] });
                }
            })
        }

        fetchStats();

    }, []);

    useEffect(() => {
        localStorage.setItem('stats', JSON.stringify(savedStats));

        let playerList: Player[] = [];
        let ad: { [key: number]: number } = {};
        let gd: { [key: number]: number } = {};
        savedStats.forEach(s => {
            s.scorers.forEach(sc => {
                if (sc.assist !== -1 && sc.goal !== -1) {
                    const tmp = players.concat(loanPlayers);
                    if (!playerList.find(p => p.number === sc.goal)) {
                        playerList.push({ number: sc.goal, name: tmp.find(pl => pl.number === sc.goal)?.name ?? '-' });
                    }
                    if (!playerList.find(p => p.number === sc.assist)) {
                        playerList.push({ number: sc.assist, name: tmp.find(pl => pl.number === sc.assist)?.name ?? '-' });
                    }
                }
            });
        });
        playerList.forEach(p => {
            savedStats.forEach(s => {
                const goals = s.scorers.filter(sc => p.number === sc.goal).length;
                const assists = s.scorers.filter(sc => p.number === sc.assist && sc.assist !== sc.goal).length;
                gd[p.number] ? gd[p.number] += goals : gd[p.number] = goals;
                ad[p.number] ? ad[p.number] += assists : ad[p.number] = assists;
            });
        });
        setTablePlayers(playerList);
        setAssistDic(ad);
        setGoalDic(gd);
    }, [savedStats])

    return (
        <div
            className={styles.container}
        >
            <div>
                <h1>{team.name}</h1>
                <h2>{team.tournament}</h2>
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <h2
                    onClick={() => setCollapsePlayers(!collapsePlayers)}
                    style={{
                        cursor: 'pointer',
                    }}
                >Játékosok</h2>
                <FontAwesomeIcon
                    icon={collapsePlayers ? faCaretDown : faCaretUp}
                    onClick={() => setCollapsePlayers(!collapsePlayers)}
                    style={{
                        cursor: 'pointer',
                        position: 'relative',
                        top: 2,
                    }}
                />
            </div>
            {!collapsePlayers &&
                <>
                    {players.sort((a, b) => a.number - b.number).map((player, index) => (
                        <div
                            key={index}
                            className={`${styles.player} player`}
                            onClick={() => { navigate('/player', { state: { player, stats: savedStats } }) }}
                        >
                            <span>{player.number}</span>
                            <span>{player.name}</span>
                        </div>
                    ))}
                    {loanPlayers?.length > 0 &&
                        <>
                            <h3>Kölcsönjátékosok</h3>
                            {loanPlayers.sort((a, b) => a.number - b.number).map((player, index) => (
                                <div
                                    key={index}
                                    className={`${styles.player} player`}
                                    onClick={() => { navigate('/player', { state: { player, stats: savedStats } }) }}
                                >
                                    <span>{player.number}</span>
                                    <span>{player.name}</span>
                                    <FontAwesomeIcon
                                        icon={faXmark}
                                        className={styles.XmarkLoanPlayer}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const loanPlayerRef = doc(db, 'users', state.userId, 'teams', team.id, 'loanPlayers', `${player.number}`);
                                            setLoanPlayers(prev => {
                                                let tmp = [];
                                                tmp = prev.filter(p => p.number != player.number);
                                                return [...tmp];
                                            });
                                            await deleteDoc(loanPlayerRef);
                                        }}
                                    />
                                </div>
                            ))}
                        </>
                    }
                    <button
                        className='button'
                        onClick={() => {
                            setNewLoanPlayer(!newLoanPlayer);
                        }}
                    >{!newLoanPlayer ? 'Kölcsönjátékos felvétele' : 'Mégsem'}</button>
                    {newLoanPlayer &&
                        <form
                            className='player'
                            style={{
                                marginTop: 15,
                            }}
                        >
                            <div
                                className={styles.newLoanPlayer}
                            >
                                <input
                                    required
                                    type='number'
                                    inputMode='numeric'
                                    onChange={(e) => setNewLoanPlayerNumber(e.target.value.length > 2 ? newLoanPlayerNumber : parseInt(e.target.value))}
                                    value={newLoanPlayerNumber < 0 ? '' : newLoanPlayerNumber}
                                    className={styles.input}
                                    onKeyDown={(e) => {
                                        if (!players.map(p => p.number).includes(newLoanPlayerNumber) && e.key === 'Enter') {
                                            const form = document.forms[0].elements[1] as HTMLInputElement;
                                            form.focus();
                                        }
                                    }}
                                />
                                <input
                                    className={styles.input}
                                    onChange={(e) => setNewLoanPlayerName(e.target.value)}
                                    value={newLoanPlayerName}
                                />
                                {newLoanPlayerNumber >= 0 && newLoanPlayerName !== '' &&
                                    <button
                                        className='button'
                                        onClick={async () => {
                                            setLoanPlayers([...loanPlayers, {
                                                name: newLoanPlayerName,
                                                number: newLoanPlayerNumber,
                                            }]);
                                            setNewLoanPlayerName('');
                                            setNewLoanPlayerNumber(-1);
                                            const firstInput = document.forms[0].elements[0] as HTMLInputElement;
                                            firstInput.focus();
                                            const newLoanPlayerRef = doc(db, 'users', state.userId, 'teams', team.id, 'loanPlayers', newLoanPlayerNumber.toString());
                                            await setDoc(newLoanPlayerRef, {
                                                name: newLoanPlayerName,
                                            })
                                        }}
                                        style={{ margin: 0 }}
                                    >Hozzáadás</button>
                                }
                            </div>
                        </form>
                    }
                </>
            }
            <h2>Ellenfél</h2>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (e.currentTarget.checkValidity()) {
                        const newUid = uid();
                        navigate('/stats', { state: { ...state, loanPlayers, opponentName: opponentName, id: newUid, isGirlRatio: showRatioOptions ? isGirlRatio : null } });
                        const statRef = doc(db, 'users', state.userId, 'teams', team.id, 'stats', newUid);
                        await setDoc(statRef, {
                            opponentName,
                            teamId: team.id,
                            scorers: [],
                            modified: Date.now(),
                            startingWithGirlsRatio: showRatioOptions ? isGirlRatio : null,
                        });
                    }

                    else e.currentTarget.reportValidity();
                }}
            >
                <input
                    required
                    type="text"
                    placeholder='Csapatnév'
                    onChange={(e) => setOpponentName(e.target.value)}
                />
                <div
                    className={styles.ratioContainer}
                >
                    <br />
                    <input
                        type='checkbox'
                        id='ratio-checkbox'
                        onChange={() => setShowRatioOptions(!showRatioOptions)}
                    />
                    <label htmlFor='ratio-checkbox'>Nemek arányának követése</label>
                    {showRatioOptions &&
                        <>
                            <h3>Kezdés</h3>
                            <input
                                type='radio'
                                id='girl'
                                name='ratio'
                                onChange={() => setIsGirlRatio(true)}
                                defaultChecked
                            />
                            <label htmlFor='girl'>3 fiú - 4 lány</label>
                            <br />
                            <input
                                type='radio'
                                id='boy'
                                name='ratio'
                                onChange={() => setIsGirlRatio(false)}
                            />
                            <label htmlFor='boy'>4 fiú - 3 lány</label>
                        </>
                    }
                </div>
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
                        {savedStats.sort((a, b) => b.modified - a.modified).map((stat, index) => (
                            <div
                                key={index}
                                className={styles.stat}
                                onClick={() => {
                                    navigate('/stats', { state: { ...state, loanPlayers, opponentName: stat.opponentName, id: stat.id, scorers: stat.scorers, isGirlRatio: stat.startingWithGirlsRatio } });
                                }}
                            >
                                <div
                                    className={styles.score}
                                >
                                    <div>
                                        {stat.scorers.filter(s => s.isOurScore).length}
                                    </div>
                                    <div>-</div>
                                    <div>
                                        {stat.scorers.filter(s => !s.isOurScore).length}
                                    </div>
                                </div>

                                <FontAwesomeIcon
                                    className={styles.icon}
                                    icon={faTrash}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        let stats: { modified: number, id: string, teamId: string, opponentName: string, startingWithGirlsRatio: boolean, scorers: { assist: number, goal: number, isOurScore: boolean }[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
                                        stats = stats.filter(s => s.id !== stat.id);
                                        localStorage.setItem('stats', JSON.stringify(stats));
                                        stats = stats.filter(s => s.teamId === team.id);
                                        setSavedStats(stats);
                                        await deleteDoc(doc(db, 'users', state.userId, 'teams', team.id, 'stats', stat.id));
                                    }}
                                />
                                <div
                                    className={styles.opponentName}
                                >{stat.opponentName}</div>
                            </div>
                        ))}
                    </div>
                    <h2>Kanadai táblázat</h2>
                    <table
                        className={styles.table}
                    >
                        <thead>
                            <tr>
                                <th>
                                    #
                                </th>
                                <th>
                                    Név
                                </th>
                                <th>
                                    Assziszt
                                </th>
                                <th>
                                    Pont
                                </th>
                                <th>
                                    Összesen
                                </th>
                            </tr>
                        </thead>
                        {
                            <tbody>
                                {
                                    tablePlayers.sort((a, b) =>
                                        ((goalDic[b.number] ?? 0) + (assistDic[b.number] ?? 0)) -
                                        ((goalDic[a.number] ?? 0) + (assistDic[a.number] ?? 0))
                                    ).map((tp, index) => (
                                        <tr key={index}>
                                            <td>{tp.number}</td>
                                            <td>{tp.name}</td>
                                            <td>{assistDic[tp.number]}</td>
                                            <td>{goalDic[tp.number]}</td>
                                            <td>{assistDic[tp.number] + goalDic[tp.number]}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        }
                    </table>
                </>
            }
        </div >
    )
}
