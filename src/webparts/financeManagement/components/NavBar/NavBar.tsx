import * as React from "react";
import styles from "./NavBarStyle.module.scss";
import companyLogo from "../../../../assets/techalogo.png";

interface ILeftNavBarProps {
   context: any;
  selectedMenu: string;
  setSelectedMenu: (menu: string) => void;
}

function LeftNavBar({
  selectedMenu,
  setSelectedMenu, context 
}: ILeftNavBarProps) {
  const menuItems = [
    { key: "Dashboard", label: "Dashboard",  icon: "fa-solid fa-desktop" },
    { key: "Vendor", label: "Vendor", icon: "fa-solid fa-user"},
    { key: "Freelancer", label: "Freelancer", icon: "fa-brands fa-upwork" },
    { key: "ReadyForPayment", label: "Ready For Payment", icon: "fa-solid fa-hand-holding-dollar" },
    { key: "PaymentHistory", label: "Payment History", icon: "fa-regular fa-folder"},
  ];

  return (
    <div className={styles.sidebar}>
        <div className={styles.logoContainer}>
        <img
          src={companyLogo}
          alt="App Logo"
          className={styles.logo}
        />
      </div>
     <ul>
  {menuItems.map(({ key, label, icon }) => (
    <li
      key={key}
      className={selectedMenu === key ? styles.active : ""}
      onClick={() => setSelectedMenu(key)}
    >
      {icon && <i className={icon}></i>}
      <span className={styles.menuLabel}>{label}</span>
    </li>
  ))}
</ul>
    </div>
  );
}

export default LeftNavBar;