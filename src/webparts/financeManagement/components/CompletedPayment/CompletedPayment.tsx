import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./CompletedPaymentStyle.module.scss";
import { PaymentRequestData, RequestPaymentData } from "../../../../types";
import Table from "../Table/Table";
import {
  fetchPaymentRequests,
  fetchRequestPayment,
} from "../../../../CommonServices/PaymentRequestService";
import { formatCurrency } from "../../../../utils/number";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import loaderLogo from "../../../../assets/TechnoRUCSLogo.png";
import InputField from "../InputField/InputField";

interface CompletedPaymentDashboardProps {
  context: any;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function CompletedPaymentDashboard({
  context,
}: CompletedPaymentDashboardProps) {
  const [mergedData, setMergedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState<number>(
    today.getMonth() + 1,
  );

  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [searchText, setSearchText] = useState<string>("");
  const [requestPaymentData, setRequestPaymentData] = useState<
    RequestPaymentData[]
  >([]);
  const [expandedRows, setExpandedRows] = useState<any>(null);

  const monthOptions = [
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

  const fetchCompletedMonthlyDashboard = async () => {
    setLoading(true);
    try {
      // 1Fetch both lists
      const paymentRes = await fetchPaymentRequests();
      const requestPayRes = await fetchRequestPayment();

      const paymentRequests = paymentRes.data || [];
      const requestPayments = requestPayRes.data || [];
      setRequestPaymentData(requestPayments);

      // Filter PaymentRequestDetails (current month + completed)
      const completedRequests = paymentRequests.filter(
        (pr) =>
          pr.PaymentCompletedMonth === selectedMonth &&
          pr.PaymentCompletedYear === selectedYear &&
          (pr.PaymentProcess === "Completed" ||
            (pr.PaymentProcess as any)?.Value === "Completed"),
      );

      // Build lookup maps
      const paymentRequestMap = new Map(
        completedRequests.map((pr) => [pr.Id, pr]),
      );

      const requestPaymentMap = new Map(
        requestPayments.map((rp) => [rp.Id, rp]),
      );

      //  Filter parent RequestPaymentDetails
      const parentPayments = requestPayments.filter((rp) =>
        paymentRequestMap.has(rp.RequestID),
      );

      const merged = parentPayments
        .map((parent) => {
          const children = requestPayments.filter(
            (rp) => rp.ParentReqPayID === parent.Id,
          );

          const pr = paymentRequestMap.get(parent.RequestID);
          if (!pr) return null;

          let paymentTo = "N/A";
          const paymentType = pr.PaymentType;

          if (
            paymentType !== "Employee benefits" &&
            paymentType !== "Reimbursement" &&
            paymentType !== "Freelancer Payment"
          ) {
            if (pr.VendorName?.VendorName) {
              paymentTo = pr.VendorName.VendorName;
            } else if (paymentType === "Salary") {
              paymentTo = pr.PersonName?.Title || "-";
            } else {
              paymentTo = "No selection";
            }
          } else if (
            paymentType === "Employee benefits" ||
            paymentType === "Reimbursement"
          ) {
            paymentTo = pr.PersonName?.Title || "-";
          } else if (paymentType === "Freelancer Payment") {
            paymentTo = pr.PaymentFor?.FreelancerName || "-";
          }

          const totalPaid = children.reduce(
            (sum, c) => sum + Number(c.Amount || 0),
            0,
          );

          return {
            Id: parent.Id,
            date:
              children.length === 1
                ? children[0].Date
                  ? new Date(children[0].Date).toLocaleDateString("en-GB")
                  : ""
                : children.length === 0
                  ? parent.Date
                    ? new Date(parent.Date).toLocaleDateString("en-GB")
                    : ""
                  : "-",
            accountType:
              children.length === 1
                ? children[0].Account || "-"
                : children.length === 0
                  ? parent.Account || "-"
                  : "-",

            requestID: pr.RequestID,
            reqId: parent.RequestID,
            paymentType,
            paymentTo,
            personName: pr.PersonName?.Title,
            personEmail: pr.PersonName?.EMail,
            month: pr.PaymentCompletedMonth,
            year: pr.PaymentCompletedYear,
            FinalApprovedAmount: pr.FinalApprovedAmount,
            cgst: Number(parent.CGSTAmount || 0),
            sgst: Number(parent.SGST || 0),
            igst: Number(parent.IGSTAmount || 0),
             tds: Number(parent.TDS || 0),
            totalPaid,
            children:
              children.length > 0
                ? children.map((child) => ({
                    date: child.Date
                      ? new Date(child.Date).toLocaleDateString("en-GB")
                      : "",
                    amount: Number(child.Amount),
                    accountType: child.Account,
                    reference: child.Reference,
                    remarks: child.Remarks,
                  }))
                : [
                    {
                      date: parent.Date
                        ? new Date(parent.Date).toLocaleDateString("en-GB")
                        : "",
                      amount: Number(parent.Amount || 0),
                      accountType: parent.Account,
                      reference: parent.Reference,
                      remarks: parent.Remarks,
                    },
                  ],
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      let finalData = merged;
      if (searchText) {
        const search = searchText.toLowerCase();

        finalData = merged.filter((item) => {
          const childMatch =
            item.children?.some((child: any) => {
              const date = child.date
                ? new Date(child.date).toLocaleDateString("en-GB")
                : "";

              return (
                (child.amount || "").toString().includes(search) ||
                (child.accountType || "").toLowerCase().includes(search) ||
                (child.reference || "").toLowerCase().includes(search) ||
                (child.remarks || "").toLowerCase().includes(search) ||
                date.toLowerCase().includes(search)
              );
            }) ?? false;

          return (
            (item.paymentTo || "").toLowerCase().includes(search) ||
            (item.personName || "").toLowerCase().includes(search) ||
            (item.paymentType || "").toLowerCase().includes(search) ||
            (item.requestID || "").toString().includes(search) ||
            (item.totalPaid || "").toString().includes(search) ||
            childMatch
          );
        });
      }

      setMergedData(finalData);
    } catch (error) {
      console.error("Error loading monthly completed dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function rowTaxableAmount(rowData: PaymentRequestData) {
    const record = requestPaymentData.find(
      (item) => item.Id === rowData.Id, //item.RequestID === rowData.Id,
    );

    if (!record) {
      return <span>{formatCurrency(rowData.FinalApprovedAmount)}</span>;
    }

    const cgst = Number(record.CGSTAmount || 0);
    const sgst = Number(record.SGST || 0);
    const igst = Number(record.IGSTAmount || 0);

    const totalGST = cgst + sgst + igst;

    const taxableAmount =
      totalGST > 0
        ? Number(rowData.FinalApprovedAmount || 0) - totalGST
        : Number(rowData.FinalApprovedAmount || 0);
    return <span>{formatCurrency(taxableAmount)}</span>;
  }

  function rowGSTAmount(rowData: PaymentRequestData) {
    const record = requestPaymentData.find(
      (item) => item.Id === rowData.Id, //item.RequestID === rowData.Id,
    );

    if (!record) {
      return <span>{formatCurrency(0)}</span>;
    }

    const cgst = Number(record.CGSTAmount || 0);
    const sgst = Number(record.SGST || 0);
    const igst = Number(record.IGSTAmount || 0);

    const totalGST = cgst + sgst + igst;

    return <span>{formatCurrency(totalGST)}</span>;
  }

  function rowApprovedAmount(rowData: PaymentRequestData) {
    return <span>{formatCurrency(rowData.FinalApprovedAmount)}</span>;
  }

  function rowTDSAmount(rowData: PaymentRequestData) {
    const record = requestPaymentData.find(
      (item) => item.Id === rowData.Id, //item.RequestID === rowData.Id,
    );

    if (!record) {
      return <span>{formatCurrency(0)}</span>;
    }

    const tds = Number(record.TDS || 0);

    return <span>{formatCurrency(tds)}</span>;
  }

  const exportToExcel = () => {
    const exportData: any[] = [];

    mergedData.forEach((row) => {
      const isPartialPayment = row.children?.length > 1;

      // 🔷 Parent Row
      exportData.push({
        Type: "Main Payment",
        "Request Id": row.requestID,
        Date: isPartialPayment ? "-" : row.date || "-",
        "Payment To": row.paymentTo,
        "Taxable Amount": formatCurrency(row.FinalApprovedAmount),
        CGST: formatCurrency(row.cgst),
        SGST: formatCurrency(row.sgst),
        IGST: formatCurrency(row.igst),
        "Invoice Amount": formatCurrency(row.FinalApprovedAmount),
        TDS: formatCurrency(row.tds),
        "Paid Amount": formatCurrency(row.totalPaid),
        Account: isPartialPayment ? "-" : row.accountType || "-",
        "Paid Date": isPartialPayment ? "-" : row.date || "-",
        "Requested By": row.personName,
      });

      // 🔶 Child rows (Partial payments)
      if (isPartialPayment) {
        row.children.forEach((child: any, index: number) => {
          exportData.push({
            Type: "   ↳ Partial Payment",
            "Request Id": "",
            Date: child.date,
            "Payment To": "",
            "Taxable Amount": "",
            CGST: "",
            SGST: "",
            IGST: "",
            "Invoice Amount": "",
            TDS: "",
            "Paid Amount": formatCurrency(child.amount),
            Account: child.accountType,
            "Paid Date": child.date,
            "Requested By": "",
          });
        });
      }
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Improve column widths
    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 15 },
      { wch: 12 },
      { wch: 22 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 18 },
      { wch: 8 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "CompletedPayments");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    FileSaver.saveAs(blob, "CompletedPayments.xlsx");
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchCompletedMonthlyDashboard();
  }, [selectedMonth, selectedYear, searchText]);

  /* const rowExpansionTemplate = (rowData: any) => {
    return (
      <Table
        value={rowData.children}
        dataKey="date"
        loading={false}
        paginator={false}
        rows={5}
        emptyMessage="No partial payments"
        columns={[
          { field: "date", header: "Date" },
          {
            field: "amount",
            header: "Paid Amount",
            body: (rowData: any) => formatCurrency(rowData.amount),
          },
          {
            field: "accountType",
            header: "Account",
          },
          {
            field: "reference",
            header: "Reference",
          },
          {
            field: "remarks",
            header: "Remarks",
          },
        ]}
      />
    );
  };*/

  const rowExpansionTemplate = (rowData: any) => {
    return (
      <div
        style={{
          padding: "12px 20px",
          background: "#f4fbfc",//"#f8fafc",
          borderLeft: "4px solid #22c55e",
        }}
      >
        {rowData.children.map((child: any, index: number) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 160px 200px 200px auto",
              padding: "8px 0",
              borderBottom:
                index !== rowData.children.length - 1
                  ? "1px solid #e5e7eb"
                  : "none",
              fontSize: "13px",
              color: "#505050"
            }}
          >
            <div>
              <strong className={styles.nestedLbl}>Date :</strong> {child.date || "-"}
            </div>

            <div>
              <strong className={styles.nestedLbl}>Paid :</strong> {formatCurrency(child.amount)}
            </div>

            <div>
              <strong className={styles.nestedLbl}>Account :</strong> {child.accountType || "-"}
            </div>

            <div>
              <strong className={styles.nestedLbl}>Reference :</strong> {child.reference || "-"}
            </div>

            <div>
              <strong className={styles.nestedLbl}>Remarks :</strong> {child.remarks || "-"}
            </div>
          </div>
        ))}
      </div>
    );
  };
  console.log("mergedDataaa", mergedData);

  function rowRequestedBy(rowData: any) {
    const name = rowData.personName || "-";
    const email = rowData.personEmail;

    const imageUrl = email
      ? `${context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=S&accountname=${email}`
      : "";

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {email ? (
          <img
            src={imageUrl}
            alt={name}
            onError={(e) =>
              ((e.target as HTMLImageElement).style.display = "none")
            }
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#e2e8f0",
            }}
          />
        )}

        <span>{name}</span>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.actions}>
          {/*<button className={styles.headerBtn}>Add Freelancer</button>*/}
          {mergedData.length > 0 && (
            <button className={styles.headerBtn} onClick={exportToExcel}>
              Export Excel
            </button>
          )}
          <button
            className={styles.headerBtn}
            onClick={fetchCompletedMonthlyDashboard}
          >
            {" "}
            <i className="fa-solid fa-arrow-rotate-right" />
          </button>
        </div>
      </div>
      <div className={styles.filterRow}>
        <InputField
          type="dropdown"
          id="monthFilter"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          options={monthOptions}
          placeholder="All Months"
          className={styles.filterDropdownOptions}
        />

        <InputField
          type="dropdown"
          id="yearFilter"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          options={[
            ...Array.from(
              { length: today.getFullYear() - 2023 + 1 },
              (_, i) => ({
                label: String(2023 + i),
                value: 2023 + i,
              }),
            ),
          ]}
          //placeholder="All Years"
          className={styles.filterDropdownOptions}
        />

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <i className="fa-solid fa-magnifying-glass" />
        </div>
      </div>

      <div className={styles.content}>
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
            expandedRows={expandedRows}
            onRowToggle={(e) => setExpandedRows(e.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            dataKey="Id"
            //dataKey={"reqId"}
            loading={loading}
            paginator
            rows={10}
            emptyMessage="No data available for this month"
            columns={[
              {
                expander: (rowData) => rowData.children?.length > 1,
                style: { width: "3rem" },
              },
              { field: "requestID", header: "Request Idddd" },
              //{ field: "date", header: "Date" },
              {
                header: "Date",
                body: (rowData) =>
                  rowData.children?.length === 1
                    ? rowData.date || "-"
                    : rowData.children?.length === 0
                      ? rowData.date || "-"
                      : "-",
              },
              { field: "paymentTo", header: "Payment To" },
              {
                header: "Taxable Amount",
                body: (rowData) => rowTaxableAmount(rowData),
              },
              /*{
              header: "GST",
              body: (rowData) => rowGSTAmount(rowData),
            },*/
              {
                header: "CGST",
                body: (rowData) =>
                  rowData.cgst ? formatCurrency(rowData.cgst) : "-",
              },
              {
                header: "SGST",
                body: (rowData) =>
                  rowData.sgst ? formatCurrency(rowData.sgst) : "-",
              },
              {
                header: "IGST",
                body: (rowData) =>
                  rowData.igst ? formatCurrency(rowData.igst) : "-",
              },
              {
                field: "FinalApprovedAmount",
                header: "Invoice Amount",
                body: (rowData) => rowApprovedAmount(rowData),
              },
              {
                header: "TDS",
                body: (rowData) => rowTDSAmount(rowData),
              },

              {
                header: "Paid Amount",
                body: (rowData) => formatCurrency(rowData.totalPaid),
              },
              {
                //field: "accountType",
                header: "Account",
                body: (rowData) => rowData.accountType || "-",
              },
              {
                //field: "date",
                header: "Paid Date",
                //body: (rowData) => rowData.date || "-",
                body: (rowData) =>
                  rowData.children?.length === 1
                    ? rowData.date || "-"
                    : rowData.children?.length === 0
                      ? rowData.date || "-"
                      : "-",
              },
              //{ field: "personName", header: "Requested By" },
              {
                header: "Requested By",
                body: (rowData) => rowRequestedBy(rowData),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

export default CompletedPaymentDashboard;
