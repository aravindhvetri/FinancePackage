import * as React from "react";
import styles from "./EditMyRequestPaymentStyle.module.scss";
import {useMemo } from "react";
import Table from "../Table/Table";

interface EditRequestPaymentProps {
  context: any;
  selectedRow: any | undefined;
  allRequestPayments: any | undefined;
}

function EditRequestPayment({
  context,
  selectedRow,
  allRequestPayments,
}: EditRequestPaymentProps) {
  console.log("demo", selectedRow);

  const payment = useMemo(() => {
    if (!selectedRow || !allRequestPayments?.length) return undefined;

    return allRequestPayments.find((p?: any) => p.RequestID === selectedRow.ID);
  }, [selectedRow, allRequestPayments]);

  const paymentGallery = React.useMemo(() => {
    if (!payment || !allRequestPayments?.length) return [];

    return allRequestPayments.filter(
      (p?: any) => p.ParentReqPayID === payment.ID,
    );
  }, [payment, allRequestPayments]);

  const formatCurrencyINR = (value?: number) => {
   if (value === null || value === undefined) return "₹ 0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDateMMDDYY = (date?: string | Date) => {
  if (!date) return "-";

  const d = new Date(date);

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);

  return `${mm}/${dd}/${yy}`;
};

const formatCGST = (cgst?: number, isGST?: boolean) => {
  if (!isGST) return "₹ 0.00";

  if (cgst === null || cgst === undefined || cgst <= 0) {
    return "₹ 0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(cgst);
};

  return (
    <div className={styles.paymentInfoSection}>
      <div className={styles.sectionTitle}>Payment Info</div>

      <div className={styles.paymentGrid}>
        <div>
          <label>Invoice Number</label>
          <input readOnly value={selectedRow?.InvoiceNumber || "-"} />
        </div>

        <div>
          <label>Final Amount</label>
          <input readOnly value={formatCurrencyINR(payment?.FinalAmount)} />
        </div>

        <div>
          <label>Approved Amount</label>
          <input readOnly value={formatCurrencyINR(payment?.AprvdAmount)} />
        </div>

        <div>
          <label>IGST Amount</label>
          <input readOnly value={formatCurrencyINR(payment?.IGSTAmount)} />
        </div>

        <div>
          <label>TDS</label>
          <input readOnly value={formatCurrencyINR(payment?.TDS)} />
        </div>

        <div>
          <label>CGST Amount</label>
          <input readOnly value={formatCGST(payment?.CGSTAmount, payment?.GSTIN)}/>
        </div>

        <div>
          <label>Other Deductions</label>
          <input readOnly value={formatCurrencyINR(payment?.OtherDeductions)}/>
        </div>

        <div>
          <label>SGST Amount</label>
          <input readOnly value={formatCGST(payment?.SGST, payment?.GSTIN)} />
        </div>
      </div>
      <div className={styles.paymentTable}>
        <Table
          value={paymentGallery}
          dataKey={"Id"}
          loading={!paymentGallery}
          paginator={false}
          rows={paymentGallery?.length || 0}
          emptyMessage="No data available"
          columns={[
            { field: "Date", header: "Date", body: (rowData: any) => formatDateMMDDYY(rowData.Date), },
            { field: "Amount", header: "Amount" },
            { field: "Reference", header: "Reference" },
            { field: "Account", header: "Account" },
            {
              field: "Remarks",
              header: "Remarks",
              //body: (rowData) => rowBudget(rowData),
            },
          ]}
        />
      </div>
    </div>
  );
}
export default EditRequestPayment;
