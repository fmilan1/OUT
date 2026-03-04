import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, collectionGroup, getDocs, onSnapshot, query, where } from "firebase/firestore";
import styles from '../styles/Live.module.scss';
import { useNavigate } from "react-router";

export default function Live() {
    const teamId = window.location.search.replace('?', '');
    const [teamName, setTeamName] = useState('');
    const [stats, setStats] = useState<{
        id: string,
        opponentName: string,
        ended: boolean,
        modified: number,
        scorers: any[],
    }[]>([]);

    useEffect(() => {
        async function fetch() {
            const q = query(collectionGroup(db, 'teams'), where('id', '==', teamId));
            const querySnapshot = await getDocs(q);
            querySnapshot.docs.forEach(doc => {
                setTeamName(doc.get('name'));
                const statsRef = collection(doc.ref, 'stats');
                const unsubscribe = onSnapshot(statsRef, snap => {
                    let tmp = snap.docs.map(s => ({
                        id: s.id,
                        opponentName: s.get('opponentName'),
                        ended: s.get('ended'),
                        scorers: s.get('scorers'),
                        modified: s.get('modified'),
                    }));
                    setStats(tmp);
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
        <div
            className={styles.container}
        >
            <h1>{teamName}</h1>
            <br />
            {stats.sort((a, b) => b.modified - a.modified).map((s, index) => (
                <div
                    key={index}
                    className={`${styles.stat} ${s.ended ?
                        (s.scorers.filter(sc => sc.isOurScore).length > s.scorers.filter(sc => !sc.isOurScore).length ? styles.win : (s.scorers.filter(sc => sc.isOurScore).length === s.scorers.filter(sc => !sc.isOurScore).length ? styles.draw : styles.lose)) : styles.live}`}
                    onClick={() => {
                        navigate(`stat?${s.id}`, { state: { teamName, opponentName: s.opponentName } });
                    }}
                >
                    <div
                        className={styles.inner}
                    >
                        <span>{teamName}</span>
                        <div
                            className={styles.scores}
                        >
                            <span>{s.scorers.filter(sc => sc.isOurScore).length}</span>
                            <span>:</span>
                            <span>{s.scorers.filter(sc => !sc.isOurScore).length}</span>
                        </div>
                        <span>{s.opponentName}</span>
                    </div>
                </div>
            ))
            }
        </div >
    )
}

