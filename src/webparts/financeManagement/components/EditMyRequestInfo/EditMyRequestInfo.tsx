import * as React from "react";
import styles from "./EditMyRequestInfoStyle.module.scss";
import { useState, useEffect, useMemo } from "react";
import { Button } from "primereact/button";
import { formatDate } from "../../../../utils/date";
import { graph } from "@pnp/graph/presets/all";
import InputField from "../InputField/InputField";
import { mapToDropdownOptions } from "../../../../utils/dropdown";
import {
  CategoryData,
  VendorData,
  SubCategoryData,
  FreelancerData,
  ProjectTagData,
  FTActionCategoryData,
  IDepartmentData,
  IEntityData,
} from "../../../../types";
import {
  fetchCategoryChoices,
  fetchProjectTags,
  fetchFTActionChoices,
  addNewRequest,
  fetchRequestPayment,
  fetchDepartmentChoices,
  fetchEntityChoices,
} from "../../../../CommonServices/PaymentRequestService";
import { toast } from "react-toastify";
import { fetchVendors } from "../../../../CommonServices/VendorService";
import { fetchSubCategories } from "../../../../CommonServices/CategoryService";
import { fetchFreelancers } from "../../../../CommonServices/FreelancerService";
import { PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import SPServices from "../../../../CommonServices/SPServices";
import SideModal from "../SideModal/SideModal";
import FinanceAction from "../FinanceAction/FinanceAction";
import AddVendor from "../AddVendor/AddVendor";
import AddFreelancer from "../AddFreelancer/AddFreelancer";

interface EditRequestInfoProps {
  context: any;
  selectedRow: any | undefined;
  mode: "PROCEED" | "VIEW";
  isEditing: boolean;
  onClose: () => void;
  refreshData: () => void;
  setIsEditing: (value: boolean) => void;
}

type SubCategoryOption = {
  Name: string;
  Id: number;
  MainCategory: string;
};

type YearOption = {
  Year: number;
};

//export const managerId = "89f06eed-8c60-4435-9abf-0f68c7e72182";
export const managerId = "936e8d49-7b43-4874-890b-ee3e475f6f41";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function EditRequestInfo({
  context,
  selectedRow,
  mode,
  isEditing,
  onClose,
  refreshData,
  setIsEditing,
}: EditRequestInfoProps) {
  console.log("Selected Row : ", selectedRow);
  const [formData, setFormData] = useState<any | null>(null);
  const [isManager, setIsManager] = React.useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null,
  );
  const typeOfServices = [
    {
      Name: "Goods",
      Id: null,
    },
    {
      Name: "Services",
      Id: null,
    },
  ];
  const [selectedTypeOfService, setSelectedTypeOfService] = useState<{
    Name: string;
    Id: string | null;
  } | null>(null);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [selectedPaymentToVendor, setSelectedPaymentToVendor] =
    useState<VendorData | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<SubCategoryOption | null>(null);
  const [freelancers, setFreelancers] = useState<FreelancerData[]>([]);
  const [selectedFreelancers, setSelectedFreelancers] =
    useState<FreelancerData | null>(null);
  const [amount, setAmount] = useState("");
  const [checked, setChecked] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [tags, setTags] = useState<ProjectTagData[]>([]);
  const [selecteTag, setSelectedTag] = useState<ProjectTagData | null>(null);
  const [department, setDepartment] = useState<IDepartmentData[]>([]);
  const [selectedDepartment, setSelectedDepartment] =
    useState<IDepartmentData | null>(null);
  const [entity, setEntity] = useState<IEntityData[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<IEntityData | null>(
    null,
  );
  const [ftAction, setFtAction] = useState<FTActionCategoryData[]>([]);
  const [selectedFtAction, setSelectedFtAction] =
    useState<FTActionCategoryData | null>(null);
  const [showFinancePopup, setShowFinancePopup] = useState(false);
  const [allRequestPayments, setAllRequestPayments] = useState<any[]>([]);

  const [showPopup, setShowPopup] = useState(false);

  const [popupType, setPopupType] = useState<"VENDOR" | "FREELANCER" | null>(
    null,
  );

  const [popupMode, setPopupMode] = useState<"ADD" | "VIEW">("ADD");

  const [selectedVendorForPopup, setSelectedVendorForPopup] =
    useState<VendorData | null>(null);

  const [selectedFreelancerForPopup, setSelectedFreelancerForPopup] =
    useState<FreelancerData | null>(null);

  const vendorCategories = [
    "Vendor Payments",
    "EB bills",
    "Internet recharges",
    "Rent",
    "PF",
    "ESI",
    "Profess tax",
    "GST",
    "TDS",
    "Group health insurance",
    "Transfer of funds-miscellaneous",
    "Labour Welfare Fund",
    "Salary",
  ];

  const handleAddClick = () => {
    if (!selectedCategory) return;

    if (vendorCategories.includes(selectedCategory.name)) {
      setPopupType("VENDOR");
    } else {
      setPopupType("FREELANCER");
    }

    setPopupMode("ADD");
    setShowPopup(true);
  };

  const handleViewClick = () => {
    if (!selectedCategory) return;

    if (vendorCategories.includes(selectedCategory.name)) {
      setPopupType("VENDOR");

      setSelectedVendorForPopup(
        selectedPaymentToVendor || selectedVendor || null,
      );
    } else {
      setPopupType("FREELANCER");

      setSelectedFreelancerForPopup(selectedFreelancers || null);
    }

    setPopupMode("VIEW");
    setShowPopup(true);
  };

  // const managerId = "89f06eed-8c60-4435-9abf-0f68c7e72182";
  const managerId = "936e8d49-7b43-4874-890b-ee3e475f6f41";
  console.log("test");

  useEffect(() => {
    const loadFtActionCategories = async () => {
      const { data, error } = await fetchFTActionChoices();
      if (data) {
        setFtAction(data);
      } else {
        toast.error("Failed to load roles");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadFtActionCategories();
  }, []);

  const onFinanceActionClick = () => {
    setShowFinancePopup(true);
  };

  const months = [
    { Name: "Jan" },
    { Name: "Feb" },
    { Name: "Mar" },
    { Name: "Apr" },
    { Name: "May" },
    { Name: "Jun" },
    { Name: "Jul" },
    { Name: "Aug" },
    { Name: "Sep" },
    { Name: "Oct" },
    { Name: "Nov" },
    { Name: "Dec" },
  ];

  const [selectedMonth, setSelectedMonth] = useState<{ Name: string } | null>(
    null,
  );

  const [years, setYears] = useState<YearOption[]>([]);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const loadProjectTags = async () => {
      const { data } = await fetchProjectTags();
      if (data) {
        setTags(data);
      } else {
        toast.error("Failed to load roles");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadProjectTags();
  }, []);

  useEffect(() => {
    const loadDepartmentChoices = async () => {
      const { data } = await fetchDepartmentChoices();
      if (data) {
        setDepartment(data);
      } else {
        toast.error("Failed to load roles");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadDepartmentChoices();
  }, []);

  useEffect(() => {
    const loadEntityChoices = async () => {
      const { data } = await fetchEntityChoices();
      if (data) {
        setEntity(data);
      } else {
        toast.error("Failed to load entities");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadEntityChoices();
  }, []);

  useEffect(() => {
    const loadCatogories = async () => {
      const { data } = await fetchCategoryChoices();
      if (data) {
        setCategories(data);
      } else {
        toast.error("Failed to load roles");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadCatogories();
  }, []);

  useEffect(() => {
    if (!selectedRow || categories.length === 0) return;

    const category = categories.find((c) => c.name === selectedRow.PaymentType);

    if (category) {
      setSelectedCategory(category);
    }
  }, [selectedRow, categories]);

  useEffect(() => {
    const loadVendors = async () => {
      const { data } = await fetchVendors();
      if (data) {
        const filtered = data.filter(
          (item) => item.IsDeleted !== true && item.ActiveStatus === true,
        );
        setVendors(filtered);
      } else {
        toast.error("Failed to load roles");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadVendors();
  }, []);

  useEffect(() => {
    const loadFreelancers = async () => {
      const { data } = await fetchFreelancers();
      if (data) {
        const filtered = data.filter(
          (item) => item.IsDeleted !== true && item.ActiveStatus === true,
        );
        setFreelancers(filtered);
      } else {
        toast.error("Failed to load roles");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadFreelancers();
  }, []);

  useEffect(() => {
    const loadSubCategories = async () => {
      const { data } = await fetchSubCategories();

      if (data) {
        setSubCategories(
          data.map((item: SubCategoryData) => ({
            Name: item.Subcategory,
            Id: item.Id,
            MainCategory: item.Maincategory?.MainCategory ?? "",
          })),
        );
      } else {
        toast.error("Failed to load sub categories");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadSubCategories();
  }, []);

  useEffect(() => {
    const loadPayments = async () => {
      const response = await fetchRequestPayment();

      if (response.data) {
        setAllRequestPayments(response.data);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadPayments();
  }, []);

  useEffect(() => {
    const currentYear = new Date().getFullYear() - 2;

    const generatedYears: YearOption[] = [];

    for (let i = 0; i <= 6; i++) {
      generatedYears.push({ Year: currentYear + i });
    }

    setYears(generatedYears);
  }, []);

  const filteredSubCategories = useMemo(() => {
    if (!selectedCategory) return [];

    return subCategories.filter(
      (sc) => sc.MainCategory === selectedCategory.name,
    );
  }, [selectedCategory, subCategories]);

  const visibleCategories = [
    "Freelancer Payment",
    "Vendor Payments",
    "Employee benefits",
    "Reimbursement",
    "EB bills",
    "Internet recharges",
    "Rent",
    "Group health insurance",
    "Transfer of funds-miscellaneous",
    "Labour Welfare Fund",
  ];

  const isCategoryWithPayment =
    !!selectedCategory && visibleCategories.includes(selectedCategory.name);

  const visibleCategoriesTwo = [
    "Salary",
    "PF",
    "ESI",
    "Profess tax",
    "GST",
    "TDS",
  ];

  const isCategoryWithPaymentTwo =
    !!selectedCategory && visibleCategoriesTwo.includes(selectedCategory.name);
  const visiblePaymentTo = [
    "EB bills",
    "Internet recharges",
    "Rent",
    "PF",
    "ESI",
    "Profess tax",
    "GST",
    "TDS",
    "Vendor Payments",
    "Freelancer Payment",
    "Group health insurance",
    "Salary",
  ];

  const isPaymentTo =
    !!selectedCategory && visiblePaymentTo.includes(selectedCategory.name);

  const labelNames = [
    "Freelancer Payment",
    "Vendor Payments",
    "Employee benefits",
    "Reimbursement",
    "EB bills",
    "Internet recharges",
    "Rent",
    "Group health insurance",
    "TDS",
  ];

  const isSubCategory =
    !!selectedCategory && labelNames.includes(selectedCategory.name);

  const subCategoryLabel = isSubCategory ? "Sub-Category" : "Payment to";

  const isMarriageGift = selectedSubCategory?.Name === "Marriage Gift";

  useEffect(() => {
    if (isMarriageGift) {
      setAmount("50000");
    } else {
      setAmount("");
    }
  }, [isMarriageGift]);

  const addIcon = [
    "Freelancer Payment",
    "Vendor Payments",
    "EB bills",
    "Internet recharges",
    "Rent",
    "PF",
    "ESI",
    "Profess tax",
    "GST",
    "Group health insurance",
    "Transfer of funds-miscellaneous",
    "Labour Welfare Fund",
    "Salary",
    "TDS",
  ];

  const isAddIcon =
    !!selectedCategory && addIcon.includes(selectedCategory.name);

  const isPaymentToSelected = !!(selectedCategory?.name === "Freelancer Payment"
    ? selectedFreelancers
    : selectedPaymentToVendor);

  useEffect(() => {
    if (!selectedRow) return;

    // basic values
    setAmount(selectedRow.Amount?.toString() || "");
    setInvoiceNumber(selectedRow.InvoiceNumber || "");
    setDescription(selectedRow.Description || "");
    setChecked(selectedRow.InvoiceNotApplicable || false);

    // month & year
    if (selectedRow.SubcategoryDate) {
      const [month, year] = selectedRow.SubcategoryDate.split("/");

      const monthObj = months.find((m) => m.Name === month);
      const yearObj = years.find((y) => y.Year === Number(year));

      if (monthObj) setSelectedMonth(monthObj);
      if (yearObj) setSelectedYear(yearObj);
    }

    // category
    const categoryObj = categories.find(
      (c) => c.name === selectedRow.PaymentType,
    );
    if (categoryObj) {
      setSelectedCategory(categoryObj);
    }

    if (selectedRow.RequestForsubCategoryId) {
      const sub = subCategories.find(
        (s) => s.Id === selectedRow.RequestForsubCategoryId,
      );

      if (sub) {
        if (
          selectedRow.PaymentType === "Freelancer Payment" ||
          selectedRow.PaymentType === "Vendor Payments"
        ) {
          // ⚠️ IMPORTANT: map correctly instead of direct assign
          const matchedType = typeOfServices.find((t) => t.Name === sub.Name);

          if (matchedType) {
            setSelectedTypeOfService(matchedType);
          }
        } else if (
          selectedRow.PaymentType === "Transfer of funds-miscellaneous" ||
          selectedRow.PaymentType === "Labour Welfare Fund"
        ) {
          const vendor = vendors.find(
            (v) => v.Id === selectedRow.VendorName?.Id,
          );
          if (vendor) setSelectedVendor(vendor);
        } else {
          setSelectedSubCategory(sub);
        }
      }
    }

    // vendor
    if (selectedRow.VendorName?.Id) {
      const vendor = vendors.find((v) => v.Id === selectedRow.VendorName.Id);
      if (vendor) setSelectedPaymentToVendor(vendor);
    }

    // freelancer
    if (selectedRow.PaymentFor?.Id) {
      const freelancer = freelancers.find(
        (f) => f.Id === selectedRow.PaymentFor.Id,
      );
      if (freelancer) setSelectedFreelancers(freelancer);
    }

    // tag
    /*if (selectedRow.Tags?.Id) {
      const tag = tags.find((t) => t.Id === selectedRow.Tags.Id);
      if (tag) setSelectedTag(tag);
    }*/
    if (selectedRow.Tags) {
      const tagMatch = tags.find((tag) => tag.Title === selectedRow.Tags);

      if (tagMatch) {
        setSelectedTag(tagMatch);
      }
    }

    if (selectedRow.Department) {
      const departmentMatch = department.find(
        (dep) => dep.name === selectedRow.Department,
      );
      if (departmentMatch) {
        setSelectedDepartment(departmentMatch);
      }
    }
    if (selectedRow.Entity) {
      const entityMatch = entity.find((e) => e.name === selectedRow.Entity);
      if (entityMatch) {
        setSelectedEntity(entityMatch);
      }
    }
  }, [
    selectedRow,
    categories,
    subCategories,
    vendors,
    freelancers,
    tags,
    department,
    entity,
    years,
  ]);

  useEffect(() => {
    if (!selectedRow?.PersonName?.EMail) return;

    const checkIsManager = async () => {
      try {
        const members = await graph.groups.getById(managerId).members();

        const requesterEmail = selectedRow.PersonName.EMail.toLowerCase();

        const isUserManager = members.some(
          (member: any) =>
            member.mail?.toLowerCase() === requesterEmail ||
            member.userPrincipalName?.toLowerCase() === requesterEmail,
        );

        setIsManager(isUserManager);
      } catch (error) {
        console.error("Error fetching manager group members", error);
        setIsManager(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    checkIsManager();
  }, [selectedRow]);

  const getManagerApprovalStatus = (
    row: typeof selectedRow | undefined,
    isManager: boolean,
  ): string => {
    if (!row) return "-";

    // 👉 If user is manager → N/A
    if (isManager) {
      return "N/A";
    }

    // 👉 Not manager → check approval
    if (row.ApproverStatus === true) {
      return "Approved";
    }

    if (row.RejectedBy?.EMail) {
      return "Rejected";
    }

    return "Pending";
  };

  const managerStatus = getManagerApprovalStatus(selectedRow, isManager);

  const getSubCategoryOptions = () => {
    if (!selectedCategory) return [];

    const categoryName = selectedCategory.name;

    if (
      categoryName === "Freelancer Payment" ||
      categoryName === "Vendor Payments"
    ) {
      return mapToDropdownOptions(typeOfServices, {
        label: (i) => i.Name,
        value: (i) => i,
      });
    }

    if (
      categoryName === "Transfer of funds-miscellaneous" ||
      categoryName === "Labour Welfare Fund"
    ) {
      return mapToDropdownOptions(vendors, {
        label: (i) => i.VendorName, // adjust field if different
        value: (i) => i,
      });
    }

    return mapToDropdownOptions(filteredSubCategories, {
      label: (i) => i.Name,
      value: (i) => i,
    });
  };

  const getCeoApprovalStatus = (
    row: typeof selectedRow | undefined,
  ): string => {
    if (!row) return "-";

    if (row.CEOStatus === true) {
      return "Approved";
    }

    if (row.FinalRejectedBy?.EMail) {
      return "Rejected";
    }

    return "Pending";
  };

  const ceoApprovalText = getCeoApprovalStatus(selectedRow);

  const getOverallRequestStatus = (
    row: typeof selectedRow | undefined,
  ): string => {
    if (!row) return "-";

    const status = row.Status;
    const paymentProcess = row.PaymentProcess ?? "";
    const financeAction = row.FinanceTeamAction ?? "";

    const hasRequest = allRequestPayments.some(
      (item) => item.RequestID === row.Id,
    );

    const relatedRequest = allRequestPayments.find(
      (item) => item.RequestID === row.Id,
    );

    const hasParent =
      relatedRequest &&
      allRequestPayments.some(
        (item) => item.ParentReqPayID === relatedRequest.Id,
      );

    // 1. Pending with CEO
    if (
      status === "Inprogress" &&
      row.ApproverStatus === true &&
      row.CEOStatus === false
    ) {
      return "Pending with CEO";
    }

    // 2. Rejected by CEO
    if (status === "Rejected") {
      return "Rejected by CEO";
    }

    if (
      status === "Approved" &&
      paymentProcess === "Inprogress" &&
      hasRequest &&
      hasParent
    ) {
      return "Partially Paid";
    }

    // 3. Payment On Hold
    if (
      status === "Approved" &&
      paymentProcess === "Inprogress" &&
      financeAction === "On Hold"
    ) {
      return "Payment On Hold";
    }

    // 4. Scheduled Payment
    if (
      financeAction === "Schedule Payment" &&
      paymentProcess === "Inprogress" &&
      status === "Approved"
    ) {
      return row.PaymentScheduledDate
        ? `Scheduled On ${formatDate(row.PaymentScheduledDate)}`
        : "Scheduled";
    }

    // 5. Payment Cancelled
    if (
      status === "Approved" &&
      paymentProcess === "Completed" &&
      financeAction === "Cancel Payment"
    ) {
      return "Payment Cancelled";
    }

    // 6. Pending for Payment
    if (status === "Approved" && paymentProcess === "Inprogress") {
      return "Pending for Payment";
    }

    // 7. Payment Completed
    if (status === "Approved" && paymentProcess === "Completed") {
      return "Payment Completed";
    }

    return "-";
  };

  const overallStatusText = getOverallRequestStatus(selectedRow);

  const updateRequest = async () => {
    if (!selectedRow?.Id) {
      toast.error("Invalid request");
      return;
    }

    const payload = {
      PaymentType: formData.Category,
      Amount: amount,
      InvoiceNumber: formData.InvoiceNumber,
      Description: formData.Description,
      RequestForsubCategoryId: formData.SubCategoryId,
      SubcategoryDate:
        formData.Month && formData.Year
          ? `${formData.Month}/${formData.Year}`
          : null,
      Tags: formData.Tags,
      Department: formData.Department,
      Entity: formData.Entity,
      // SpentById: selectedUsers?.[0]?.id || null,
      SpentById: selectedUsers?.[0]?.id || selectedRow?.SpentBy?.Id || null,
    };

    try {
      await SPServices.SPUpdateItem({
        Listname: "PaymentRequestDetails",
        // ID: formData.Id,
        ID: selectedRow?.Id,
        RequestJSON: payload,
      });
      toast.success("Request updated successfully");
      setIsEditing(false);
      refreshData();
    } catch (err) {
      toast.error("Failed to update request");
      console.error(err);
    }
  };

  const isInitialLoad = React.useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // ✅ Reset only when user actually changes category
    setSelectedTypeOfService(null);
    setSelectedVendor(null);
    setSelectedSubCategory(null);
    setSelectedFreelancers(null);
    setSelectedPaymentToVendor(null);
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedRow || typeOfServices.length === 0) return;

    const selectedTypeOfService = typeOfServices.find(
      (c) => c.Name === selectedRow.TypeOfService,
    );

    if (selectedTypeOfService) {
      setSelectedTypeOfService(selectedTypeOfService);
    }
  }, [selectedRow, selectedCategory]);

  const isProcessLocked =
    selectedRow?.FinanceTeamAction === "Cancel Payment" ||
    selectedRow?.PaymentProcess === "Completed";

  const isFieldDisabled = mode === "PROCEED" ? true : !isEditing;

  console.log("selectedRowww", selectedRow);

  return (
    <div className={styles.pageBg}>
      <div className={styles.headerCard}>
        {/* ROW 1 */}
        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>Request ID</span>
            <span className={styles.value}>{selectedRow?.RequestID}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <span className={styles.label}>Requested By</span>
            <span className={styles.value}>
              {selectedRow?.PersonName.Title}
            </span>
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <span className={styles.statusBadge}>{overallStatusText}</span>
          </div>
        </div>

        {/* ROW 2 */}
        <div className={styles.row}>
          <div className={styles.field}>
            <span className={styles.label}>Date</span>
            <span className={styles.value}>
              {selectedRow?.Date ? formatDate(selectedRow.Date) : "-"}
            </span>
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <span className={styles.label}>Manager Approval</span>
            <span
              className={
                managerStatus === "Approved"
                  ? styles.valueApproved
                  : managerStatus === "Rejected"
                    ? styles.valueRejected
                    : managerStatus === "Pending"
                      ? styles.valuePending
                      : styles.valueMuted
              }
            >
              {managerStatus}
            </span>
          </div>

          <div className={styles.divider} />

          <div className={styles.field}>
            <span className={styles.label}>CEO Approval</span>
            <span
              className={
                ceoApprovalText === "Approved"
                  ? styles.valueApproved
                  : ceoApprovalText === "Rejected"
                    ? styles.valueRejected
                    : styles.valuePending
              }
            >
              {ceoApprovalText}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.bodyCard}>
        <div className={styles.container}>
          <div className={styles.formGrid}>
            <InputField
              type="dropdown"
              label="Category"
              id="category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.value); // ✅ IMPORTANT

                setFormData((prev: any) => ({
                  ...prev,
                  Category: e.value?.name || "",
                }));
              }}
              options={mapToDropdownOptions(categories, {
                label: (i) => i.name,
                value: (i) => i,
              })}
              placeholder="Select"
              className="w-full"
              checkmark
              highlightOnSelect={false}
              disabled={isFieldDisabled}
            />

            {isCategoryWithPayment && (
              <InputField
                type="dropdown"
                label={subCategoryLabel} //"Sub Category"
                id="subCategory"
                //value={selectedTypeOfService}
                value={
                  selectedCategory?.name === "Freelancer Payment" ||
                  selectedCategory?.name === "Vendor Payments"
                    ? selectedTypeOfService
                    : selectedCategory?.name ===
                          "Transfer of funds-miscellaneous" ||
                        selectedCategory?.name === "Labour Welfare Fund"
                      ? selectedVendor
                      : selectedSubCategory
                }
                //onChange={(e) => setSelectedTypeOfService(e.value)}
                onChange={(e) => {
                  if (
                    selectedCategory?.name === "Freelancer Payment" ||
                    selectedCategory?.name === "Vendor Payments"
                  ) {
                    setSelectedTypeOfService(e.value);
                  } else if (
                    selectedCategory?.name ===
                      "Transfer of funds-miscellaneous" ||
                    selectedCategory?.name === "Labour Welfare Fund"
                  ) {
                    setSelectedVendor(e.value);
                  } else {
                    setSelectedSubCategory(e.value);
                  }
                }}
                options={getSubCategoryOptions()}
                placeholder="Select"
                className="w-full"
                checkmark
                highlightOnSelect={false}
                disabled={isFieldDisabled}
              />
            )}
            {isCategoryWithPaymentTwo && (
              <div className={styles.halfColumn}>
                <div className={styles.splitField}>
                  <InputField
                    type="dropdown"
                    label="Month"
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.value);
                    }}
                    options={mapToDropdownOptions(months, {
                      label: (i) => i.Name,
                      value: (i) => i,
                    })}
                    placeholder="Select"
                    className="w-full"
                    checkmark
                    highlightOnSelect={false}
                    disabled={isFieldDisabled}
                  />

                  <InputField
                    type="dropdown"
                    label="Year"
                    id="year"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.value)}
                    options={mapToDropdownOptions(years, {
                      label: (i) => i.Year.toString(),
                      value: (i) => i,
                    })}
                    placeholder="Select"
                    className="w-full"
                    checkmark
                    highlightOnSelect={false}
                    disabled={isFieldDisabled}
                  />
                </div>
              </div>
            )}

            {isPaymentTo && (
              <InputField
                type="dropdown"
                //label="Payment To"
                label={
                  <span className={styles.labelWithIcon}>
                    <span>Payment To</span>

                    {mode !== "PROCEED" && (
                      <span className={styles.iconGroup}>
                        {isAddIcon && (
                          <i
                            className="fa-solid fa-plus"
                            title="Add"
                            onClick={handleAddClick}
                          />
                        )}

                        {isPaymentToSelected && (
                          <i
                            className="fa-regular fa-eye"
                            title="View"
                            onClick={handleViewClick}
                          />
                        )}
                      </span>
                    )}
                  </span>
                }
                id="paymentto"
                value={
                  selectedCategory?.name === "Freelancer Payment"
                    ? selectedFreelancers
                    : selectedPaymentToVendor
                }
                onChange={(e) => {
                  if (selectedCategory?.name === "Freelancer Payment") {
                    setSelectedFreelancers(e.value);
                  } else {
                    setSelectedPaymentToVendor(e.value);
                  }
                }}
                options={
                  selectedCategory?.name === "Freelancer Payment"
                    ? mapToDropdownOptions(freelancers, {
                        label: (i) => i.FreelancerName, // adjust field name if needed
                        value: (i) => i,
                      })
                    : mapToDropdownOptions(vendors, {
                        label: (i) => i.VendorName,
                        value: (i) => i,
                      })
                }
                placeholder="Select"
                className="w-full"
                checkmark
                highlightOnSelect={false}
                disabled={isFieldDisabled}
              />
            )}
            <InputField
              type="input-text"
              label="Amount"
              id="amount"
              className="w-full"
              placeholder="Enter"
              value={amount}
              disabled={isMarriageGift || isFieldDisabled}
              onChange={(e) => {
                setAmount(e.target.value);
                setFormData((prev: any) => ({
                  ...prev,
                  Amount: e.target.value,
                }));
              }}
            />

            <div className={styles.toggleField}>
              <label className={styles.toggleLabel}>Invoice Applicable</label>
              <input
                className={styles.checkBox}
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                disabled={isFieldDisabled}
              />
            </div>

            <InputField
              type="input-text"
              label="Invoice Number"
              id="invoicenumber"
              className="w-full"
              placeholder="Enter"
              value={invoiceNumber}
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
                setFormData((prev: any) => ({
                  ...prev,
                  invoiceNumber: e.target.value,
                }));
              }}
              disabled={isFieldDisabled}
            />

            <InputField
              type="dropdown"
              label="Tag"
              id="tag"
              value={selecteTag}
              onChange={(e) => {
                setSelectedTag(e.value);
                setFormData((prev: any) => ({
                  ...prev,
                  Tags: e.value?.Title || "",
                }));
              }}
              options={mapToDropdownOptions(tags, {
                label: (i) => i.Title,
                value: (i) => i,
              })}
              placeholder="Select"
              className="w-full"
              checkmark
              highlightOnSelect={false}
              disabled={isFieldDisabled}
            />
            <InputField
              type="people-picker"
              key={selectedRow?.Id}
              label="Spent By"
              id="spendby"
              context={context}
              personSelectionLimit={1}
              showtooltip={true}
              ensureUser={true}
              principalTypes={[PrincipalType.User]} // ✅ this is valid
              webAbsoluteUrl={context.pageContext.web.absoluteUrl}
              //defaultSelectedUsers={[]}
              defaultSelectedUsers={
                selectedRow?.SpentBy?.EMail ? [selectedRow.SpentBy.EMail] : []
              }
              onChange={(items) => {
                const filtered = items.filter(
                  (u) =>
                    !u.loginName?.toUpperCase().includes("EXT") &&
                    u.secondaryText &&
                    u.secondaryText !== "",
                );
                setSelectedUsers(filtered);
                setFormData((prev: any) => ({
                  ...prev,
                  SpentById:
                    filtered.length > 0 ? filtered[0].secondaryText : "",
                }));
              }}
              disabled={isFieldDisabled}
            />
            <InputField
              type="dropdown"
              label="Practice"
              id="department"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.value);
                setFormData((prev: any) => ({
                  ...prev,
                  Department: e.value?.name || "",
                }));
              }}
              options={mapToDropdownOptions(department, {
                label: (i) => i.name,
                value: (i) => i,
              })}
              placeholder="Select"
              className="w-full"
              checkmark
              highlightOnSelect={false}
              disabled={isFieldDisabled}
            />
            <InputField
              type="dropdown"
              label="Entity"
              id="entity"
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.value);
                setFormData((prev: any) => ({
                  ...prev,
                  Entity: e.value?.name || "",
                }));
              }}
              options={mapToDropdownOptions(entity, {
                label: (i) => i.name,
                value: (i) => i,
              })}
              placeholder="Select"
              className="w-full"
              checkmark
              highlightOnSelect={false}
              disabled={isFieldDisabled}
            />

            <InputField
              type="input-textarea"
              label="Description"
              id="description"
              placeholder="Enter"
              autoResize
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFormData((prev: any) => ({
                  ...prev,
                  Description: e.target.value,
                }));
              }}
              rows={5}
              className="w-full"
              disabled={isFieldDisabled}
            />

            {mode === "PROCEED" && (
              <InputField
                type="dropdown"
                label="Process"
                id="process"
                value={selectedFtAction}
                onChange={(e) => setSelectedFtAction(e.value)}
                options={mapToDropdownOptions(ftAction, {
                  label: (i) => i.name,
                  value: (i) => i,
                })}
                placeholder="Select"
                className="w-full"
                checkmark
                highlightOnSelect={false}
                disabled={isProcessLocked}
              />
            )}
          </div>
          <div className={styles.buttonsContainer}>
            <Button
              className={styles.cancelButton}
              label="Cancel"
              onClick={onClose}
              //onClick={() => onOpenCeoRejectionPopup(selectedManPowerItem)}
              //onClick={handleReject}
            />
            {mode === "VIEW" && isEditing && (
              <Button
                className={styles.submitButton}
                label="Update"
                onClick={updateRequest}
                //}}
              />
            )}
            {mode === "PROCEED" && !isProcessLocked && (
              <Button
                className={styles.submitButton}
                label="Proceed"
                onClick={() => {
                  if (!selectedFtAction) {
                    toast.warn("Please select process");
                    return;
                  }

                  setShowFinancePopup(true);
                }}
              />
            )}
          </div>
        </div>
      </div>
      <SideModal
        //title = {selectedRow.RequestID}
        title={
          <div className={styles.financeHeader}>
            <span className={styles.reqId}>Finance Action</span>
          </div>
        }
        visible={showFinancePopup}
        onHide={() => setShowFinancePopup(false)}
        size="sm"
        fixedHeight={false}
        animate
      >
        <FinanceAction
          context={context}
          selectedRow={selectedRow}
          action={selectedFtAction?.name || null}
          refreshData={refreshData}
          onClose={() => {
            setShowFinancePopup(false);
            onClose(); // 👈 close parent component also
          }}
        />
      </SideModal>
      <SideModal
        title={
          popupMode === "ADD"
            ? popupType === "VENDOR"
              ? "Add Vendor"
              : "Add Freelancer"
            : popupType === "VENDOR"
              ? "View Vendor"
              : "View Freelancer"
        }
        visible={showPopup}
        onHide={() => setShowPopup(false)}
        size="lg"
        animate
      >
        {popupType === "VENDOR" && (
          <AddVendor
            context={context}
            onClose={() => setShowPopup(false)}
            fetchVendorsDetails={() => {}}
            selectedVendor={
              popupMode === "VIEW" ? selectedVendorForPopup : null
            }
            mode={popupMode}
            setVendorMode={() => {}}
            onAddNewVendorClick={() => {}}
          />
        )}

        {popupType === "FREELANCER" && (
          <AddFreelancer
            context={context}
            onClose={() => setShowPopup(false)}
            fetchFreelancersDetails={() => {}}
            selectedFreelancer={
              popupMode === "VIEW" ? selectedFreelancerForPopup : null
            }
            mode={popupMode}
            setFreelancerMode={() => {}}
            onAddNewFreelancerClick={() => {}}
          />
        )}
      </SideModal>
    </div>
  );
}
export default EditRequestInfo;
