import styles from '../styles/Home.module.css';
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
                                team: { name: 'Új csapat', id, players: [] }
                            }
                        })
                    }}
                >+</div>
                {teams && teams.map((team) => (
                    <div
                        key={team.id}
                        className={styles.team}
                        onClick={() => {
                            // alert();
                            navigate('/new', {
                                state: { players: team.players.sort((a, b) => a.number - b.number), teamName: team.name }
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
                                navigate('/edit', { state: { team } })
                            }}
                        />
                        <img src="https://scontent-vie1-1.xx.fbcdn.net/v/t1.15752-9/416385981_1160666734911714_6105998791939796377_n.png?stp=dst-png_s100x100&_nc_cat=109&ccb=1-7&_nc_sid=b70caf&_nc_ohc=Jyq0yw3zbuMQ7kNvgHgKjDm&_nc_oc=AdgCwKSOndTAzyV9XqHWlc_2anGBanz8ro4ak9hTJakZUd8iMH9JKS3FDQbcpaKvP-MM9i6npvQsSvpzCP0_v85j&_nc_zt=23&_nc_ht=scontent-vie1-1.xx&oh=03_Q7cD1gGVNFoqOcUoQHWBSMrZLvY2c85InGb_lNLJ8-U7mEJshA&oe=67D19D71" alt="Csapatlogó" />
                        <span>{team.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
