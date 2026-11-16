import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./PaymentHistoryForVendorOrFreelancerStyles.module.scss";
import Table from "../Table/Table";
import {
  fetchPaymentRequests,
  fetchRequestPayment,
} from "../../../../CommonServices/PaymentRequestService";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { formatCurrency } from "../../../../utils/number";
import loaderLogo from "../../../../assets/TechnoRUCSLogo.png";
import InputField from "../InputField/InputField";

interface PaymentHistoryDashboardProps {
  context: any;
  navigateType: "vendor" | "freelancer";
  navigateId: number | null;
  onBack: () => void;
}

function PaymentHistoryForVendorOrFreelancerDashboard({
  context,
  navigateType,
  navigateId,
  onBack,
}: PaymentHistoryDashboardProps) {
  const [mergedData, setMergedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const monthOptions = [
    { label: "All Months", value: "" },
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const loadPaymentHistory = async () => {
    if (!navigateId) return;

    setLoading(true);

    try {
      const paymentRes = await fetchPaymentRequests();
      const requestPayRes = await fetchRequestPayment();

      const paymentRequests = paymentRes.data || [];
      const requestPayments = requestPayRes.data || [];

      let filteredRequests = paymentRequests;

      // Month filter
      if (selectedMonth) {
        filteredRequests = filteredRequests.filter(
          (item) => item.PaymentCompletedMonth === selectedMonth,
        );
      }

      // Year filter
      if (selectedYear) {
        filteredRequests = filteredRequests.filter(
          (item) => item.PaymentCompletedYear === selectedYear,
        );
      }

      // vendor filter
      if (navigateType === "vendor") {
        filteredRequests = filteredRequests.filter(
          (item) => item.VendorName?.Id === navigateId,
        );
      }

      // freelancer filter
      if (navigateType === "freelancer") {
        filteredRequests = filteredRequests.filter(
          (item) => item.PaymentFor?.Id === navigateId,
        );
      }

      // parent records
      const parentPayments = requestPayments.filter((rp) =>
        filteredRequests.some((pr) => pr.Id === rp.RequestID),
      );

      const mergedCollection = parentPayments.flatMap((parentRec) => {
        const parentRequest = filteredRequests.find(
          (item) => item.Id === parentRec.RequestID,
        );

        if (!parentRequest) return [];

        // 🔑 child rows (these contain amount/account/date)
        const childPayments = requestPayments.filter(
          (rp) => Number(rp.ParentReqPayID) === Number(parentRec.Id),
        );

        return childPayments.map((child) => ({
          id: child.Id,

          requestId: parentRequest.RequestID,

          paymentTo:
            parentRequest.PaymentType === "Freelancer Payment"
              ? parentRequest.PaymentFor?.FreelancerName
              : parentRequest.VendorName?.VendorName,

          paymentType: parentRequest.PaymentType,

          finalApprovedAmount: parentRequest.FinalApprovedAmount,

          // child values
          amount: Number(child.Amount || 0),

          account: child.Account || "-",

          date: child.Date
            ? new Date(child.Date).toLocaleDateString("en-GB")
            : "-",

          remarks: child.Remarks || "-",

          // parent values
          tds: Number(parentRec.TDS || 0),

          cgst: Number(parentRec.CGSTAmount || 0),

          sgst: Number(parentRec.SGST || 0),

          igst: Number(parentRec.IGSTAmount || 0),
        }));
      });

      setMergedData(mergedCollection);
    } catch (error) {
      console.error("Payment history load failed", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!mergedData.length) return;

    const exportData = mergedData.map((row) => ({
      "Request ID": row.requestId,
      "Payment To": row.paymentTo,
      "Payment Type": row.paymentType,
      "Invoice Amount": row.finalApprovedAmount,
      CGST: row.cgst,
      SGST: row.sgst,
      IGST: row.igst,
      TDS: row.tds,
      "Paid Amount": row.amount,
      Account: row.account,
      "Paid Date": row.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "PaymentHistory");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    FileSaver.saveAs(blob, "PaymentHistory.xlsx");
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadPaymentHistory();
  }, [navigateType, navigateId, selectedMonth, selectedYear]);

  const renderAmountOrDash = (value: number | undefined | null) =>
    value ? formatCurrency(value) : "-";

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <button className={styles.exportBtn} onClick={exportToExcel}>
          Export Excel
        </button>
      </div>
      <div className={styles.filterRow}>
        <InputField
          type="dropdown"
          id="monthFilter"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.value ? Number(e.value) : null)}
          options={monthOptions}
          placeholder="All Months"
          className={styles.filterDropdownOptions}
        />

        <InputField
          type="dropdown"
          id="yearFilter"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.value ? Number(e.value) : null)}
          options={[
            { label: "All Years", value: "" },
            ...Array.from(
              { length: today.getFullYear() - 2023 + 1 },
              (_, i) => ({
                label: String(2023 + i),
                value: 2023 + i,
              }),
            ),
          ]}
          placeholder="All Years"
          className={styles.filterDropdownOptions}
        />
      </div>

      {loading ? (
        <div className={styles.loaderWrapper}>
          <img
            src={loaderLogo}
            alt="Loading..."
            className={styles.loaderImage}
          />
        </div>
      ) : (
        <Table
          value={mergedData}
          dataKey={"id"}
          loading={loading}
          paginator
          rows={10}
          emptyMessage="No payment history found"
          columns={[
            { field: "requestId", header: "Request ID" },

            { field: "paymentTo", header: "Payment To" },
            { field: "paymentType", header: "Payment Type" },
            {
              //field: "finalApprovedAmount",
              header: "Invoice Amount",
              body: (rowData) =>
                renderAmountOrDash(rowData.finalApprovedAmount),
            },
            {
              //field: "cgst",
              header: "CGST",
              body: (rowData) => renderAmountOrDash(rowData.cgst),
            },
            {
              //field: "sgst",
              header: "SGST",
              body: (rowData) => renderAmountOrDash(rowData.sgst),
            },
            {
              //field: "igst",
              header: "IGST",
              body: (rowData) => renderAmountOrDash(rowData.igst),
            },
            {
              //field: "tds",
              header: "TDS",
              body: (rowData) => renderAmountOrDash(rowData.tds),
            },
            {
              //field: "amount",
              header: "Paid Amount",
              body: (rowData) =>
                rowData.amount ? formatCurrency(rowData.amount) : "-",
            },
            {
              //field: "account",
              header: "Account",
              body: (rowData) => rowData.account || "-",
            },
            {
              //field: "date",
              header: "Paid Date",
              body: (rowData) => rowData.date || "-",
            },
          ]}
        />
      )}
    </div>
  );
}

export default PaymentHistoryForVendorOrFreelancerDashboard;
