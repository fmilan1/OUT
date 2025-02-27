import { useEffect, useState } from 'react'
import styles from '../styles/Login.module.scss'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPasswrod] = useState('');

    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const usersRef = doc(db, 'users', user?.uid);
            setDoc(usersRef, {})
            if (user) navigate('/', { state: { user: JSON.stringify(user) } });
        });

        return unsubscribe;
    }, []);

    return (
        <div
            className={styles.container}
        >
            <h2>Belépés</h2>
            <form
                className={styles.form}
                onSubmit={(e) => e.preventDefault()}
                method=''
            >
                <input
                    required
                    type='email'
                    inputMode='email'
                    placeholder='E-mail cím'
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    required
                    type='password'
                    placeholder='Jelszó'
                    onChange={(e) => setPasswrod(e.target.value)}
                />
                <button
                    type='submit'
                    className={styles.button}
                    onClick={async () => {
                        setError('');
                        try {
                            await signInWithEmailAndPassword(auth, email, password);
                        } catch (error) {
                            if (error instanceof FirebaseError) {
                                switch (error.code) {
                                    case 'auth/invalid-email':
                                        setError('Hibás e-mail cím!')
                                        break;
                                    case 'auth/missing-password':
                                        setError('Adja meg a jelszót!')
                                        break;
                                    case 'auth/invalid-credential':
                                        setError('Nem megfelelő e-mail cím vagy jelszó!')
                                        break;
                                }
                            }
                        }
                    }}
                >
                    Belépés
                </button>
            </form>
            {error &&
                <div
                    className={styles.error}
                >
                    {error}
                </div>
            }
        </div>
    )
}

