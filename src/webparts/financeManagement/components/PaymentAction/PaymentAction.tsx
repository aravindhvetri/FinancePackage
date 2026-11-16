import * as React from "react";
import styles from "./PaymentActionStyle.module.scss";
import { useState, useMemo } from "react";
import Table from "../Table/Table";

interface PaymentActionProps {
  context: any;
  selectedRow: any | undefined;
}

function PaymentAction({ context, selectedRow }: PaymentActionProps) {
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

  const showPaymentAction =
    (selectedRow?.PaymentProcess === "Completed" &&
      selectedRow?.FinanceTeamAction === "Cancel Payment") ||
    (selectedRow?.PaymentProcess === "Inprogress" &&
      selectedRow?.FinanceTeamAction === "On Hold");

  return (
    <div className={styles.approvalSection}>
      {showHoldTable && holdHistoryTableData.length > 0 && (
        <div className={styles.paymentTable}>
          <Table
            value={holdHistoryTableData}
            dataKey={"Id"}
            loading={!holdHistoryTableData}
            paginator={false}
            rows={holdHistoryTableData?.length || 0}
            emptyMessage="No hold history available"
            columns={[
              {
                field: "Date",
                header: "Date",
                body: (rowData: any) => rowData.Date,
              },
              {
                field: "Amount",
                header: "Amount",
              },
              {
                field: "Reference",
                header: "Reference",
              },
              {
                field: "Account",
                header: "Account",
              },
              {
                field: "Remarks",
                header: "Remarks",
              },
            ]}
          />
        </div>
      )}
      {showCancelTable && cancelHistoryTableData.length > 0 && (
        <div className={styles.paymentTable}>
          <Table
            value={cancelHistoryTableData}
            dataKey={"Id"}
            loading={!cancelHistoryTableData}
            paginator={false}
            rows={cancelHistoryTableData?.length || 0}
            emptyMessage="No cancel history available"
            columns={[
              {
                field: "Date",
                header: "Date",
                body: (rowData: any) => rowData.Date,
              },
              {
                field: "Amount",
                header: "Amount",
              },
              {
                field: "Reference",
                header: "Reference",
              },
              {
                field: "Account",
                header: "Account",
              },
              {
                field: "Remarks",
                header: "Remarks",
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
export default PaymentAction;
