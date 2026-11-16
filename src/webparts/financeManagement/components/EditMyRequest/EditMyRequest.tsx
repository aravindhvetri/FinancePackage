import * as React from "react";
import styles from "./EditMyRequestStyle.module.scss";
import { useState } from "react";
import EditRequestInfo from "../EditMyRequestInfo/EditMyRequestInfo";
import EditRequestApprovals from "../EditMyRequestApprovals/EditMyRequestApprovals";
import EditRequestPayment from "../EditMyRequestPayment/EditMyRequestPayment";
import EditRequestAttachments from "../EditRequestAttachments/EditRequestAttachments";
import SideModal from "../SideModal/SideModal";
import Table from "../Table/Table";
import { deleteMyRequest } from "../../../../CommonServices/PaymentRequestService";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import PaymentAction from "../PaymentAction/PaymentAction";

interface EditMyRequestProps {
  context: any;
  onClose: () => void;
  selectedRow: any | undefined;
  allRequestPayments: any | undefined;
  mode: "PROCEED" | "VIEW";
  onCloneRequest?: (row: any) => void;
  refreshDashboard: () => void;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function EditMyRequest({
  context,
  selectedRow,
  allRequestPayments,
  mode,
  onClose,
  onCloneRequest,
  refreshDashboard,
}: EditMyRequestProps) {
  const [activeEditTab, setActiveEditTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showPaymentAction =
    (selectedRow?.PaymentProcess === "Completed" &&
      selectedRow?.FinanceTeamAction === "Cancel Payment") ||
    (selectedRow?.PaymentProcess === "Inprogress" &&
      selectedRow?.FinanceTeamAction === "On Hold");

  const editTabs = [
    { id: 0, label: "Info" },
    { id: 1, label: "Attachments" },
    { id: 2, label: "Approvals" },
    { id: 3, label: "Payments" },
    ...(showPaymentAction ? [{ id: 4, label: "Payment Action" }] : []),
  ];

  const approvalHistoryData = React.useMemo(() => {
    if (!selectedRow?.ApprovalHistory) return [];

    try {
      return JSON.parse(selectedRow.ApprovalHistory);
    } catch {
      return [];
    }
  }, [selectedRow]);

  const approvalHistoryTableData = approvalHistoryData.map(
    (item: any, index: number) => ({
      Id: item.ID ?? index,
      Name: item.Name,
      Email: item.Email,
      Position: item.Position,
      Status: item.Status,
      Amount: item.Amount,
      Reason: item.Reason,
      Date: item.Date,
    }),
  );

  const handleDeleteRequest = async () => {
    if (!selectedRow?.Id) {
      toast.error("Invalid request");
      return;
    }

    const { data, error } = await deleteMyRequest(selectedRow.Id);

    if (data) {
      toast.success("Request deleted successfully");

      setShowDeleteConfirm(false);

      onClose(); // close Edit modal

      // optional: refresh dashboard data
      window.location.reload();
    } else {
      toast.error("Failed to delete request");
      console.error(error);
    }
  };

  const handleCloneRequest = () => {
    onClose(); // close Edit modal first

    // open AddRequest modal with selectedRow
    onCloneRequest?.(selectedRow);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.editTabs}>
          {editTabs.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.editTab} ${
                activeEditTab === tab.id ? styles.activeEditTab : ""
              }`}
              onClick={() => setActiveEditTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <div className={styles.reqEditBtnCon}>
          {mode === "VIEW" && (
            <>
              <button
                className={styles.reqEditBtn}
                onClick={() => handleCloneRequest()}
              >
                <i className="fa-solid fa-clone" />
              </button>

              <button
                className={styles.reqEditBtn}
                onClick={() => setIsEditing(true)}
              >
                <i className="fa-solid fa-pen-to-square" />
              </button>

              <button
                className={styles.reqEditBtn}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <i className="fa-solid fa-trash" />
              </button>
            </>
          )}

          {/* clock icon always visible */}
          <button
            className={styles.reqEditBtn}
            onClick={() => setShowHistoryPopup(true)}
          >
            <i className="fa-solid fa-clock" />
          </button>
        </div>
      </div>
      <div>
        {activeEditTab === 0 && (
          <EditRequestInfo
            context={context}
            selectedRow={selectedRow}
            mode={mode}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onClose={onClose}
            refreshData={refreshDashboard}
          />
        )}
        {activeEditTab === 1 && (
          <EditRequestAttachments requestId={selectedRow?.RequestID} />
        )}
        {activeEditTab === 2 && (
          <EditRequestApprovals context={context} selectedRow={selectedRow} />
        )}
        {activeEditTab === 3 && (
          <EditRequestPayment
            context={context}
            selectedRow={selectedRow}
            allRequestPayments={allRequestPayments}
          />
        )}
        {activeEditTab === 4 && (
          <PaymentAction context={context} selectedRow={selectedRow} />
        )}
      </div>
      <SideModal
        title="Approval History"
        visible={showHistoryPopup}
        onHide={() => setShowHistoryPopup(false)}
        size="md"
        animate
      >
        <Table
          value={approvalHistoryTableData}
          dataKey={"Id"}
          loading={false}
          paginator
          rows={10}
          emptyMessage="No history available"
          columns={[
            {
              field: "Name",
              header: "Name",
            },
            {
              field: "Name",
              header: "Name",
            },
            {
              field: "Position",
              header: "Position",
            },
            {
              field: "Status",
              header: "Status",
            },
            {
              field: "Amount",
              header: "Amount",
            },
            {
              field: "Reason",
              header: "Reason",
            },
            {
              field: "Date",
              header: "Date",
            },
          ]}
        />
      </SideModal>

      <SideModal
        title="Delete Request"
        visible={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        size="sm"
        fixedHeight={false}
        animate
      >
        <div className={styles.confirmMsg}>
          Are you sure to delete the Request ?
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <Button
            label="No"
            className={styles.cancelButton}
            onClick={() => setShowDeleteConfirm(false)}
          />
          <Button
            label="Yes"
            className={styles.submitButton}
            onClick={handleDeleteRequest}
          />
        </div>
      </SideModal>
    </div>
  );
}
export default EditMyRequest;

//EditRequestPayment
