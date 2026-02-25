import styles from '../styles/Home.module.scss';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router';
import { uid } from 'uid';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import User from '../components/User';

export interface Player {
    number: number,
    name: string,
}

export interface Team {
    id: string,
    year: number,
    name: string,
    tournament: string,
    players: Player[],
    loanPlayers: Player[],
}

export default function Home() {

    const [userId, setUserId] = useState<string | undefined>();
    const navigate = useNavigate();

    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [years, setYears] = useState<number[]>(() => {
        return JSON.parse(localStorage.getItem('years') ?? '[]');
    });
    const [selectedYear, setSelectedYear] = useState<number>(() => {
        return parseInt(localStorage.getItem('year') ?? '-1');
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            }
            setUserId(user?.uid);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (!years.includes(selectedYear)) {
            setSelectedYear(-1);
        }
    }, [years]);

    useEffect(() => {
        localStorage.setItem('year', selectedYear.toString());
    }, [selectedYear]);

    useEffect(() => {
        const storageTeams = JSON.parse(localStorage.getItem("teams") ?? '[]');
        setTeams(storageTeams);

        async function fetchPlayers() {
            if (!userId) return;
            const playersSnap = await getDocs(collection(db, 'users', userId, 'players'));
            const fetchedPlayers = playersSnap.docs.map(p => ({
                name: `${p.get('name')}`,
                number: parseInt(p.id),
            }));
            setPlayers(fetchedPlayers);
        }

        fetchPlayers();

        async function fetchTeams() {
            if (!userId) return;
            const teamsSnap = await getDocs(collection(db, 'users', userId, 'teams'));
            let availableYears: number[] = [];

            const teamsData = await Promise.all(

                teamsSnap.docs.map(async t => {
                    const teamId = t.id;
                    const teamName = t.get('name');
                    const tournament = t.get('tournament');
                    const year = t.get('year') ?? 2025;
                    if (!availableYears.includes(year)) {
                        availableYears.push(year);
                    }

                    const playersSnap = await getDocs(collection(db, 'users', userId, 'teams', teamId, 'players'));
                    const playerData = playersSnap.docs.map(p => ({
                        name: `${p.get('name')}`,
                        number: parseInt(p.id),
                    }));

                    const loanPlayersSnap = await getDocs(collection(db, 'users', userId, 'teams', teamId, 'loanPlayers'));
                    const loanPlayersData = loanPlayersSnap.docs.map(p => ({
                        name: `${p.get('name')}`,
                        number: parseInt(p.id),
                    }));
                    return { name: teamName, tournament, id: teamId, year, players: playerData, loanPlayers: loanPlayersData }
                })
            )
            setTeams(teamsData);
            availableYears.sort();
            localStorage.setItem('years', JSON.stringify(availableYears));
            setYears(availableYears);

        }

        fetchTeams();
    }, [userId]);

    useEffect(() => {
        localStorage.setItem('teams', JSON.stringify(teams));
    }, [teams]);

    return (
        <>
            <User />
            <div
                className={styles.container}
            >
                <div>
                    <h1>
                        <span>Mentett csapatok</span>
                        <select
                            id='years'
                            value={selectedYear}
                            onChange={(e) => {
                                let y = parseInt(e.target.value);
                                if (Number.isNaN(y)) {
                                    setSelectedYear(-1);
                                } else {
                                    setSelectedYear(y);
                                }
                            }}
                        >
                            <option value='all'>Minden év</option>
                            {years.map(y => (
                                <option
                                    key={y}
                                    value={y}
                                >{y}</option>
                            ))}
                        </select>
                    </h1>
                </div>
                <div
                    ref={scrollContainerRef}
                    className={styles.teamsContainer}
                >
                    <div
                        className={styles.team}
                        onClick={() => {
                            const id = uid();
                            navigate('/edit', {
                                state: {
                                    team: { name: 'Új csapat', id, players: [] },
                                    userId,
                                    players,
                                }
                            })
                        }}
                    >+</div>
                    {teams && (selectedYear === -1 ? teams : teams.filter(t => t.year === selectedYear)).map((team) => (
                        <div
                            key={team.id}
                            className={styles.team}
                            onClick={() => {
                                navigate('/new', {
                                    state: {
                                        team,
                                        userId,
                                    }
                                });
                            }}
                        >
                            <div
                                className={`${styles.icon} ${styles.people}`}
                            >
                                <FontAwesomeIcon
                                    icon={faUser}
                                />
                                {team.players.length}
                            </div>
                            <FontAwesomeIcon
                                className={`${styles.icon} ${styles.edit}`}
                                icon={faPenToSquare}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/edit', {
                                        state:
                                        {
                                            userId,
                                            team,
                                            players,
                                        }
                                    });
                                }}
                            />
                            <img src={team.name !== "Hungary" ? "out.svg" : "hun flag.svg"} alt="Csapatlogó" />
                            <span>
                                <span>{team.name}</span>
                                <span>{team.tournament}</span>
                            </span>
                        </div>
                    ))}
                </div>
                <button
                    className='button'
                    onClick={() => {
                        navigate('/players', { state: { players, userId } });
                    }}
                >Játékosok kezelése</button>
            </div>
        </>
    )
}
