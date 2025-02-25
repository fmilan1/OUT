import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import styles from '../styles/Edit.module.scss'

export default function Edit() {

    const { state } = useLocation();
    const navigate = useNavigate();
    const [players, _] = useState<{ name: string, number: number }[]>(state.players);

    const [team, setTeam] = useState<{ players: { name: string, number: number }[], name: string, id: string }>(state.team);
    const [changed, setChanged] = useState(false);

    useEffect(() => {
        let storageTeams: { name: string, id: string, players: { name: string, number: number }[] }[] = JSON.parse(localStorage.getItem('teams') ?? '[]');
        let thisTeam = storageTeams.find(p => p.id === state.team.id);
        if (thisTeam) setTeam(thisTeam);
    }, []);

    useEffect(() => {
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
            </h1>
            <button
                className={`${styles.delete} button`}
                onClick={() => {

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
                    onClick={() => {
                        let savedTeams: { name: string, id: string, players: { name: string, number: number }[] }[] = JSON.parse(localStorage.getItem('teams') ?? '[]');
                        let filtered;
                        if (!savedTeams) savedTeams = [team];
                        else {
                            filtered = savedTeams.filter(t => t.id !== team.id);
                            savedTeams = [...filtered, team];
                        }
                        localStorage.setItem('teams', JSON.stringify(savedTeams));
                        setChanged(false);
                    }}
                >
                    Mentés
                </button>
            }
        </div >
    )
}
