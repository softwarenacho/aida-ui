import styles from '../page.module.scss';

const Captions = ({ caption }: { caption: string }) => {
  return <div className={styles.captions}>{caption}</div>;
};

export default Captions;
