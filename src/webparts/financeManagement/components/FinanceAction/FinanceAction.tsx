import * as React from "react";
import styles from "./FinanceActionStyle.module.scss";
import { RequestPaymentData, AccountCategoryData } from "../../../../types";
import InputField from "../InputField/InputField";
import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import {
  fetchAccountChoices,
  fetchRequestPayment,
  updateRequest,
  updateRequestPaymentDetails,
  addNewRequestPaymentDetails,
} from "../../../../CommonServices/PaymentRequestService";
import { toast } from "react-toastify";
import { mapToDropdownOptions } from "../../../../utils/dropdown";

interface FinanceActionProps {
  context: any;
  onClose: () => void;
  selectedRow: any;
  action: string | null;
  refreshData: () => void;
}

interface OnHoldHistory {
  Reason: string;
  Date: string;
  ID: number;
}

interface StopPaymentHistory {
  Reason: string;
  Date: string;
  ID: number;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function FinanceAction({
  context,
  selectedRow,
  onClose,
  action,
  refreshData,
}: FinanceActionProps) {
  const [holdDescription, setHoldDescription] = useState("");
  const [cancelDescription, setCancelDescription] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [onHoldHistory, setOnHoldHistory] = useState<OnHoldHistory[]>([]);
  const [showRightSection, setShowRightSection] = useState(false);
  const [stopPaymentHistory, setStopPaymentHistory] = useState<
    StopPaymentHistory[]
  >([]);
  const [checked, setChecked] = useState(false);
  const [tds, setTds] = useState("");
  const [otherDeduction, setOtherDeduction] = useState("");
  const [finalPayment, setFinalPayment] = useState<number>(0);
  const [invoice, setInvoice] = useState("");

  const [igst, setIgst] = useState("");
  const [cgst, setCgst] = useState("");
  const [sgst, setSgst] = useState("");

  const [paidAmount, setPaidAmount] = useState("");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [accounts, setAccounts] = useState<AccountCategoryData[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [previousAmount, setPreviousAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);

  const [isRightEnabled, setIsRightEnabled] = useState(false);
  const [currentPaymentItem, setCurrentPaymentItem] =
    useState<RequestPaymentData | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  useEffect(() => {
    const loadAccountCategories = async () => {
      const { data, error } = await fetchAccountChoices();
      if (data) {
        setAccounts(data);
      } else {
        toast.error("Failed to load roles");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadAccountCategories();
  }, []);

  useEffect(() => {
    if (!selectedRow?.OnHoldPaymentReason) {
      setOnHoldHistory([]);
      return;
    }

    try {
      const history = JSON.parse(selectedRow.OnHoldPaymentReason);
      setOnHoldHistory(history);
    } catch (err) {
      console.error("Invalid OnHoldPaymentReason JSON");
      setOnHoldHistory([]);
    }
  }, [selectedRow]);

  const handleOnHold = async () => {
    if (!holdDescription) {
      toast.warn("Please enter the reason for holding the payment.");
      return;
    }

    try {
      // Copy old history
      const history = [...onHoldHistory];

      // Get next ID
      const lastId =
        history.length > 0 ? Math.max(...history.map((h) => h.ID)) : 0;

      // Add new reason
      history.push({
        Reason: holdDescription,
        Date: new Date().toLocaleDateString("en-GB"),
        ID: lastId + 1,
      });

      // Convert to JSON
      const historyJson = JSON.stringify(history);

      // Update SharePoint
      await updateRequest(selectedRow.ID, {
        FinanceTeamAction: "On Hold",
        IsScheduled: false,
        PaymentScheduledDate: null,
        OnHoldPaymentReason: historyJson,
      });

      toast.success("Request updated successfully");
      await refreshData();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  ////////////////////////////////////////////////////

  useEffect(() => {
    if (!selectedRow?.StopPaymentReason) {
      setStopPaymentHistory([]);
      return;
    }

    try {
      const parsedHistory = JSON.parse(selectedRow.StopPaymentReason);
      setStopPaymentHistory(parsedHistory);
    } catch (error) {
      console.error("Invalid StopPaymentReason JSON");
      setStopPaymentHistory([]);
    }
  }, [selectedRow]);

  const handleCancelPayment = async () => {
    if (!cancelDescription) {
      toast.warn("Please enter the reason for canceling the payment.");
      return;
    }

    try {
      const history = [...stopPaymentHistory];

      const lastId =
        history.length > 0 ? Math.max(...history.map((h) => h.ID)) : 0;

      history.push({
        Reason: cancelDescription,
        Date: new Date().toLocaleDateString("en-GB"),
        ID: lastId + 1,
      });

      const historyJson = JSON.stringify(history);

      await updateRequest(selectedRow.ID, {
        FinanceTeamAction: "Cancel Payment",
        PaymentProcess: "Completed",
        StopPaymentReason: historyJson,
        IsScheduled: false,
      });

      toast.success("Request updated successfully");
      await refreshData();
      onClose();
    } catch (error) {
      console.error("Error cancelling payment:", error);
    }
  };

  ////////////////////////////////////////////////////////////

  const handleSchedulePayment = async () => {
    // Validation 1: Empty date
    if (!scheduleDate) {
      toast.warn("Please select the schedule date before submit.");
      return;
    }

    // Validation 2: Past date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (scheduleDate < today) {
      toast.error("You cannot select a past date. Please choose a valid date.");
      return;
    }

    try {
      await updateRequest(selectedRow.ID, {
        FinanceTeamAction: "Schedule Payment",
        PaymentScheduledDate: scheduleDate,
        IsScheduled: true,
      });

      toast.success("Request updated successfully");
      await refreshData();
      onClose();
    } catch (error) {
      console.error("Error scheduling payment:", error);
    }
  };

  const handleUpdate = async () => {
    const finalApproved = Number(selectedRow?.FinalApprovedAmount || 0);

    const tdsVal = Number(tds || 0);
    const otherVal = Number(otherDeduction || 0);

    const igstVal = Number(igst || 0);
    const cgstVal = Number(cgst || 0);
    const sgstVal = Number(sgst || 0);

    const finalAmount = finalApproved - tdsVal - otherVal;

    // validations
    if (finalAmount <= 0) {
      toast.warn("Please enter valid amounts");
      return;
    }

    if (checked && igstVal <= 0 && cgstVal <= 0 && sgstVal <= 0) {
      toast.warn("Please enter GST Amount");
      return;
    }

    if (cgstVal > 0 && sgstVal <= 0) {
      toast.warn("Please enter SGST Amount");
      return;
    }

    if (sgstVal > 0 && cgstVal <= 0) {
      toast.warn("Please enter CGST Amount");
      return;
    }

    if (igstVal > 0 && (cgstVal > 0 || sgstVal > 0)) {
      toast.warn("Enter either IGST OR CGST + SGST");
      return;
    }

    try {
      // fetch previous payments
      const response = await fetchRequestPayment();

      const previousPayments =
        response.data?.filter(
          (item) => item.ParentReqPayID === currentPaymentItem?.ID,
        ) || [];

      const alreadyPaidAmount = previousPayments.reduce(
        (acc, curr) => acc + (curr.Amount || 0),
        0,
      );

      if (alreadyPaidAmount > finalAmount) {
        toast.error("Already paid more than final amount");
        return;
      }

      // CASE 1: UPDATE existing finance record
      // if (currentPaymentItem?.ID) {
      console.log("currentPaymentItem before update:", currentPaymentItem);
      if (currentPaymentItem && !currentPaymentItem.ParentReqPayID) {
        await updateRequestPaymentDetails(currentPaymentItem.ID, {
          // AprvdAmount: finalApproved,
          AprvdAmount: Number(selectedRow.FinalApprovedAmount),
          //FinalAmount: finalAmount,
          TDS: tdsVal,
          OtherDeductions: otherVal,
          GSTIN: checked,
          IGSTAmount: igstVal,
          CGSTAmount: cgstVal,
          SGST: sgstVal,
          InvoiceNumber: invoice,
          RequestID: selectedRow.ID,
        });
      }
      // CASE 2: CREATE new finance record
      else {
        await addNewRequestPaymentDetails({
          AprvdAmount: Number(selectedRow.FinalApprovedAmount),
          RequestID: selectedRow.ID,
          //FinalAmount: finalAmount,
          TDS: tdsVal,
          OtherDeductions: otherVal,
          GSTIN: checked,
          IGSTAmount: igstVal,
          CGSTAmount: cgstVal,
          SGST: sgstVal,
          InvoiceNumber: invoice,
        });
      }

      // update invoice in main request list if changed
      if (selectedRow.InvoiceNumber !== invoice || !selectedRow.InvoiceNumber) {
        await updateRequest(selectedRow.ID, {
          InvoiceNumber: invoice,
          InvoiceNotApplicable: invoice ? false : true,
        });
      }

      // check if fully paid
      const balance = finalAmount - alreadyPaidAmount;

      if (balance === 0) {
        await updateRequest(selectedRow.ID, {
          PaymentProcess: "Completed",
          PaymentCompletedDate: new Date(),
          FinanceTeamAction: "Proceed Payment",
          IsScheduled: false,
        });
      }

      toast.success("Updated successfully");

      const refreshed = await fetchRequestPayment();

      if (refreshed.data) {
        const updatedFinanceRow = refreshed.data.find(
          (item) => item.RequestID === selectedRow.ID && !item.ParentReqPayID,
        );

        setCurrentPaymentItem(updatedFinanceRow ?? null);

        const previousPayments = refreshed.data.filter(
          (item) => item.ParentReqPayID === updatedFinanceRow?.ID,
        );

        const totalPreviousAmount = previousPayments.reduce(
          (acc, curr) => acc + Number(curr.Amount || 0),
          0,
        );

        setPreviousAmount(totalPreviousAmount);

        const baseAmount =
          updatedFinanceRow?.FinalAmount ??
          selectedRow.FinalApprovedAmount ??
          0;

        setBalanceAmount(baseAmount - totalPreviousAmount);
      }

      // enable right container automatically
      setIsEditMode(false);
      setIsRightEnabled(true);
      setShowRightSection(true);
      setIsNewRecord(false);
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    }
  };

  const handleProceedPayment = async () => {
    const amount = Number(paidAmount || 0);

    if (!scheduleDate) {
      toast.warn("Please select date");
      return;
    }

    if (!amount || amount <= 0) {
      toast.warn("Please enter valid amount");
      return;
    }

    if (amount > balanceAmount) {
      toast.warn("Amount is greater than Approved Amount");
      return;
    }

    if (!selectedAccount) {
      toast.warn("Please select account");
      return;
    }

    try {
      if (!currentPaymentItem?.ID) {
        toast.error("Payment header record missing");
        return;
      }

      // STEP 1 — Insert payment record
      await addNewRequestPaymentDetails({
        Date: scheduleDate,
        Amount: amount,
        Reference: reference,
        Remarks: remarks,
        ParentReqPayID: currentPaymentItem.ID,
        //AccountId: selectedAccount.ID
        Account: selectedAccount?.name,
      });

      toast.success("Payment Details added successfully");

      // STEP 2 — Refresh SharePoint dataset
      const refreshed = await fetchRequestPayment();

      if (refreshed.data) {
        const updatedFinanceRow = refreshed.data.find(
          (item) => item.RequestID === selectedRow.ID && !item.ParentReqPayID,
        );

        const previousPayments = refreshed.data.filter(
          (item) => item.ParentReqPayID === updatedFinanceRow?.ID,
        );

        const totalPaid = previousPayments.reduce(
          (acc, curr) => acc + Number(curr.Amount || 0),
          0,
        );

        const finalAmount =
          updatedFinanceRow?.FinalAmount ??
          selectedRow.FinalApprovedAmount ??
          0;

        // STEP 3 — Update balance UI
        setPreviousAmount(totalPaid);
        setBalanceAmount(finalAmount - totalPaid);

        // STEP 4 — Only mark completed if fully paid
        if (finalAmount - totalPaid <= 0) {
          await updateRequest(selectedRow.ID, {
            PaymentProcess: "Completed",
            PaymentCompletedDate: new Date(),
            PaymentCompletedMonth: new Date().getMonth() + 1,
            PaymentCompletedYear: new Date().getFullYear(),
            IsScheduled: false,
            FinanceTeamAction: "Proceed Payment",
          });
        }
      }

      // STEP 5 — Reset form
      setPaidAmount("");
      setReference("");
      setRemarks("");
      setScheduleDate(null);
      await refreshData();
      onClose();
    } catch (error) {
      console.error(error);
      //toast.error("Failed to process payment");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchRequestPayment();

      if (response.error || !response.data) return;

      const allPayments = response.data;

      const paymentItem = allPayments.find(
        (item) => item.RequestID === selectedRow.ID && !item.ParentReqPayID,
      );

      setCurrentPaymentItem(paymentItem ?? null);

      let balance = 0;
      let totalPreviousAmount = 0;

      if (paymentItem) {
        const previousPayments = allPayments.filter(
          (item) => item.ParentReqPayID === paymentItem.ID,
        );

        totalPreviousAmount = previousPayments.reduce(
          (acc, curr) => acc + Number(curr.Amount || 0),
          0,
        );

        //balance = Number(paymentItem.FinalAmount || 0) - totalPreviousAmount;
        const baseAmount =
          paymentItem?.FinalAmount ?? selectedRow?.FinalApprovedAmount ?? 0;

        balance = baseAmount - totalPreviousAmount;
      }

      setPreviousAmount(Number(totalPreviousAmount.toFixed(2)));
      setBalanceAmount(Number(balance.toFixed(2)));

      // preserve your panel logic
      if (paymentItem?.ID) {
        setIsRightEnabled(true);
        setIsNewRecord(false);
        setIsEditMode(false);
        setShowRightSection(true);
      } else {
        setIsRightEnabled(false);
        setShowRightSection(false);
        setIsNewRecord(true);
        setIsEditMode(true);
      }
    };

    if (selectedRow) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      loadData();
    }
  }, [selectedRow]);

  useEffect(() => {
    const total = Number(selectedRow?.FinalApprovedAmount || 0);
    const tdsVal = Number(tds || 0);
    const otherVal = Number(otherDeduction || 0);

    const result = total - tdsVal - otherVal;

    setFinalPayment(result > 0 ? result : 0);
  }, [tds, otherDeduction, selectedRow]);

  const invoiceValue =
    currentPaymentItem?.InvoiceNumber || selectedRow?.InvoiceNumber || "";

  useEffect(() => {
    if (!currentPaymentItem && !selectedRow) return;

    const gstValue = currentPaymentItem?.GSTIN ?? selectedRow?.GSTIN ?? false;

    setChecked(gstValue);
  }, [currentPaymentItem, selectedRow]);

  const formatCurrency = (value: number | null | undefined) => {
    if (!value || value <= 0) return "0";

    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const igstValue =
    checked && (currentPaymentItem?.IGSTAmount ?? 0) > 0
      ? formatCurrency(currentPaymentItem?.IGSTAmount ?? 0)
      : "";

  const cgstValue =
    checked &&
    !igst && // IGST is blank
    (currentPaymentItem?.CGSTAmount ?? 0) > 0
      ? formatCurrency(currentPaymentItem?.CGSTAmount ?? 0)
      : "";

  const sgstValue =
    checked && (!igst || Number(igst) === 0)
      ? (currentPaymentItem?.SGST ?? 0) > 0
        ? formatCurrency(currentPaymentItem?.SGST ?? 0)
        : cgst || "" // fallback to CGST input
      : "";

  const restoreOriginalValues = () => {
    if (!currentPaymentItem) return;

    setTds(String(currentPaymentItem.TDS ?? ""));
    setOtherDeduction(String(currentPaymentItem.OtherDeductions ?? ""));
    setInvoice(currentPaymentItem.InvoiceNumber ?? "");
    setIgst(String(currentPaymentItem.IGSTAmount ?? ""));
    setCgst(String(currentPaymentItem.CGSTAmount ?? ""));
    setSgst(String(currentPaymentItem.SGST ?? ""));
    setChecked(currentPaymentItem.GSTIN ?? false);
  };

  useEffect(() => {
    if (currentPaymentItem) {
      setTds(String(currentPaymentItem.TDS ?? ""));
      setOtherDeduction(String(currentPaymentItem.OtherDeductions ?? ""));
    }
  }, [currentPaymentItem]);

  return (
    <div>
      {action === "On Hold" && (
        <>
          {onHoldHistory.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h4>Previous Hold Reasons</h4>

              {onHoldHistory.map((item) => (
                <div key={item.ID}>
                  <strong>{item.Date}</strong> - {item.Reason}
                </div>
              ))}
            </div>
          )}
          <InputField
            type="input-textarea"
            label="Are you sure want to hold the payment for this request?"
            id="description"
            placeholder="Enter"
            autoResize
            value={holdDescription}
            onChange={(e) => setHoldDescription(e.target.value)}
            rows={5}
            className="w-full"
          />
          <div className={styles.confirmButtons}>
            <Button
              className={styles.cancelButton}
              label="No"
              onClick={onClose}
            />
            <Button
              className={styles.submitButton}
              label="Yes"
              onClick={handleOnHold}
            />
          </div>
        </>
      )}

      {action === "Cancel Payment" && (
        <>
          {stopPaymentHistory.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h4>Previous Cancel Reasons</h4>

              {stopPaymentHistory.map((item) => (
                <div key={item.ID}>
                  <strong>{item.Date}</strong> - {item.Reason}
                </div>
              ))}
            </div>
          )}
          <InputField
            type="input-textarea"
            label="Are you sure want to cancel the payment for this request?"
            id="description"
            placeholder="Enter"
            autoResize
            value={cancelDescription}
            onChange={(e) => setCancelDescription(e.target.value)}
            rows={5}
            className="w-full"
          />
          <div className={styles.confirmButtons}>
            <Button
              className={styles.cancelButton}
              label="No"
              onClick={onClose}
            />
            <Button
              className={styles.submitButton}
              label="Yes"
              onClick={handleCancelPayment}
            />
          </div>
        </>
      )}

      {action === "Schedule Payment" && (
        <>
          <InputField
            type="calendar"
            label="Deadline"
            id="deadline"
            placeholder="Deadline"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.value ?? null)}
            className="w-full"
          />
          <div className={styles.confirmButtons}>
            <Button
              className={styles.cancelButton}
              label="No"
              onClick={onClose}
            />
            <Button
              className={styles.submitButton}
              label="Yes"
              onClick={handleSchedulePayment}
            />
          </div>
        </>
      )}

      {action === "Proceed Payment" && (
        <>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Payment Info</div>

            <div
              className={styles.sectionArrow}
              onClick={() => {
                if (!isRightEnabled) {
                  toast("Please complete payment info details first");
                  return;
                }

                setShowRightSection(!showRightSection);
              }}
            >
              <div
                className={`${styles.sectionArrow} ${
                  !isRightEnabled ? styles.disabledArrow : ""
                }`}
                onClick={() => {
                  if (!isRightEnabled) return;
                  setShowRightSection(!showRightSection);
                }}
              >
                {showRightSection ? "❮" : "❯"}
              </div>
            </div>
          </div>

          <div className={styles.paymentInfoSection}>
            <div>
              <div className={styles.proceedPaymentLeftCon}>
                {currentPaymentItem && !isEditMode && (
                  <Button
                    label="Edit"
                    icon="pi pi-pencil"
                    className={styles.editButton}
                    onClick={() => setIsEditMode(true)}
                  />
                )}
                <InputField
                  type="input-text"
                  label="Total Amount"
                  value={selectedRow?.FinalApprovedAmount || ""}
                  className="w-full"
                  disabled
                />
                <InputField
                  type="input-text"
                  label="TDS (if any)"
                  // value={
                  //tds !== "" ? tds : formatCurrency(currentPaymentItem?.TDS)
                  //}
                  value={tds}
                  onChange={(e) => setTds(e.target.value)}
                  className="w-full"
                  disabled={!isEditMode}
                />{" "}
                <InputField
                  type="input-text"
                  label="Other Deduction (if any)"
                  // value={
                  // otherDeduction !== ""
                  //   ? otherDeduction
                  //  : formatCurrency(currentPaymentItem?.OtherDeductions)
                  //}
                  value={otherDeduction}
                  onChange={(e) => setOtherDeduction(e.target.value)}
                  className="w-full"
                  disabled={!isEditMode}
                />
                <InputField
                  type="input-text"
                  label="Final Payment"
                  value={formatCurrency(finalPayment)}
                  className="w-full"
                  disabled
                />{" "}
                <InputField
                  type="input-text"
                  label="Invoice Number"
                  value={invoice || invoiceValue}
                  onChange={(e) => setInvoice(e.target.value)}
                  className="w-full"
                  disabled={!isEditMode}
                />{" "}
                <div>
                  <label className={styles.checkboxlbl}>GST Payment</label>

                  <input
                    className={styles.checkBox}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked ?? false)}
                    disabled={!isEditMode}
                  />
                </div>
                <InputField
                  type="input-text"
                  label="IGST Amount"
                  value={igst || igstValue}
                  onChange={(e) => setIgst(e.target.value)}
                  className="w-full"
                  disabled={!isEditMode}
                />{" "}
                {/*<InputField
                  type="input-text"
                  value={cgst || cgstValue}
                  label="CGST Amount"
               
                  onChange={(e) => setCgst(e.target.value)}
                  className="w-full"
                  disabled={!isEditMode}
                />{" "}*/}
                <InputField
                  type="input-text"
                  value={cgst || cgstValue}
                  label="CGST Amount"
                  onChange={(e) => {
                    setCgst(e.target.value);
                    setSgst(e.target.value); // Automatically set SGST same as CGST
                  }}
                  className="w-full"
                  disabled={!isEditMode}
                />
                <InputField
                  type="input-text"
                  label="SGST Amount"
                  value={sgst || sgstValue}
                  onChange={(e) => setSgst(e.target.value)}
                  className="w-full"
                  disabled={!isEditMode}
                />{" "}
              </div>
              {(isNewRecord || isEditMode) && (
                <div className={styles.buttonsContainer}>
                  <Button
                    className={styles.cancelButton}
                    label="Cancel"
                    onClick={() => {
                      if (isNewRecord) {
                        onClose();
                      } else {
                        restoreOriginalValues();
                        setIsEditMode(false);
                      }
                    }}
                  />
                  <Button
                    className={styles.submitButton}
                    label={isNewRecord ? "Submit" : "Update"}
                    onClick={handleUpdate}
                    disabled={!isEditMode}
                  />
                </div>
              )}
            </div>

            <div
              className={`${styles.proceedPaymentRightCon} ${
                showRightSection ? styles.openPanel : ""
              }`}
            >
              <div className={styles.balanceHeader}>
                Balance Amount: ₹ {balanceAmount.toFixed(2)}
              </div>
              <InputField
                type="calendar"
                label="Date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.value ?? null)}
                className="w-full"
                labelClassName={styles.categoryLabel}
              />
              <InputField
                type="input-text"
                label="Paid Amount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full"
                labelClassName={styles.categoryLabel}
              />{" "}
              <InputField
                type="dropdown"
                label="Account"
                //bind your account list here
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.value)}
                options={mapToDropdownOptions(accounts, {
                  label: (a) => a.code,
                  value: (a) => a,
                })}
                placeholder="Select"
                className="w-full"
                labelClassName={styles.categoryLabel}
              />
              <InputField
                type="input-text"
                label="Reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full"
              />
              <InputField
                type="input-textarea"
                label="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full"
              />
              <div className={styles.buttonsContainer}>
                <Button
                  className={styles.cancelButton}
                  label="No"
                  onClick={onClose}
                />
                <Button
                  className={styles.submitButton}
                  label="Yes"
                  onClick={handleProceedPayment}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default FinanceAction;
