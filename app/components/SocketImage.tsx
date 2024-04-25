import styles from '../page.module.scss';

const SocketImage = ({ currentUrl }: { currentUrl: string }) => (
  <section className={styles.image}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img loading='lazy' src={currentUrl} alt='Current Image' />
  </section>
);

export default SocketImage;
