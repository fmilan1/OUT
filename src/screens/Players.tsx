import { useEffect, useState } from 'react';
import styles from '../styles/Players.module.scss';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { useLocation } from 'react-router';
import { db } from '../firebase';

export default function Players() {

    const { state } = useLocation();
    const [players, setPlayers] = useState<{ name: string, number: number }[]>([]);
    const [newNumber, setNewNumber] = useState(-1);
    const [newName, setNewName] = useState('');
    const [deletedPlayersStack, setDeletedPlayersStack] = useState<{ name: string, number: number }[]>([]);

    useEffect(() => {

        const storagePlayers = JSON.parse(localStorage.getItem('players') ?? '[]');
        setPlayers(storagePlayers);

        async function fetchPlayers() {
            const playersSnap = await getDocs(collection(db, 'users', state.userId, 'players'));
            const fetchedPlayers = playersSnap.docs.map(p => ({
                name: `${p.get('name')}`,
                number: parseInt(p.id),
            }));
            setPlayers(fetchedPlayers);
        }

        fetchPlayers();

    }, [])

    useEffect(() => {
        localStorage.setItem('players', JSON.stringify(players));
    }, [players]);

    return (
        <div
            className={styles.container}
        >
            <h1>Játékosok</h1>
            {players?.sort((a, b) => a.number - b.number).map((p, index) => (
                <div
                    className={`${styles.player} player`}
                    key={index}
                    onClick={async () => {
                        let teams: { name: string, id: string, players: { name: string, number: number }[] }[] = JSON.parse(localStorage.getItem('teams') ?? '[]');
                        let tmp: { name: string, id: string, players: { name: string, number: number }[] }[] = [];
                        teams.forEach(t => {
                            if (t.players.map(p1 => p1.number).includes(p.number)) {
                                tmp.push({ ...t, players: t.players.filter(p1 => p.number !== p1.number) });
                            }
                            else tmp.push(t);
                        });
                        localStorage.setItem('teams', JSON.stringify(tmp));
                        setPlayers(players.filter(p1 => p1.number !== p.number));
                        const playerRef = doc(db, 'users', state.userId, 'players', p.number.toString());
                        await deleteDoc(playerRef);
                        const teamsRef = collection(db, 'users', state.userId, 'teams');
                        const teamsSnap = await getDocs(teamsRef);
                        teamsSnap.forEach(async t => {
                            const playersRef = collection(db, teamsRef.path, t.id.toString(), 'players');
                            const playersSnap = await getDocs(playersRef);
                            playersSnap.forEach(async player => {
                                if (player.id === p.number.toString()) await deleteDoc(player.ref);
                            })
                        })
                        setDeletedPlayersStack([...deletedPlayersStack, p]);
                    }}
                >
                    <span>{p.number}</span>
                    <span>{p.name}</span>
                </div>
            ))}
            <form
                className={`${styles.player} player`}
            >
                <input
                    type='number'
                    inputMode='numeric'
                    onChange={(e) => setNewNumber(e.target.value.length > 2 ? newNumber : parseInt(e.target.value))}
                    value={newNumber < 0 ? '' : newNumber}
                    className={`${styles.input} ${players?.map(p => p.number).includes(newNumber) ? styles.wrong : ''}`}
                    onKeyDown={(e) => {
                        if (!players.map(p => p.number).includes(newNumber) && e.key === 'Enter') {
                            const form = document.forms[0].elements[1] as HTMLInputElement;
                            form.focus();
                        }
                    }}
                />
                <input
                    placeholder='Név'
                    onChange={(e) => setNewName(e.target.value)}
                    value={newName}
                    className={styles.input}
                />
                {newNumber >= 0 && newName !== '' && !players.map(p => p.number).includes(newNumber) &&
                    <button
                        className='button'
                        onClick={async () => {
                            const newPlayer = { number: newNumber, name: newName };
                            setPlayers([...players, newPlayer]);

                            setNewNumber(-1);
                            setNewName('');
                            setDeletedPlayersStack([]);
                            const firstInput = document.forms[0].elements[0] as HTMLInputElement;
                            firstInput.focus();
                            const newPlayerRef = doc(db, 'users', state.userId, 'players', newPlayer.number.toString());
                            await setDoc(newPlayerRef, { name: newName })

                        }}
                    >Hozzáadás</button>
                }
            </form>
            {deletedPlayersStack.length > 0 &&
                <button
                    className='button'
                    onClick={async () => {
                        const last = deletedPlayersStack.pop();
                        if (!last) return;
                        setPlayers([...players, last]);
                        const newPlayerRef = doc(db, 'users', state.userId, 'players', last.number.toString());
                        await setDoc(newPlayerRef, { name: last.name })
                    }}
                >
                    Vissza
                </button>
            }
        </div>
    )
}
