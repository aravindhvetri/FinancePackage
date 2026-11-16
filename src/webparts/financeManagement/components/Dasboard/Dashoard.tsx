import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./DashboardStyle.module.scss";
import {
  PaymentRequestData,
  RequestPaymentData,
  StatusData,
  PaymentTypeData,
} from "../../../../types";
import {
  fetchPaymentRequests,
  fetchRequestPayment,
  fetchStatus,
  fetchPaymentType,
  updateRequest,
  addPaymentTypeChoice,
  addNewCategory,
  addNewSubCategory,
} from "../../../../CommonServices/PaymentRequestService";
import Table from "../Table/Table";
import { formatCurrency } from "../../../../utils/number";
import SideModal from "../SideModal/SideModal";
import AddRequest from "../AddRequest/AddRequest";
import EditMyRequest from "../EditMyRequest/EditMyRequest";
import ActionButtons from "../ActionButttons/ActionButtons";
import { graph } from "@pnp/graph/presets/all";
import loaderLogo from "../../../../assets/TechnoRUCSLogo.png";
import InputField from "../InputField/InputField";
import { toast } from "react-toastify";
import { Button } from "primereact/button";

const tabs = [
  { id: 1, label: "All Request" },
  { id: 2, label: "Scheduled Request" },
  { id: 3, label: "Completed Payment" },
  { id: 4, label: "My Request" },
];

interface DashboardProps {
  context: any;
}
//const Dashboard = (props: any) => {
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Dashboard({ context }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [checked, setChecked] = useState(false);
  const [allPaymentRequests, setAllPaymentRequests] = useState<
    PaymentRequestData[]
  >([]);
  console.log("all payment request data in dashboard: ", allPaymentRequests);
  const [paymentRequestDataLoading, setPaymentRequestDataLoading] =
    useState<boolean>(false);
  const [filteredPaymentRequests, setFilteredPaymentRequests] = useState<
    PaymentRequestData[]
  >([]);

  const [allRequestPayments, setAllRequestPayments] = useState<
    RequestPaymentData[]
  >([]);
  //const [showAddRequest, setShowAddRequest] =useState<boolean>(false);
  const [showSideModal, setShowSideModal] = useState(false);
  const [modalType, setModalType] = useState<"ADD" | "EDIT" | null>(null);
  const [editMode, setEditMode] = useState<"PROCEED" | "VIEW">("VIEW");
  const [selectedRow, setSelectedRow] = useState<PaymentRequestData | null>(
    null,
  );
  const [activeEditTab, setActiveEditTab] = useState(0);
  const [status, setStatus] = useState<StatusData[]>([]);
  const [selecteStatus, setSelectedStatus] = useState<StatusData | null>(null);
  const [paymentType, setpaymentType] = useState<PaymentTypeData[]>([]);
  const [selectePaymentType, setSelectedPaymentType] =
    useState<PaymentTypeData | null>(null);
  const [managerEmails, setManagerEmails] = useState<string[]>([]);
  const [requestedByOptions, setRequestedByOptions] = useState<
    { Value: string; Mail: string }[]
  >([]);
  const [selectedRequestedBy, setSelectedRequestedBy] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<string>("All");
  const [searchText, setSearchText] = useState<string>("");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");

  const ellipsisTemplate = (value?: string, maxWidth: string = "120px") => (
    <span
      className={styles.ellipsisCell}
      style={{ maxWidth }}
      title={value || ""}
    >
      {value || "-"}
    </span>
  );

  //const managerId = "89f06eed-8c60-4435-9abf-0f68c7e72182";
  const managerId = "936e8d49-7b43-4874-890b-ee3e475f6f41";

  useEffect(() => {
    const loadManagers = async () => {
      try {
        const members = await graph.groups.getById(managerId).members();

        const emails = members
          .map(
            (member: any) =>
              member.mail?.toLowerCase() ||
              member.userPrincipalName?.toLowerCase(),
          )
          .filter(Boolean);
        console.log("Manager emails: ", emails);
        setManagerEmails(emails);
      } catch (error) {
        console.error("Error fetching manager group members", error);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadManagers();
  }, []);

  useEffect(() => {
    if (!allPaymentRequests.length) return;

    const filtered = allPaymentRequests
      .filter(
        (item) =>
          item.ApproverStatus === true &&
          !managerEmails.includes(item.PersonName?.EMail?.toLowerCase()),
      )
      .map((rec) => ({
        Value: rec.PersonName?.Title,
        Mail: rec.PersonName?.EMail,
      }));

    // remove duplicates
    const unique = Array.from(
      new Map(filtered.map((item) => [item.Mail, item])).values(),
    );

    setRequestedByOptions(unique);
  }, [allPaymentRequests, managerEmails]);

  useEffect(() => {
    const loadStatus = async () => {
      const { data, error } = await fetchStatus();
      if (data) {
        setStatus(data);
      } else {
        console.log("Failed to load status", error);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadStatus();
  }, []);

  useEffect(() => {
    const loadPaymentType = async () => {
      const { data, error } = await fetchPaymentType();
      if (data) {
        setpaymentType(data);
      } else {
        console.log("Failed to load status");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadPaymentType();
  }, []);

  function applyFilters(
    data: PaymentRequestData[],
    tabIndex: number,
  ): PaymentRequestData[] {
    let filtered = data;

    switch (tabIndex) {
      case 0:
        filtered = data.filter(
          (item) =>
            item.CEOStatus === true &&
            (item.IsScheduled === false || item.IsScheduled === null),
        );
        break;

      case 1:
        filtered = data.filter(
          (item) =>
            item.CEOStatus === true &&
            item.IsScheduled === true &&
            item.FinanceTeamAction === "Schedule Payment",
        );
        break;

      case 3:
        filtered = data.filter(
          (item) =>
            item.PersonName?.EMail?.toLowerCase() ===
            context.pageContext.user.email.toLowerCase(),
        );
        break;

      default:
        filtered = data;
    }

    if (showFlaggedOnly) {
      filtered = filtered.filter((item) => item.MarkedAsReview === true);
    }

    // Status filter
    if (selecteStatus) {
      filtered = filtered.filter(
        (item) => item.PaymentProcess === selecteStatus?.name,
      );
    }

    //PaymentType filter
    if (selectePaymentType) {
      filtered = filtered.filter(
        (item) => item.PaymentType === selectePaymentType?.name,
      );
    }
    //RequestedBy filter
    if (selectedRequestedBy) {
      filtered = filtered.filter(
        (item) => item.PersonName?.EMail === selectedRequestedBy,
      );
    }

    if (selectedInvoice === "With invoices") {
      filtered = filtered.filter((item) => item.InvoiceSubmitted === true);
    }

    if (selectedInvoice === "Without invoices") {
      filtered = filtered.filter((item) => item.InvoiceSubmitted === false);
    }

    if (searchText) {
      const search = searchText.toLowerCase();

      filtered = filtered.filter((item) => {
        const date = item.Date
          ? new Date(item.Date).toLocaleDateString("en-GB")
          : "";

        return (
          item.Amount?.toString().toLowerCase().includes(search) ||
          item.RequestID?.toString().includes(search) ||
          item.PersonName?.Title?.toLowerCase().includes(search) ||
          date.toLowerCase().includes(search) ||
          item.FinalApprovedAmount?.toString().toLowerCase().includes(search) ||
          item.VendorName?.VendorName?.toLowerCase().includes(search) ||
          item.PaymentFor?.FreelancerName?.toLowerCase().includes(search) ||
          item.PaymentType?.toLowerCase().includes(search) ||
          item.TypeOfService?.toLowerCase().includes(search)
        );
      });
    }

    return filtered;
  }

  const fetchPaymentRequestData = async () => {
    setPaymentRequestDataLoading(true);
    try {
      const { data } = await fetchPaymentRequests();

      if (data) {
        setAllPaymentRequests(data);
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    } finally {
      setPaymentRequestDataLoading(false);
    }
  };

  const toggleReviewFlag = async (rowData: PaymentRequestData) => {
    try {
      setPaymentRequestDataLoading(true);

      await updateRequest(rowData.Id, {
        MarkedAsReview: !rowData.MarkedAsReview,
      });
      toast.success("Flag is marked successfully");
      await fetchPaymentRequestData(); // refresh data
    } catch (error) {
      console.error("Error updating flag", error);
    } finally {
      setPaymentRequestDataLoading(false);
    }
  };

  function rowFlag(rowData: PaymentRequestData) {
    return (
      <i
        className="fa-solid fa-flag"
        style={{
          cursor: "pointer",
          color: rowData.MarkedAsReview ? "red" : "#cbd5e1",
        }}
        onClick={(e) => {
          e.stopPropagation();
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          toggleReviewFlag(rowData);
        }}
      />
    );
  }

  const completedDashboardData = React.useMemo(() => {
    const completedPayments = allPaymentRequests.filter(
      (item) => item.PaymentProcess === "Completed",
    );

    return completedPayments.map((rec) => {
      const relatedPayments = allRequestPayments.filter(
        (item) => item.RequestID === rec.Id,
      );

      const sum = (field: keyof RequestPaymentData) =>
        relatedPayments.reduce(
          (acc, curr) => acc + Number(curr[field] || 0),
          0,
        );

      const cgst = sum("CGSTAmount");
      const sgst = sum("SGST");
      const igst = sum("IGSTAmount");

      let gstAmount: string | number = 0;

      if (cgst > 0) {
        gstAmount = `CGST : ₹ ${cgst} ; SGST : ₹ ${sgst}`;
      } else if (igst > 0) {
        gstAmount = `IGST : ₹ ${igst}`;
      }

      return {
        ID: rec.Id,
        RequestID: rec.RequestID,
        ReqAmount: rec.Amount,
        RequestBy: rec.PersonName?.Title,
        PersonName: rec.PersonName,
        RequestFor: rec.PaymentType,
        FreelancerName: rec.PaymentFor?.FreelancerName,
        VendorName: rec.VendorName?.VendorName,
        licenceFor: rec.LisenceFor,
        Others: rec.Others,
        CerticationName: rec.CertificationName,

        TDS: sum("TDS"),
        OtherDeduction: sum("OtherDeductions"),
        GSDAmount: gstAmount,
        FinalAmount: sum("FinalAmount"),
      };
    });
  }, [allPaymentRequests, allRequestPayments]);

  function rowDate(rowData: PaymentRequestData) {
    const formattedDate = rowData.Date
      ? new Date(rowData.Date).toLocaleDateString("en-GB")
      : "-";

    return ellipsisTemplate(formattedDate, "100px");
  }

  function rowApprovedAmount(rowData: any) {
    return ellipsisTemplate(
      formatCurrency(rowData.FinalApprovedAmount) || "-",
      "100px",
    );
  }

  function rowRequestedAmount(rowData: any) {
    return ellipsisTemplate(formatCurrency(rowData.Amount) || "-", "100px");
  }

  function rowRequestedBy(rowData: any) {
    const name = rowData.RequestBy || rowData.PersonName?.Title || "-";
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

  function rowReqAmount(rowData: any) {
    return ellipsisTemplate(formatCurrency(rowData.ReqAmount) || "-", "100px");
  }

  function rowTdsAmount(rowData: any) {
    return ellipsisTemplate(formatCurrency(rowData.TDS) || "-", "100px");
  }

  function rowODAmount(rowData: any) {
    return ellipsisTemplate(
      formatCurrency(rowData.OtherDeduction) || "-",
      "100px",
    );
  }

  function rowFinalAmount(rowData: any) {
    return ellipsisTemplate(
      formatCurrency(rowData.FinalAmount) || "-",
      "100px",
    );
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function rowPaymentTo(rowData: PaymentRequestData) {
    const category = rowData.PaymentType;

    // Employee benefits / Reimbursement / Salary
    if (
      category === "Employee benefits" ||
      category === "Reimbursement" ||
      category === "Salary"
    ) {
      return <span>{rowData.PersonName?.Title || "-"}</span>;
    }

    // Freelancer Payment
    if (category === "Freelancer Payment") {
      return <span>{rowData.PaymentFor?.FreelancerName || "-"}</span>;
    }

    // Vendor based categories
    if (
      [
        "Vendor Payments",
        "Group health insurance",
        "Transfer of funds-miscellaneous",
        "Labour Welfare Fund",
        "EB bills",
        "Internet recharges",
        "Rent",
        "PF",
        "ESI",
        "Profess tax",
        "GST",
        "TDS",
      ].includes(category || "")
    ) {
      return <span>{rowData.VendorName?.VendorName || "-"}</span>;
    }

    return <span>-</span>;
  }

  const fetchRequestPaymentData = async () => {
    setPaymentRequestDataLoading(true);
    try {
      const { data } = await fetchRequestPayment();

      if (data) {
        setAllRequestPayments(data);
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    } finally {
      setPaymentRequestDataLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setPaymentRequestDataLoading(true);

      await Promise.all([fetchPaymentRequestData(), fetchRequestPaymentData()]);

      setPaymentRequestDataLoading(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadDashboardData();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(allPaymentRequests, activeTab);
    setFilteredPaymentRequests(filtered);
  }, [
    activeTab,
    allPaymentRequests,
    selecteStatus,
    selectePaymentType,
    selectedInvoice,
    searchText,
    showFlaggedOnly,
  ]);

  console.log("filteredPaymentRequests:", filteredPaymentRequests);

  const onAddNewRequestClick = () => {
    setModalType("ADD");
    setSelectedRow(null);
    setShowSideModal(true);
  };

  const onEditRequestClick = (rowData: PaymentRequestData) => {
    setEditMode("VIEW");
    setModalType("EDIT");
    setSelectedRow(rowData);
    setShowSideModal(true);
  };

  const onProceedClick = (rowData: PaymentRequestData) => {
    setEditMode("PROCEED"); // proceed icon
    setModalType("EDIT");
    setSelectedRow(rowData);
    setShowSideModal(true);
  };

  const onCloneRequestClick = (rowData: PaymentRequestData) => {
    setModalType("ADD");
    setSelectedRow(rowData); // 👈 important
    setShowSideModal(true);
  };

  const rowActions = (rowData: PaymentRequestData) => {
    return (
      <div className={styles.rowActionsWrapper}>
        <ActionButtons
          buttons={[
            {
              variants: ["icon", "transparent"],
              icon: "pi pi-clone",
              onClick: () => onCloneRequestClick(rowData),
              tooltip: "Clone",
              tooltipOptions: { position: "top" },
            },
          ]}
        />
      </div>
    );
  };

  function getStatusDetails(rowData: PaymentRequestData) {
    const paymentProcess = rowData.PaymentProcess;
    const financeAction = rowData.FinanceTeamAction;

    const hasRequest = allRequestPayments.some(
      (item) => item.RequestID === rowData.Id,
    );

    const relatedRequest = allRequestPayments.find(
      (item) => item.RequestID === rowData.Id,
    );

    const hasParent =
      relatedRequest &&
      allRequestPayments.some(
        (item) => item.ParentReqPayID === relatedRequest.Id,
      );

    if (paymentProcess === "Inprogress" && financeAction === "On Hold") {
      return { text: "On Hold", color: "#d4ac0d", bgColor: "#fff3b0" };
    }

    if (
      paymentProcess === "Inprogress" &&
      financeAction === "Schedule Payment"
    ) {
      return {
        text: "Payment Scheduled",
        color: "#2471a3",
        bgColor: "#c3daec",
      };
    }

    if (paymentProcess === "Completed" && financeAction === "Cancel Payment") {
      return {
        text: "Payment Cancelled",
        color: "#ef0a07",
        bgColor: "#fcd6d5",
      };
    }

    if (
      paymentProcess === "Completed" ||
      (paymentProcess === "Completed" && financeAction === "Proceed Payment")
    ) {
      return {
        text: "Payment Completed",
        color: "#229954",
        bgColor: "#d0f5e0",
      };
    }

    if (paymentProcess === "Inprogress" && hasRequest && hasParent) {
      return { text: "Partially Paid", color: "#d4ac0d", bgColor: "#fff3b0" };
    }

    return { text: "To be Paid", color: "#ca6f1e", bgColor: "#f9e3d0" };
  }

  function getMyRequestStatus(rowData: PaymentRequestData) {
    const status = rowData.Status;
    const approverStatus = rowData.ApproverStatus;
    const requesterEmail = rowData.PersonName?.EMail?.toLowerCase();

    const isManager = managerEmails.includes(requesterEmail);

    // Pending with Manager
    if (status === "Inprogress" && !approverStatus && !isManager) {
      return {
        text: "Pending with Manager",
        color: "#ca6f1e",
        bgColor: "#f9e3d0",
      };
    }

    // Pending with CEO
    if (status === "Inprogress" && (approverStatus || isManager)) {
      return { text: "Pending with CEO", color: "#ca6f1e", bgColor: "#f9e3d0" };
    }

    // Rejected by Manager
    if (status === "Rejected" && !rowData.FinalRejectedBy?.EMail) {
      return {
        text: "Rejected by Manager",
        color: "#ef0a07",
        bgColor: "#fcd6d5",
      };
    }

    // Rejected by CEO
    if (status === "Rejected" && rowData.FinalRejectedBy?.EMail) {
      return { text: "Rejected by CEO", color: "#ef0a07", bgColor: "#fcd6d5" };
    }

    // fallback to normal dashboard status
    return getStatusDetails(rowData);
  }

  const getDueStatus = (scheduledDate?: string | Date): string => {
    if (!scheduledDate) return "-";

    const today = new Date();
    const target = new Date(scheduledDate);

    // remove time
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Due today";

    if (diffDays === 1) return "Due tomorrow";

    if (diffDays > 1 && diffDays < 30) return `Due in ${diffDays} days`;

    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;
      return `Due in ${months} month(s) ${days} day(s)`;
    }

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;

    return "-";
  };

  function rowStatus(rowData: PaymentRequestData) {
    // 👉 If Scheduled tab
    if (activeTab === 1) {
      const dueText = getDueStatus(rowData.PaymentScheduledDate);

      return (
        <span
          style={{
            backgroundColor: "#fef3c7",
            color: "#92400e",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 500,
            display: "inline-block",
            minWidth: "140px",
            textAlign: "center",
          }}
        >
          {dueText}
        </span>
      );
    }

    // Default existing logic
    const status =
      activeTab === 3 ? getMyRequestStatus(rowData) : getStatusDetails(rowData);

    return (
      <span
        style={{
          backgroundColor: status.bgColor,
          color: status.color,
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 500,
          display: "inline-block",
          minWidth: "120px",
          textAlign: "center",
        }}
      >
        {status.text}
      </span>
    );
  }

  function rowSubCategory(rowData: PaymentRequestData) {
    const paymentType = rowData.PaymentType;

    // Vendor / Freelancer
    if (
      paymentType === "Vendor Payments" ||
      paymentType === "Freelancer Payment"
    ) {
      return <span>{rowData.TypeOfService || "-"}</span>;
    }

    // N/A cases
    if (
      paymentType === "Transfer of funds-miscellaneous" ||
      paymentType === "Labour Welfare Fund"
    ) {
      return <span>N/A</span>;
    }

    // Subcategory lookup cases
    if (
      [
        "Employee benefits",
        "Reimbursement",
        "Group health insurance",
        "EB bills",
        "Internet recharges",
        "Rent",
      ].includes(paymentType || "")
    ) {
      return <span>{rowData.RequestForsubCategory?.Subcategory || "-"}</span>;
    }

    // Month/Year cases
    if (
      ["ESI", "Salary", "PF", "TDS", "GST", "Profess tax"].includes(
        paymentType || "",
      )
    ) {
      return <span>{rowData.SubcategoryDate || "-"}</span>;
    }

    return <span>-</span>;
  }

  useEffect(() => {
    if (modalType === "EDIT") {
      setActiveEditTab(0);
    }
  }, [modalType]);

  const onRowClickHandler = (rowData: PaymentRequestData) => {
    if (activeTab === 3) {
      // My Request tab → Edit mode
      onEditRequestClick(rowData);
    } else if (activeTab === 0 || activeTab === 1) {
      // All Request / Scheduled → Proceed mode
      onProceedClick(rowData);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.warn("Main category is required");
      return;
    }

    const mainCategory = newCategoryName.trim();
    const subCategory = newSubCategoryName.trim();

    try {
      // duplicate check (main category)
      const existingMain = paymentType.some(
        (item) => item.name.toLowerCase() === mainCategory.toLowerCase(),
      );

      if (existingMain) {
        toast.warn("Main category already exists");
        return;
      }

      // STEP 1 — Add choice column category
      const choiceResult = await addPaymentTypeChoice(mainCategory);

      if (!choiceResult.success) {
        toast.error(choiceResult.message);
        return;
      }

      // STEP 2 — Add MainCategory list item
      const mainCategoryResponse = await addNewCategory({
        MainCategory: mainCategory,
      });

      if (mainCategoryResponse.error) {
        toast.error(
          "Category added in choice column but failed in MainCategory list",
        );

        return;
      }

      const mainCategoryID =
        mainCategoryResponse?.data?.data?.ID ||
        mainCategoryResponse?.data?.data?.ID;

      // STEP 3 — Add SubCategory (optional)
      if (subCategory) {
        const subCategoryResponse = await addNewSubCategory({
          Subcategory: subCategory,

          MaincategoryId: mainCategoryID, // lookup column requires Id
        });

        if (subCategoryResponse.error) {
          toast.error("Main category created but subcategory failed");

          return;
        }
      }

      // refresh dropdown category list
      const { data } = await fetchPaymentType();

      if (data) {
        setpaymentType(data);
      }

      toast.success("Category created successfully");

      // reset modal state
      setNewCategoryName("");
      setNewSubCategoryName("");
      setShowCategoryModal(false);
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        {/* Tabs section */}
        <div className={styles.tabs}>
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === index ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
            </div>
          ))}

          {/* Sliding underline */}
          <span
            className={styles.underline}
            style={{
              transform: `translateX(${activeTab * 100}%)`,
            }}
          />
        </div>
        {/* Buttons on right */}
        <div className={styles.actions}>
          <button
            className={styles.ctgryBtn}
            onClick={() => setShowCategoryModal(true)}
          >
            New Category
          </button>
          <button className={styles.headerBtn} onClick={onAddNewRequestClick}>
            My Request
          </button>
          <button
            className={styles.headerBtn}
            onClick={async () => {
              // reset filters
              setSelectedStatus(null);
              setSelectedPaymentType(null);
              setSelectedRequestedBy("");
              setSelectedInvoice("All");
              setSearchText("");
              setShowFlaggedOnly(false);

              // reload data
              await Promise.all([
                fetchPaymentRequestData(),
                fetchRequestPaymentData(),
              ]);
            }}
          >
            {" "}
            <i className="fa-solid fa-arrow-rotate-right" />
          </button>
        </div>
      </div>

      {/* Filter section */}

      <div className={styles.filterRow}>
        {(activeTab === 0 || activeTab === 1) && (
          <div className={styles.flaggedBox}>
            <input
              type="checkbox"
              checked={showFlaggedOnly}
              onChange={(e) => setShowFlaggedOnly(e.target.checked ?? false)}
            />
            <span className={styles.flaggedText}>Flagged</span>
          </div>
        )}

        <InputField
          type="dropdown"
          label=""
          id="status"
          value={selecteStatus}
          onChange={(e) => setSelectedStatus(e.value)}
          options={status.map((item) => ({
            label: item.name,
            value: item,
          }))}
          className={styles.filterDropdown}
          placeholder="Status"
        />

        <InputField
          type="dropdown"
          label=""
          id="paymentType"
          value={selectePaymentType}
          onChange={(e) => setSelectedPaymentType(e.value)}
          options={paymentType.map((item) => ({
            label: item.name,
            value: item,
          }))}
          className={styles.filterDropdown}
          placeholder="Category"
        />

        <InputField
          type="dropdown"
          label=""
          id="requestedBy"
          value={selectedRequestedBy}
          onChange={(e) => setSelectedRequestedBy(e.value)}
          options={requestedByOptions.map((item) => ({
            label: item.Value,
            value: item.Mail,
          }))}
          className={styles.filterDropdown}
          placeholder="Requested by"
        />

        <InputField
          type="dropdown"
          label=""
          id="invoiceFilter"
          value={selectedInvoice}
          onChange={(e) => setSelectedInvoice(e.value)}
          options={[
            { label: "All", value: "All" },
            { label: "Without invoices", value: "Without invoices" },
            { label: "With invoices", value: "With invoices" },
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
        {paymentRequestDataLoading ? (
          <div className={styles.loaderWrapper}>
            <img
              src={loaderLogo}
              alt="Loading..."
              className={styles.loaderImage}
            />
            <p>Loading data...</p>
          </div>
        ) : activeTab === 2 ? (
          <Table
            value={completedDashboardData}
            dataKey="Id"
            loading={paymentRequestDataLoading}
            paginator
            rows={10}
            emptyMessage="No data available"
            columns={[
              {
                field: "RequestID",
                header: "Request Id",
                body: (rowData) => ellipsisTemplate(rowData.RequestID, "100px"),
              },
              {
                field: "RequestBy",
                header: "Requested By",
                body: (rowData) => rowRequestedBy(rowData),
              },
              {
                field: "RequestFor",
                header: "Category",
                body: (rowData) =>
                  ellipsisTemplate(rowData.RequestFor, "120px"),
              },
              {
                field: "ReqAmount",
                header: "Requested Amount",
                body: (rowData) => rowReqAmount(rowData),
              },
              {
                field: "TDS",
                header: "TDS",
                body: (rowData) => rowTdsAmount(rowData),
              },

              {
                field: "OtherDeduction",
                header: "Other Deduction",
                body: (rowData) => rowODAmount(rowData),
              },
              { field: "GSDAmount", header: "GST Amount" },
              {
                field: "FinalAmount",
                header: "Final Amount",
                body: (rowData) => rowFinalAmount(rowData),
              },
            ]}
          />
        ) : (
          <Table
            value={filteredPaymentRequests}
            dataKey="Id"
            loading={paymentRequestDataLoading}
            paginator
            rows={10}
            onRowClick={(e) => onRowClickHandler(e.data as PaymentRequestData)}
            emptyMessage="No data available"
            columns={[
              {
                field: "RequestID",
                header: "Request Id",
                body: (rowData) => ellipsisTemplate(rowData.RequestID, "100px"),
              },
              {
                field: "Date",
                header: "Date",
                body: (rowData) => rowDate(rowData),
              },
              {
                field: "PaymentType",
                header: "Category",
                body: (rowData) =>
                  ellipsisTemplate(rowData.PaymentType, "120px"),
              },
              {
                field: "",
                header: "Sub-Category",
                body: (rowData) => rowSubCategory(rowData),
              },
              {
                header: "Payment To",
                body: (rowData) => rowPaymentTo(rowData),
              },
              ...(activeTab === 3
                ? [
                    {
                      field: "Amount",
                      header: "Requested Amount",
                      body: (rowData: any) => rowRequestedAmount(rowData),
                    },
                  ]
                : []),
              {
                field: "FinalApprovedAmount",
                header: "Approved Amount",
                body: (rowData) => rowApprovedAmount(rowData),
              },
              //{ field: "PaymentProcess", header: "Status" },
              {
                field: "PaymentProcess",
                header: "Status",
                body: (rowData) => rowStatus(rowData),
              },
              {
                field: "PersonName",
                header: "Requested By",
                body: (rowData) => rowRequestedBy(rowData),
              },

              ...(activeTab === 0 || activeTab === 1
                ? [
                    {
                      header: "",
                      body: (rowData: any) => rowFlag(rowData),
                    },
                  ]
                : []),
              //{ header: "Actions", body: (rowData) => rowActions(rowData) },
              ...(activeTab === 3
                ? [
                    {
                      header: "Actions",
                      body: (rowData: any) => rowActions(rowData),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </div>
      <SideModal
        title={modalType === "ADD" ? "Add New Request" : "Request Info"}
        visible={showSideModal}
        onHide={() => setShowSideModal(false)}
        size="lg"
        animate
      >
        {modalType === "ADD" && (
          <AddRequest
            context={context}
            onClose={() => setShowSideModal(false)}
            onAddNewRequestClick={onAddNewRequestClick}
            selectedRow={selectedRow}
            refreshDashboard={fetchPaymentRequestData}
          />
        )}

        {modalType === "EDIT" && (
          <EditMyRequest
            context={context}
            onClose={() => setShowSideModal(false)}
            selectedRow={selectedRow}
            allRequestPayments={allRequestPayments}
            mode={editMode}
            onCloneRequest={onCloneRequestClick}
            refreshDashboard={fetchPaymentRequestData}
          />
        )}
      </SideModal>
      {showCategoryModal && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <p className={styles.ctgryHeaderLbl}>Add Category</p>
            <div className={styles.ctgryCon}>
              <InputField
                type="input-text"
                label="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                labelClassName={styles.categoryLabel}
              />
            </div>
            <div className={styles.ctgryCon}>
              <InputField
                type="input-text"
                label="Sub Category"
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                placeholder="Enter sub category"
              />
            </div>

            <div className={styles.confirmButtons}>
              <Button
                label="Cancel"
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName("");
                  setNewSubCategoryName("");
                }}
                className={styles.cancelButton}
              />
              <Button
                label="Submit"
                onClick={handleAddCategory}
                className={styles.submitButton}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
