import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./SideModalStyle.module.scss";
import classNames from "classnames";
import CloseIcon from "../CloseIcon/CloseIcon";

type SideModalProps = {
  title: React.ReactNode;
  visible: boolean;
  onHide: () => void;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg"
  fixedHeight?: boolean; 
  animate : boolean;
  
};

function SideModal({ title, visible, onHide, children, size="lg",fixedHeight=true, animate}: SideModalProps) {
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
       setRender(true);
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
      setTimeout(() => setRender(false), 200);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

   

  return (
    <div className={styles.overlay} >
      <div className={classNames(styles.content, styles[size], {
         [styles.visible]: show, 
         [styles.fixedHeight]: fixedHeight,
         [styles.animate]:animate
          })}>
        <div className={styles.header}>
          <h2 >{title}</h2>
          <button onClick={onHide}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

export default SideModal;
