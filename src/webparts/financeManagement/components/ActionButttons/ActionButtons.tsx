/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import styles from "./ActionButtonsStyle.module.scss";
import { Button, ButtonProps } from "primereact/button";
import { classNames } from "primereact/utils";

type ActionButtonVariant =
  | "button"
  | "icon"
  | "danger"
  | "danger"
  | "info"
  | "warning"
  | "success"
  | "secondary"
  | "tertiary"
  | "light"
  | "dark"
  | "link"
  | "transparent";

type ActionButtonsProps = {
  buttons: (ButtonProps & {
    variants: ActionButtonVariant[];
  })[];
};

function ActionButtons({ buttons }: ActionButtonsProps) {
  return (
    <div className={styles.actionButtonsContainer}>
      {buttons.map((btnProps, index) => {
        const { variants, className,tooltip, tooltipOptions, ...rest } = btnProps;
        return (
          <Button
            key={index}
            {...rest}
            className={classNames(className, styles.actionButton, {
              [styles.icon]: variants.includes("icon"),
              [styles.danger]: variants.includes("danger"),
              [styles.info]: variants.includes("info"),
              [styles.warning]: variants.includes("warning"),
              [styles.success]: variants.includes("success"),
              [styles.secondary]: variants.includes("secondary"),
              [styles.tertiary]: variants.includes("tertiary"),
              [styles.light]: variants.includes("light"),
              [styles.dark]: variants.includes("dark"),
              [styles.link]: variants.includes("link"),
              [styles.button]: variants.includes("button"),
              [styles.transparent]: variants.includes("transparent"),
            })}
          />
        );
      })}
    </div>
  );
}

export default ActionButtons;
