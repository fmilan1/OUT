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

export default function Home() {

    const [userId, setUserId] = useState<string | undefined>();
    const navigate = useNavigate();

    const [teams, setTeams] = useState<{ name: string, id: string, players: { name: string, number: number }[] }[]>([]);
    const [players, setPlayers] = useState<{ name: string, number: number }[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) navigate('/login');
            setUserId(user?.uid);
        });

        return unsubscribe;
    }, []);


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

            const teamsData = await Promise.all(

                teamsSnap.docs.map(async t => {
                    const teamId = t.id;
                    const teamName = t.get('name');

                    const playersSnap = await getDocs(collection(db, 'users', userId, 'teams', teamId, 'players'));
                    const playerData = playersSnap.docs.map(p => ({
                        name: `${p.get('name')}`,
                        number: parseInt(p.id),
                    }))
                    return { name: teamName, id: teamId, players: playerData }
                })
            )
            setTeams(teamsData);
        }

        fetchTeams();
    }, [userId]);

    useEffect(() => {
        localStorage.setItem('teams', JSON.stringify(teams));
    }, [teams]);

    //useEffect(() => {
    //    const storageTeams = JSON.parse(localStorage.getItem("teams") ?? '[]');
    //    setTeams(storageTeams);
    //
    //    if (!scrollContainerRef.current) return;
    //
    //    scrollContainerRef.current.addEventListener('wheel', handleWheel, { passive: false });
    //}, []);

    return (
        <>
            <User />
            <div

                className={styles.container}
            >
                <h1>Mentett csapatok</h1>
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
                                    players: JSON.parse(localStorage.getItem('players') ?? '[]'),
                                    userId,

                                }
                            })
                        }}
                    >+</div>
                    {teams && teams.map((team) => (
                        <div
                            key={team.id}
                            className={styles.team}
                            onClick={() => {
                                navigate('/new', {
                                    state: {
                                        team,
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
                            <img src="out.svg" alt="Csapatlogó" />
                            <span>{team.name}</span>
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
