import styles from '../styles/Home.module.scss';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router';
import { uid } from 'uid';

export default function Home() {

    const navigate = useNavigate();

    const [teams, setTeams] = useState<{ name: string, id: string, players: { name: string, number: number }[] }[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storageTeams = JSON.parse(localStorage.getItem("teams") ?? '[]');
        setTeams(storageTeams);

        if (!scrollContainerRef.current) return;

        scrollContainerRef.current.addEventListener('wheel', handleWheel, { passive: false });
    }, []);


    const handleWheel = (event: WheelEvent) => {
        if (scrollContainerRef.current) {
            event.preventDefault(); // Megakadályozza a függőleges görgetést
            scrollContainerRef.current.scrollLeft += event.deltaY; // Görgetés vízszintes irányba
        }
    };

    return (
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
                                state: { team }
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
                                        team,
                                        players: JSON.parse(localStorage.getItem('players') ?? '[]'),
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
                    navigate('/players');
                }}
            >Játékosok kezelése</button>
        </div>
    )
}
