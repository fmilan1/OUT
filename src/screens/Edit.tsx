import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import styles from '../styles/Edit.module.css'

export default function Edit() {

    const { state } = useLocation();
    const navigate = useNavigate();
    const [initialStateTeam, setInitialStateTeam] = useState(state.team);
    const [newNumber, setNewNumber] = useState();
    const [newName, setNewName] = useState();

    const [team, setTeam] = useState(state.team);

    const [deletedPlayersStack, setDeletedPlayersStack] = useState([]);

    return (
        <div
            className={styles.container}
        >
            <h1
                contenteditable='true'
            >
                <input
                    className={styles.input}
                    type="text"
                    onChange={(e) => {
                        setTeam(prev => {
                            return { ...prev, name: e.target.value }
                        });
                    }}
                    value={team.name}
                />
            </h1>
            <button
                className={`${styles.delete} button`}
                onClick={() => {

                    let savedTeams = JSON.parse(localStorage.getItem('teams'));
                    let filtered;
                    if (!savedTeams) savedTeams = [team];
                    else {
                        filtered = savedTeams.filter(t => t.id !== team.id);
                        savedTeams = [...filtered];
                    }
                    localStorage.setItem('teams', JSON.stringify(savedTeams));
                    navigate('/');
                }}
            >
                Csapat törlése
            </button>
            <h2>Játékosok</h2>
            <div
                className={styles.players}
            >
                {team.players.sort((a, b) => a.number - b.number).map(p => (
                    <div
                        className={styles.player}
                        onClick={() => {
                            setTeam(prev => {
                                return { ...prev, players: prev.players.filter(p1 => p1 !== p) }
                            });
                            setDeletedPlayersStack(prev => {
                                return [...prev, p];
                            });
                        }}
                    >
                        <span>{p.number}</span>
                        <span>{p.name}</span>
                    </div>
                ))}
                <form
                    className={styles.player}
                >
                    <input
                        type='number'
                        onChange={(e) => setNewNumber(e.target.value.length > 2 ? newNumber : e.target.value)}
                        value={newNumber}
                        className={`${styles.input} ${team.players.map(p => p.number).includes(parseInt(newNumber)) ? styles.wrong : ''}`}
                    />
                    <input
                        placeholder='Név'
                        onChange={(e) => setNewName(e.target.value)}
                        value={newName}
                        className={styles.input}
                    />
                    {newNumber && newName && !team.players.map(p => p.number).includes(parseInt(newNumber)) &&
                        <button
                            className='button'
                            onClick={() => {
                                setTeam(prev => {
                                    return { ...prev, players: [...prev.players, { name: newName, number: parseInt(newNumber) }] }
                                });
                                setNewNumber('');
                                setNewName('');
                                const firstInput = document.forms[0].elements[0] as HTMLInputElement;
                                firstInput.focus();
                            }}
                        >Hozzáadás</button>
                    }
                </form>
                <div
                    className={styles.buttons}
                >

                    {initialStateTeam !== team &&
                        <button
                            className={`${styles.saveButton} button`}
                            onClick={() => {
                                let savedTeams = JSON.parse(localStorage.getItem('teams'));
                                let filtered;
                                if (!savedTeams) savedTeams = [team];
                                else {
                                    filtered = savedTeams.filter(t => t.id !== team.id);
                                    savedTeams = [...filtered, team];
                                }
                                localStorage.setItem('teams', JSON.stringify(savedTeams));
                                setInitialStateTeam(team);
                                setDeletedPlayersStack([])
                            }}
                        >
                            Mentés
                        </button>
                    }
                    {deletedPlayersStack.length > 0 &&
                        <button
                            className="button"
                            onClick={() => {
                                setTeam(prev => {
                                    const last = deletedPlayersStack.pop();
                                    return { ...prev, players: [...prev.players, last] }
                                });
                            }}
                        >
                            Vissza
                        </button>
                    }
                </div>
            </div>
        </div >
    )
}
