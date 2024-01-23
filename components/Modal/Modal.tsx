import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CloseButton from 'components/CloseButton';
import styles from './Modal.module.scss';

interface Props {
  children: ReactNode,
  showModal: boolean,
  onClose: () => void
}

export function Modal({ children, showModal, onClose }: Props) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(showModal);

  useEffect(() => {
    function closeModal() {
      if (onClose) onClose();
      setIsVisible(false);
    }

    router.events.on('routeChangeComplete', closeModal);

    return () => {
      router.events.off('routeChangeComplete', closeModal);
    };
  }, []);

  useEffect(() => {
    setIsVisible(showModal);
  }, [showModal]);

  return (
    <div
      className={styles.modal}
      aria-hidden={!isVisible}
      tabIndex={-1}
    >
      <div className={styles.container}>
        <CloseButton onClick={onClose} />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
