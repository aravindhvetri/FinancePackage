import * as React from "react";
import styles from "./EditMyRequestApprovalsStyle.module.scss";
import { useState, useMemo } from "react";
import { formatDate } from "../../../../utils/date";


interface EditRequestIApprovalsProps {
  context: any;
  selectedRow: any | undefined;
}

function EditRequestApprovals({
  context,
  selectedRow,
}: EditRequestIApprovalsProps) {
  const [showPaymentActionTables, setShowPaymentActionTables] = useState(false);

  const holdHistory = useMemo(() => {
    if (!selectedRow?.OnHoldPaymentReason) return [];

    try {
      return JSON.parse(selectedRow.OnHoldPaymentReason);
    } catch {
      return [];
    }
  }, [selectedRow]);

  const holdHistoryTableData = holdHistory.map((item: any) => ({
    Id: item.ID,
    Date: item.Date,
    Amount: "-",
    Reference: item.ID,
    Account: "-",
    Remarks: item.Reason,
  }));

  const cancelHistory = useMemo(() => {
    if (!selectedRow?.StopPaymentReason) return [];

    try {
      return JSON.parse(selectedRow.StopPaymentReason);
    } catch {
      return [];
    }
  }, [selectedRow]);

  const cancelHistoryTableData = cancelHistory.map((item: any) => ({
    Id: item.ID,
    Date: item.Date,
    Amount: "-",
    Reference: item.ID,
    Account: "-",
    Remarks: item.Reason,
  }));

  const showHoldTable =
    selectedRow?.PaymentProcess === "Inprogress" &&
    selectedRow?.FinanceTeamAction === "On Hold";

  const showCancelTable =
    selectedRow?.PaymentProcess === "Completed" &&
    selectedRow?.FinanceTeamAction === "Cancel Payment";

  const ceoApproval = useMemo(() => {
    if (!selectedRow?.ApprovalHistory) return null;

    try {
      const history = JSON.parse(selectedRow.ApprovalHistory);

      // 👇 THIS is ceoApproval
      return history.find((h: any) => h.Position === "CEO") || history[0];
    } catch {
      return null;
    }
  }, [selectedRow]);

  const managerApproval = useMemo(() => {
    if (!selectedRow?.ApprovalHistory) return null;

    try {
      const history = JSON.parse(selectedRow.ApprovalHistory);

      // 👇 THIS is ceoApproval
      return history.find((h: any) => h.Position === "Manager") || history[0];
    } catch {
      return null;
    }
  }, [selectedRow]);

  const managerApprovalDate = selectedRow?.ManagerApprovalDate
    ? formatDate(selectedRow.ManagerApprovalDate)
    : "N/A";

  const managerApprovedAmount = selectedRow?.ApproverAmount ?? "N/A";

  const managerApprovedBy = managerApproval?.Name || "N/A";

  const managerComments = selectedRow?.ApproverComments || "No Comments";

  const ceoApprovalDate = selectedRow?.CEOApprovalDate
    ? formatDate(selectedRow.CEOApprovalDate)
    : ceoApproval?.Date || "N/A";

  const ceoApprovedAmount =
    selectedRow?.FinalApprovedAmount ?? ceoApproval?.Amount ?? "N/A";

  const ceoApprovedBy =
    ceoApproval?.Name || selectedRow?.FinalApprovalByStringId || "N/A";

  const ceoComments =
    selectedRow?.FinalComments || ceoApproval?.Reason || "N/A";

  const showPaymentAction =
    (selectedRow?.PaymentProcess === "Completed" &&
      selectedRow?.FinanceTeamAction === "Cancel Payment") ||
    (selectedRow?.PaymentProcess === "Inprogress" &&
      selectedRow?.FinanceTeamAction === "On Hold");

  return (
    <div className={styles.approvalSection}>
      {showPaymentAction && (
        <h5
          className={styles.paymentActionBtn}
          onClick={() => setShowPaymentActionTables((prev) => !prev)}
        >
          {" "}
          Payment Action {showPaymentActionTables ? "▲" : "▼"}
        </h5>
      )}
      <div>
        <div className={styles.sectionTitle}>Manager Approval</div>

        <div className={styles.formGrid}>
          <label>Date</label>
          <input type="text" value={managerApprovalDate} readOnly />

          <label>Approved amount</label>
          <input
            type="text"
            value={`₹ ${Number(managerApprovedAmount).toFixed(2)}`}
          />

          <label>Approved by</label>
          <input type="text" value={managerApprovedBy} readOnly />

          <label>Comments</label>
          <textarea rows={4} value={managerComments} />
        </div>
      </div>
      <div className={styles.ceoApprovalSection}>
        <div className={styles.sectionTitle}>CEO Approval</div>

        <div className={styles.formGrid}>
          <label>Date</label>
          <input type="text" value={ceoApprovalDate} readOnly />

          <label>Approved amount</label>
          <input
            type="text"
            value={`₹ ${Number(ceoApprovedAmount).toFixed(2)}`}
          />

          <label>Approved by</label>
          <input type="text" value={ceoApprovedBy} readOnly />

          <label>Comments</label>
          <textarea rows={4} value={ceoComments} />
        </div>
      </div>
    </div>
  );
}
export default EditRequestApprovals;
