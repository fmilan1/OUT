import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import styles from '../styles/Edit.module.scss'
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Player, Team } from './Home';

export default function Edit() {

    const { state } = useLocation();
    const navigate = useNavigate();
    const [players, _setPlayers] = useState<Player[]>(state.players);

    const [team, setTeam] = useState<Team>(state.team);
    const [changed, setChanged] = useState(false);
    const [years, setYears] = useState<number[]>([]);
    const [year, setYear] = useState(team.year ?? 2025);

    useEffect(() => {
        let storageTeams: Team[] = JSON.parse(localStorage.getItem('teams') ?? '[]');
        let thisTeam = storageTeams.find(p => p.id === state.team.id);
        if (thisTeam) setTeam(thisTeam);
        for (let i = 2025; i <= new Date().getFullYear() + 1; i++) {
            setYears(prev => {
                let tmp = [...prev];
                tmp.push(i);
                return tmp;
            })
        }
    }, []);

    useEffect(() => {
        if (year === team.year) return;
        setChanged(true);
    }, [year]);

    useEffect(() => {
        if (JSON.stringify(team) === JSON.stringify(state.team)) return;
        setChanged(true);
    }, [team]);

    return (
        <div
            className={styles.container}
        >
            <h1>
                <input
                    className={styles.input}
                    type="text"
                    onChange={(e) => {
                        setTeam({ ...team, name: e.target.value });
                    }}
                    value={team.name}
                />
                <select id='years'
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    value={year}
                >
                    {years.map(y => (
                        <option
                            key={y}
                            value={y}
                        >{y}</option>
                    ))}
                </select>
            </h1>
            <button
                className={`${styles.delete} button`}
                onClick={async () => {

                    let savedTeams: { players: { name: string, number: number }[], name: string, id: string }[] = JSON.parse(localStorage.getItem('teams') ?? '');
                    let filtered;
                    if (!savedTeams) savedTeams = [team];
                    else {
                        filtered = savedTeams.filter(t => t.id !== team.id);
                        savedTeams = [...filtered];
                    }
                    localStorage.setItem('teams', JSON.stringify(savedTeams));
                    let savedStats: { modified: number, id: string, teamId: string, opponentName: string, scorers: {}[], opponentScorers: {}[] }[] = JSON.parse(localStorage.getItem('stats') ?? '[]');
                    savedStats = savedStats.filter(s => s.teamId !== team.id);
                    localStorage.setItem('stats', JSON.stringify(savedStats));
                    const teamRef = doc(db, 'users', state.userId, 'teams', team.id);
                    const playersRef = collection(db, teamRef.path, 'players');
                    const playersSnap = await getDocs(playersRef);
                    playersSnap.forEach(async p => {
                        await deleteDoc(p.ref);
                    });
                    const statsRef = collection(db, teamRef.path, 'stats');
                    const statsSnap = await getDocs(statsRef);
                    statsSnap.forEach(async s => {
                        await deleteDoc(s.ref);
                    });
                    await deleteDoc(teamRef);

                    navigate('/');
                }}
            >
                Csapat törlése
            </button>
            <h2>Játékosok</h2>
            {players.sort((a, b) => a.number - b.number).map((p, index) => (
                <div
                    key={index}
                    className={`${styles.player} ${team.players.filter(p1 => p1.number === p.number).length > 0 ? styles.teamPlayer : ''} player`}
                    onClick={() => {
                        if (team.players.filter(p1 => p1.number === p.number).length > 0) setTeam({ ...team, players: team.players.filter(p1 => p1.number !== p.number) });
                        else setTeam({ ...team, players: [...team.players, { name: p.name, number: p.number }] });
                    }}
                >
                    <span>{p.number}</span>
                    <span>{p.name}</span>
                </div>
            ))}
            {changed &&
                <button
                    className={`${styles.saveButton} button`}
                    onClick={async () => {
                        let savedTeams: Team[] = JSON.parse(localStorage.getItem('teams') ?? '[]');
                        let filtered;
                        if (!savedTeams) savedTeams = [team];
                        else {
                            filtered = savedTeams.filter(t => t.id !== team.id);
                            savedTeams = [...filtered, team];
                        }
                        localStorage.setItem('teams', JSON.stringify(savedTeams));
                        setChanged(false);
                        const teamRef = doc(db, 'users', state.userId, 'teams', team.id.toString());
                        await setDoc(teamRef, {
                            name: team.name,
                            year,
                        });
                        const playersRef = collection(db, 'users', state.userId, 'teams', team.id.toString(), 'players');
                        const playersSnap = await getDocs(playersRef);
                        playersSnap.forEach(async p => {
                            await deleteDoc(p.ref);
                        });
                        team.players.forEach(async p => {
                            const playerRef = doc(db, 'users', state.userId, 'teams', team.id.toString(), 'players', p.number.toString());
                            await setDoc(playerRef, { name: p.name });
                        })
                    }}
                >
                    Mentés
                </button>
            }
        </div >
    )
}
