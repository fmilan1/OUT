import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '../styles/User.module.scss';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useState } from 'react';

export default function User() {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <>
            <div
                className={styles.overlay}
                onClick={() => {setShowMenu(false)}}
            />
            <div
                className={styles.container}
                onClick={() => setShowMenu(!showMenu)}
            >
                <FontAwesomeIcon
                    className={styles.svg}
                    icon={faUserCircle}
                />
                <div
                    className={`${styles.menuContainer} ${showMenu ? styles.shown : ''}`}
                >
                    <ul>
                        <li
                            onClick={() => {
                                signOut(auth);
                                localStorage.clear();
                            }}
                        >Kilépés</li>
                    </ul>
                </div>
            </div>
        </>
    )
}

