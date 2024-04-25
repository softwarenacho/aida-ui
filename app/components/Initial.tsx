import styles from '../page.module.scss';

const Initial = ({ currentUrl }: { currentUrl: string }) => (
  <section className={currentUrl ? styles.footer : styles.initial}>
    <h1 className={styles.aida}>AIDA Dreams</h1>
  </section>
);

export default Initial;
