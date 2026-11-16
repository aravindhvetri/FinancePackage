import * as React from "react";
import { useState } from "react";
import "../../../../ExternalRef/CSS/Style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import NavBar from "../NavBar/NavBar";
import Dashboard from "../Dasboard/Dashoard";
import VendorDashboard from "../Vendor/Vendor";
import FreelancerDashboard from "../Freelancer/Freelancer";
import ReadyForPaymentDashboard from "../ReadyForPayment/ReadyForPayment";
import CompletedPaymentDashboard from "../CompletedPayment/CompletedPayment";
import PaymentHistoryForVendorOrFreelancerDashboard from "../PaymentHistoryForVendorOrFreelancer/PaymentHistoryForVendorOrFreelancer";

interface MainComponentProps {
  context: any;
}

const MainComponent: React.FC<MainComponentProps> = ({ context }) => {
  const [selectedMenu, setSelectedMenu] = useState<string>("Dashboard");

  // Drill-down from Vendor / Freelancer into their individual payment history
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistoryContext, setPaymentHistoryContext] = useState<{
    type: "vendor" | "freelancer";
    id: number | null;
  }>({
    type: "vendor",
    id: null,
  });

  // When switching nav items, always clear the vendor/freelancer drill-down
  const handleMenuChange = (menu: string) => {
    setShowPaymentHistory(false);
    setSelectedMenu(menu);
  };

  const renderContent = () => {
    // Vendor / Freelancer drill-down overrides the current nav screen
    if (showPaymentHistory) {
      return (
        <PaymentHistoryForVendorOrFreelancerDashboard
          context={context}
          navigateType={paymentHistoryContext.type}
          navigateId={paymentHistoryContext.id}
          onBack={() => setShowPaymentHistory(false)}
        />
      );
    }

    switch (selectedMenu) {
      case "Dashboard":
        return <Dashboard context={context} />;

      case "Vendor":
        return (
          <VendorDashboard
            context={context}
            onOpenPaymentHistory={(type, id) => {
              setPaymentHistoryContext({ type, id });
              setShowPaymentHistory(true);
            }}
          />
        );

      case "Freelancer":
        return (
          <FreelancerDashboard
            context={context}
            onOpenPaymentHistory={(type, id) => {
              setPaymentHistoryContext({ type, id });
              setShowPaymentHistory(true);
            }}
          />
        );

      case "ReadyForPayment":
        return <ReadyForPaymentDashboard context={context} />;

      case "PaymentHistory":
        return <CompletedPaymentDashboard context={context} />;

      default:
        return <Dashboard context={context} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <NavBar
        context={context}
        selectedMenu={selectedMenu}
        setSelectedMenu={handleMenuChange}
      />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {renderContent()}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default MainComponent;
