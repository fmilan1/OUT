import {useEffect, useState} from 'react';
import styles from '../styles/Players.module.css';

export default function Players() {

    const [players, setPlayers] = useState<{name: string, number: number}[]>([]);
    const [newNumber, setNewNumber] = useState(-1);
    const [newName, setNewName] = useState('');
    const [deletedPlayersStack, setDeletedPlayersStack] = useState<{ name: string, number: number }[]>([]);

    useEffect(() => {
	const storagePlayers: {name: string, number: number}[] = JSON.parse(localStorage.getItem('players') ?? '[]');
	setPlayers(storagePlayers);
    }, []);

    useEffect(() => {
	localStorage.setItem('players', JSON.stringify(players));
    }, [players]);

    return (
	<div
	    className={styles.container}
	>
	    <h1>Játékosok</h1>
	    {players.sort((a, b) => a.number - b.number).map((p, index) => (
		<div
		    className={`${styles.player} player`}
		    key={index}
		    onClick={() => {
			let teams: {name: string, id: string, players: {name: string, number: number}[]}[] = JSON.parse(localStorage.getItem('teams') ?? '[]');
			let tmp: {name: string, id: string, players: {name: string, number: number}[]}[] = [];
			teams.forEach(t => {
			    if (t.players.map(p1 => p1.number).includes(p.number)) {
				tmp.push({...t, players: t.players.filter(p1 => p.number !== p1.number)});
			    }
			    else tmp.push(t);
			});
			localStorage.setItem('teams', JSON.stringify(tmp));
			setPlayers(players.filter(p1 => p1.number !== p.number));
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
		    onChange={(e) => setNewNumber(e.target.value.length > 2 ? newNumber : parseInt(e.target.value))}
		    value={newNumber < 0 ? '' : newNumber}
		    className={`${styles.input} ${players.map(p => p.number).includes(newNumber) ? styles.wrong : ''}`}
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
			onClick={() => {
			    setPlayers([ ...players, { number: newNumber, name: newName }]);
			    setNewNumber(-1);
			    setNewName('');
			    setDeletedPlayersStack([]);
			    const firstInput = document.forms[0].elements[0] as HTMLInputElement;
			    firstInput.focus();
			}}
		    >Hozzáadás</button>
		}
	    </form>
	    {deletedPlayersStack.length > 0 &&
		<button
		    className='button'
		    onClick={() => {
			const last = deletedPlayersStack.pop();
			if (!last) return;
			setPlayers([...players, last]);
		    }}
		>
		    Vissza
		</button>
	    }
	</div>
    )
}
