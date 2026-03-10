import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '../styles/ShareModal.module.scss';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface Props {
    hide: () => void,
    url: string,
}

export default function ShareModal(props: Props) {
    // const { state } = useLocation();

    return (
        <div
            className={styles.container}
            onClick={props.hide}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={styles.innerContainer}
            >
                <span>Online követés: </span>
                <a href={props.url} target='_blank'>{props.url}</a>
                <FontAwesomeIcon
                    icon={faCopy}
                    onClick={async () => {
                        await navigator.clipboard.writeText(props.url);
                    }}
                />
            </div>
        </div>
    )
}

