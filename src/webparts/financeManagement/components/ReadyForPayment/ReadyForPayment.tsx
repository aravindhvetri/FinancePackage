import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./ReadyForPayment.module.scss";
import { PaymentRequestData, RequestPaymentData } from "../../../../types";
import Table from "../Table/Table";
import {
  fetchPaymentRequests,
  fetchRequestPayment,
  completeBulkPayment,
  fetchAccountChoices,
} from "../../../../CommonServices/PaymentRequestService";
import { formatCurrency } from "../../../../utils/number";
import SPServices from "../../../../CommonServices/SPServices";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { AccountCategoryData } from "../../../../types";
import { mapToDropdownOptions } from "../../../../utils/dropdown";
import InputField from "../InputField/InputField";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import loaderLogo from "../../../../assets/TechnoRUCSLogo.png";
import { fetchVendors } from "../../../../CommonServices/VendorService";
import { fetchFreelancers } from "../../../../CommonServices/FreelancerService";

interface ReadyForPaymentDashboardProps {
  context: any;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function ReadyForPaymentDashboard({ context }: ReadyForPaymentDashboardProps) {
  const [readyForPaymentData, setReadyForPaymentData] = useState<
    PaymentRequestData[]
  >([]);
  const [readyForPaymentDataLoading, setReadyForPaymentDataLoading] =
    useState<boolean>(false);

  const [showProceedPopup, setShowProceedPopup] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");

  const [accounts, setAccounts] = useState<AccountCategoryData[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<AccountCategoryData | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("All");
  const [filteredData, setFilteredData] = useState<PaymentRequestData[]>([]);
  const [requestPaymentData, setRequestPaymentData] = useState<
    RequestPaymentData[]
  >([]);
  const [vendorData, setVendorData] = useState<any[]>([]);
  const [freelancerData, setFreelancerData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>(""); 
  const [hiddenRowIds, setHiddenRowIds] = useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const vendors = await fetchVendors();
      const freelancers = await fetchFreelancers();

      setVendorData(vendors?.data || []);
      setFreelancerData(freelancers?.data || []);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadData();
  }, []);

  function rowRemarks(rowData: PaymentRequestData) {
    // Vendor case
    if (rowData.VendorName?.VendorName) {
      const vendor = vendorData.find(
        (v) => v.VendorName === rowData.VendorName?.VendorName,
      );

      return <span>{vendor?.AdditionalDetails || "-"}</span>;
    }

    // Freelancer case
    if (rowData.PaymentFor?.FreelancerName) {
      const freelancer = freelancerData.find(
        (f) => f.FreelancerName === rowData.PaymentFor?.FreelancerName,
      );

      return <span>{freelancer?.AdditionalDetails || "-"}</span>;
    }

    return <span>-</span>;
  }

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

  const fetchReadyForPaymentDetails = async () => {
    setReadyForPaymentDataLoading(true);
    try {
      const requestPaymentResponse = await fetchRequestPayment();
      const requestPaymentData = requestPaymentResponse.data || [];

      setRequestPaymentData(requestPaymentData);

      const requestIds = requestPaymentData.map((item) => item.RequestID);

      const paymentRequestResponse = await fetchPaymentRequests();
      const paymentRequestData = paymentRequestResponse.data || [];

      const filtered = paymentRequestData
        .filter(
          (item) =>
            requestIds.includes(item.Id) &&
            item.PaymentProcess === "Inprogress",
        )
        .map((item) => ({ ...item, selected: false }));

      setReadyForPaymentData(filtered);
    } catch (error) {
      console.error("Error fetchReadyForPaymentDetails:", error);
    } finally {
      setReadyForPaymentDataLoading(false);
    }
  };

  const onRowSelect = (row: PaymentRequestData) => {
    setFilteredData((prev) =>
      prev.map((data) =>
        Number(data.Id) === Number(row.Id)
          ? { ...data, selected: !data.selected }
          : data,
      ),
    );
  };

  const hideRow = (id: number) => {
  setHiddenRowIds((prev) => [...prev, id]);
};

const refreshTable = async () => {
  setHiddenRowIds([]);
  await fetchReadyForPaymentDetails();
};

  function isSelectedAll(data: PaymentRequestData[]) {
    if (data.length === 0) return false;
    return data.every((row) => row.selected);
  }

  const handleSelectAll = () => {
    if (isSelectedAll(filteredData)) {
      setFilteredData((data) => {
        return data.map((d) => {
          return {
            ...d,
            selected: false,
          };
        });
      });
    } else {
      setFilteredData((data) => {
        return data.map((d) => {
          return {
            ...d,
            selected: true,
          };
        });
      });
    }
  };

  const showProceed = filteredData.some((data) => data.selected);

  const onConfirmPayment = async () => {

    

    if (!paymentDate) {
      toast.error("Please select date");
      return;
    }
    if (!selectedAccount) {
      toast.error("Please select account");
      return;
    }

    const year = paymentDate.getFullYear();
    const month = String(paymentDate.getMonth() + 1).padStart(2, "0");
    const day = String(paymentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}T00:00:00`;

    try {
      //  Get all payment records (like colRequestPaymentDetails)
      const requestPaymentResponse = await fetchRequestPayment();
      const requestPaymentData = requestPaymentResponse.data || [];

      for (const data of filteredData.filter((data) => data.selected)) {
        const id = data.Id;
        const row = readyForPaymentData.find((r) => r.Id === id);
        if (!row) continue;

        //  Find current request record (curRecord)
        const curRecord = readyForPaymentData.find(
          (r) => r.RequestID === row.RequestID && r.FinalApprovedAmount,
        );


        if (!curRecord) continue;

           const latestRecord = requestPaymentData
  //.filter((p) => p.RequestID === curRecord.Id)
  .filter((p) => p.RequestID === row.Id)
  .sort((a, b) => b.Id - a.Id)[0];


        //  Sum of already paid amounts
        const sumOfAmount = requestPaymentData
          .filter((p) => p.ParentReqPayID === curRecord.Id)
          .reduce((sum, p) => sum + (p.Amount || 0), 0);

        //  Remaining amount
        const remainingAmount =
          Number(curRecord.FinalApprovedAmount) - Number(sumOfAmount);

        if (remainingAmount <= 0) {
          toast.warning(`Request ${curRecord.RequestID} already fully paid`);
          continue;
        }

        const payload = {
          //Date: paymentDate,
          Date: formattedDate,
          Amount: remainingAmount,
          Reference: reference,
          Remarks: remarks,
          //ParentReqPayID: curRecord.Id,
          ParentReqPayID: latestRecord?.Id,
          //Account: selectedAccount,
          Account: selectedAccount?.name,
        };

        //  Create payment entry
        await completeBulkPayment(payload);

        //  Update payment request status
        await SPServices.SPUpdateItem({
          Listname: "PaymentRequestDetails",
          ID: curRecord.Id,
          RequestJSON: {
            PaymentProcess: "Completed",
            PaymentCompletedDate: new Date(),
            PaymentCompletedMonth: new Date().getMonth() + 1,
            PaymentCompletedYear: new Date().getFullYear(),
          },
        });
      }

      toast.success("Payment completed successfully");

      setShowProceedPopup(false);
      setPaymentDate(null);
      setSelectedAccount(null);
      //setAccount(null);
      setReference("");
      setRemarks("");

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetchReadyForPaymentDetails();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete payment");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchReadyForPaymentDetails();
  }, []);

  function rowPaymentTo(rowData: PaymentRequestData) {
    const paymentType = rowData.PaymentType;
    console.log("paymentTypeeee", paymentType);

    if (
      paymentType !== "Employee benefits" &&
      paymentType !== "Reimbursement" &&
      paymentType !== "Freelancer Payment"
    ) {
      console.log("rowDataaaa", rowData.VendorName);
      if (rowData.VendorName?.VendorName) {
        return <span>{rowData.VendorName.VendorName}</span>;
      }

      if (paymentType === "Salary") {
        return <span>{rowData.PersonName?.Title}</span>;
      }

      if (rowData.PaymentFor?.FreelancerName) {
        return <span>{rowData.PaymentFor.FreelancerName}</span>;
      }

      return <span>No selection</span>;
    }

    // Employee benefits / Reimbursement
    if (
      paymentType === "Employee benefits" ||
      paymentType === "Reimbursement"
    ) {
      return <span>{rowData.PersonName?.Title}</span>;
    }

    // Freelancer Payment
    if (paymentType === "Freelancer Payment") {
      return <span>{rowData.PaymentFor?.FreelancerName}</span>;
    }

    return <span>N/A</span>;
  }

  function rowApprovedAmount(rowData: PaymentRequestData) {
    return <span>{formatCurrency(rowData.FinalApprovedAmount)}</span>;
  }

  function rowFinalAmount(rowData: PaymentRequestData) {
    const record = requestPaymentData.find(
      (item) => item.RequestID === rowData.Id,
    );

    const finalAmount = Number(record?.FinalAmount || 0);

    return <span>{formatCurrency(finalAmount)}</span>;
  }

  function rowBalanceAmount(rowData: PaymentRequestData) {
    //  Find current record (curRecord)
    const curRecord = requestPaymentData.find(
      (item) => item.RequestID === rowData.Id && item.FinalAmount !== null,
    );

    if (!curRecord) {
      return <span>{formatCurrency(0)}</span>;
    }

    //  Sum of paid amounts
    const sumOfAmount = requestPaymentData
      .filter((item) => item.ParentReqPayID === curRecord.Id)
      .reduce((sum, item) => sum + Number(item.Amount || 0), 0);

    //  Balance
    const balance = Number(curRecord.FinalAmount || 0) - sumOfAmount;

    return <span>{formatCurrency(balance)}</span>;
  }

  function rowStatus(rowData: PaymentRequestData) {
    if (rowData.PaymentProcess === "Completed") {
      return <span>Payment Completed</span>;
    }

    const hasRequest = requestPaymentData.some(
      (item) => item.RequestID === rowData.Id,
    );

    const relatedRequest = requestPaymentData.find(
      (item) => item.RequestID === rowData.Id,
    );

    const hasParent =
      relatedRequest &&
      requestPaymentData.some(
        (item) => item.ParentReqPayID === relatedRequest.Id,
      );

    return (
      <span className={styles.status}>
        {rowData.PaymentProcess === "Inprogress" && hasRequest && hasParent
          ? "Partially Paid"
          : "To be Paid"}
      </span>
    );
  }

  function rowRequestedBy(rowData: PaymentRequestData) {
    const name = rowData.Author?.Title || rowData.PersonName?.Title || "-";
    const email = rowData.PersonName?.EMail;

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
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
            onError={(e) =>
              ((e.target as HTMLImageElement).style.display = "none")
            }
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

  function formatDate(dateValue: string | Date) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const categoryOptions = Array.from(
    new Set(readyForPaymentData.map((item) => item.PaymentType)),
  );

  function applyFilters(data: PaymentRequestData[]): PaymentRequestData[] {
    let filtered = data;

    if (selectedCategoryFilter !== "All") {
      filtered = filtered.filter(
        (item) => item.PaymentType === selectedCategoryFilter,
      );
    }

     if (searchText.trim()) {
    const search = searchText.toLowerCase();

    filtered = filtered.filter((item) => {
      const paymentTo =
        item.VendorName?.VendorName ||
        item.PaymentFor?.FreelancerName ||
        item.PersonName?.Title ||
        "";

      return (
          item.RequestID?.toString().includes(search)||
        paymentTo.toLowerCase().includes(search) ||
        item.PaymentType?.toLowerCase().includes(search) ||
        item.Author?.Title?.toLowerCase().includes(search)
      );
    });
  }

    return filtered;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function rowTaxableAmount(rowData: PaymentRequestData) {
    const record = requestPaymentData.find(
      (item) => item.RequestID === rowData.Id,
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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function rowTDSAmount(rowData: PaymentRequestData) {
    const record = requestPaymentData.find(
      (item) => item.RequestID === rowData.Id,
    );

    if (!record) {
      return <span>{formatCurrency(0)}</span>;
    }

    const tds = Number(record.TDS || 0);

    return <span>{formatCurrency(tds)}</span>;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function rowPayableAmount(rowData: PaymentRequestData) {
    // Step 1: Find curRecord (same as LookUp)
    const curRecord = requestPaymentData.find(
      (item) =>
        item.RequestID === rowData.Id &&
        item.FinalAmount !== null &&
        item.FinalAmount !== undefined,
    );

    if (!curRecord) {
      return <span>{formatCurrency(0)}</span>;
    }

    // Step 2: Sum child payments
    const sumOfAmount = requestPaymentData
      .filter((item) => item.ParentReqPayID === curRecord.Id)
      .reduce((sum, item) => sum + Number(item.Amount || 0), 0);

    // Step 3: Calculate payable amount
    const payableAmount = Number(curRecord.FinalAmount || 0) - sumOfAmount;

    return <span>{formatCurrency(payableAmount)}</span>;
  }

  function rowAdvanceAmount(rowData: PaymentRequestData) {
    // Step 1: find parent finance record
    const curRecord = requestPaymentData.find(
      (item) =>
        item.RequestID === rowData.Id &&
        item.FinalAmount !== null &&
        item.FinalAmount !== undefined,
    );

    if (!curRecord) {
      return <span>{formatCurrency(0)}</span>;
    }

    // Step 2: sum child payments
    const advanceAmount = requestPaymentData
      .filter((item) => item.ParentReqPayID === curRecord.Id)
      .reduce((sum, item) => sum + Number(item.Amount || 0), 0);

    return <span>{formatCurrency(advanceAmount)}</span>;
  }

  const exportToExcel = () => {
    const exportData = filteredData.map((row) => {
      const record = requestPaymentData.find((r) => r.RequestID === row.Id);

      const cgst = Number(record?.CGSTAmount || 0);
      const sgst = Number(record?.SGST || 0);
      const igst = Number(record?.IGSTAmount || 0);

      return {
        "Request Id": row.RequestID,
        Date: formatDate(row.Date),

        "Payment To":
          row.VendorName?.VendorName ||
          row.PaymentFor?.FreelancerName ||
          row.PersonName?.Title ||
          "-",

        "Taxable Amount":
          Number(row.FinalApprovedAmount || 0) - (cgst + sgst + igst),

        CGST: cgst,
        SGST: sgst,
        IGST: igst,

        "Total GST": cgst + sgst + igst,

        "Invoice Amount": row.FinalApprovedAmount,

        TDS: Number(record?.TDS || 0),

        "Advance Amount": requestPaymentData
          .filter((r) => r.ParentReqPayID === row.Id)
          .reduce((sum, r) => sum + Number(r.Amount || 0), 0),

        "Payable Amount": (() => {
          const curRecord = requestPaymentData.find(
            (item) => item.RequestID === row.Id && item.FinalAmount !== null,
          );

          if (!curRecord) return 0;

          const sumOfAmount = requestPaymentData
            .filter((item) => item.ParentReqPayID === curRecord.Id)
            .reduce((sum, item) => sum + Number(item.Amount || 0), 0);

          return Number(curRecord.FinalAmount || 0) - sumOfAmount;
        })(),

        Status: row.PaymentProcess,

        "Requested By": row.Author?.Title || "-",
        "Approved By": row.FinalApprovalBy?.Title,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "ReadyForPayment");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, "ReadyForPayment.xlsx");
  };

  // Paste this instead
  useEffect(() => {
    setFilteredData((prev) => {
     // const filtered = applyFilters(readyForPaymentData);
     const visibleData = readyForPaymentData.filter(
    item => !hiddenRowIds.includes(item.Id)
);

const filtered = applyFilters(visibleData);
      return filtered.map((item) => {
        const existing = prev.find((p) => Number(p.Id) === Number(item.Id));
        return existing
          ? { ...item, selected: existing.selected ?? false }
          : { ...item, selected: false };
      });
    });
  }, [readyForPaymentData, hiddenRowIds, selectedCategoryFilter,searchText]);

  const totals = filteredData.reduce(
    (acc, row) => {
      const record = requestPaymentData.find(
        (item) => item.RequestID === row.Id,
      );

      const cgst = Number(record?.CGSTAmount || 0);
      const sgst = Number(record?.SGST || 0);
      const igst = Number(record?.IGSTAmount || 0);
      const tds = Number(record?.TDS || 0);

      const totalGST = cgst + sgst + igst;

      // taxable amount
      const taxableAmount = Number(row.FinalApprovedAmount || 0) - totalGST;

      // payable amount logic (same as PowerApps logic)
      const curRecord = requestPaymentData.find(
        (item) => item.RequestID === row.Id && item.FinalAmount !== null,
      );

      let payableAmount = 0;
      let advanceAmount = 0;

      if (curRecord) {
        advanceAmount = requestPaymentData
          .filter((item) => item.ParentReqPayID === curRecord.Id)
          .reduce((sum, item) => sum + Number(item.Amount || 0), 0);

        payableAmount = Number(curRecord.FinalAmount || 0) - advanceAmount;
      }

      acc.taxable += taxableAmount;
      acc.invoice += Number(row.FinalApprovedAmount || 0);
      acc.gst += totalGST;
      acc.tds += tds;
      acc.advance += advanceAmount;
      acc.payable += payableAmount;

      return acc;
    },
    {
      taxable: 0,
      invoice: 0,
      gst: 0,
      tds: 0,
      payable: 0,
      advance: 0,
    },
  );
  console.log("filteredData", filteredData);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.actions}>
          {showProceed && (
            <button
              className={styles.headerBtn}
              onClick={() => setShowProceedPopup(true)}
            >
              Proceed
            </button>
          )}
          {filteredData.length > 0 && (
            <button className={styles.headerBtn} onClick={exportToExcel}>
              Export Excel
            </button>
          )}
          <button
            className={styles.headerBtn}
            //onClick={fetchReadyForPaymentDetails}
            onClick={refreshTable}
          >
            {" "}
            <i className="fa-solid fa-arrow-rotate-right" />
          </button>
        </div>
      </div>
      <div className={styles.filterRow}>
        <div className={styles.selectAllBox}>
          <input
            type="checkbox"
            checked={isSelectedAll(filteredData)}
            onChange={handleSelectAll}
          />
          <span className={styles.selectAllText}>Select All</span>
        </div>

        <InputField
          type="dropdown"
          label=""
          id="categoryFilter"
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.value)}
          options={[
            { label: "All", value: "All" },
            ...categoryOptions.map((cat) => ({
              label: cat,
              value: cat,
            })),
          ]}
          className={styles.filterDropdown}
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
        {readyForPaymentDataLoading ? (
          <div className={styles.loaderWrapper}>
            <img
              src={loaderLogo}
              alt="Loading..."
              className={styles.loaderImage}
            />
          </div>
        ) : (
          <Table
            value={filteredData}
            dataKey={"Id"}
            loading={readyForPaymentDataLoading}
            paginator
            rows={10}
            emptyMessage="No data available"
            columns={[
              {
                header: "",
                body: (rowData: PaymentRequestData) => {
                  return (
                    <input
                      type="checkbox"
                      checked={rowData.selected}
                      onChange={(e) => onRowSelect(rowData)}
                      name="select"
                      id={rowData.Id.toString()}
                    />
                  );
                },
                style: { width: "50px" },
              },
              { field: "RequestID", header: "Request Id" },
              {
                field: "Date",
                header: "Date",
                body: (rowData) => <span>{formatDate(rowData.Date)}</span>,
              },
              {
                header: "Payment To",
                body: (rowData) => rowPaymentTo(rowData),
              },
              {
                header: "Taxable Amount",
                body: (rowData) => rowTaxableAmount(rowData),
              },

              {
                //field: "CGSTAmount",
                header: "CGST",
                body: (rowData) => {
                  const record = requestPaymentData.find(
                    (item) => item.RequestID === rowData.Id,
                  );

                  return <span>{formatCurrency(record?.CGSTAmount || 0)}</span>;
                },
              },
              {
                //field: "IGSTAmount",
                header: "IGST",
                body: (rowData) => {
                  const record = requestPaymentData.find(
                    (item) => item.RequestID === rowData.Id,
                  );

                  return <span>{formatCurrency(record?.IGSTAmount || 0)}</span>;
                },
              },
              {
                //field: "SGST",
                header: "SGST",
                body: (rowData) => {
                  const record = requestPaymentData.find(
                    (item) => item.RequestID === rowData.Id,
                  );

                  return <span>{formatCurrency(record?.SGST || 0)}</span>;
                },
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
                header: "Advance Amount",
                body: (rowData) => rowAdvanceAmount(rowData),
              },
              {
                header: "Payable Amount",
                body: (rowData) => rowPayableAmount(rowData),
              },
              {
                field: "",
                header: "Status",
                body: (rowData) => rowStatus(rowData),
              },
              {
    header: "Hide",
    body: (rowData) => (
        <Button
            icon="pi pi-eye-slash"
            text
            onClick={() => hideRow(rowData.Id)}
        />
    )
},
              {
                field: "",
                header: "Requested By",
                body: (rowData) => rowRequestedBy(rowData),
              },
              {
                header: "Remarks",
                body: (rowData) => rowRemarks(rowData),
              },
            ]}
          />
        )}
        <div className={styles.summaryContainer}>
          <div className={styles.summaryItem}>
            <span className={styles.totalhdr}>Total Taxable:</span>
            <strong className={styles.totalvlue}>
              {formatCurrency(totals.taxable)}
            </strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.totalhdr}>Total GST:</span>
            <strong className={styles.totalvlue}>
              {formatCurrency(totals.gst)}
            </strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.totalhdr}>Total Invoice:</span>
            <strong className={styles.totalvlue}>
              {formatCurrency(totals.invoice)}
            </strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.totalhdr}>Total TDS:</span>
            <strong className={styles.totalvlue}>
              {formatCurrency(totals.tds)}
            </strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.totalhdr}>Total Advance:</span>
            <strong className={styles.totalvlue}>
              {formatCurrency(totals.advance)}
            </strong>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.totalhdr}>Total Payable:</span>
            <strong className={styles.totalvlue}>
              {formatCurrency(totals.payable)}
            </strong>
          </div>
        </div>
      </div>
      {showProceedPopup && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <h2 className={styles.title}>Proceed All</h2>
            <div className={styles.formContainer}>
              <InputField
                type="calendar"
                label="Date"
                id="paymentDate"
                value={paymentDate}
                placeholder="Select date"
                onChange={(e) => setPaymentDate(e.value as Date)}
                labelClassName={styles.categoryLabel}
              />

              <InputField
                type="dropdown"
                label="Account"
                id="account"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.value)}
                options={mapToDropdownOptions(accounts, {
                  label: (a) => a.code,
                  value: (a) => a,
                })}
                placeholder="Select Account"
                labelClassName={styles.categoryLabel}
              />

              <InputField
                type="input-text"
                label="Reference"
                id="reference"
                placeholder="Enter reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />

              <InputField
                type="input-textarea"
                label="Remarks"
                id="remarks"
                placeholder="Enter remarks"
                value={remarks}
                rows={3}
                autoResize
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className={styles.confirmButtons}>
              <Button
                label="Cancel"
                onClick={() => setShowProceedPopup(false)}
                className={styles.cnlBtn}
              />
              <Button
                label="Submit"
                onClick={onConfirmPayment}
                className={styles.sbtBtn}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadyForPaymentDashboard;
