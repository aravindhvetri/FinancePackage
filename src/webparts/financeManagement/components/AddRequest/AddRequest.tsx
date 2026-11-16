import * as React from "react";
import styles from "./AddRequest.module.scss";
import { useState, useEffect, useMemo } from "react";
import { Button } from "primereact/button";
import SideModal from "../SideModal/SideModal";
import InputField from "../InputField/InputField";
import { mapToDropdownOptions } from "../../../../utils/dropdown";
import {
  CategoryData,
  VendorData,
  SubCategoryData,
  FreelancerData,
  ProjectTagData,
  IDepartmentData,
  IEntityData,
} from "../../../../types";
import {
  fetchCategoryChoices,
  fetchProjectTags,
  addNewRequest,
  createPaymentRequestFolder,
  uploadPaymentRequestAttachment,
  fetchDepartmentChoices,
  fetchEntityChoices,
} from "../../../../CommonServices/PaymentRequestService";
import { toast } from "react-toastify";
import { fetchVendors } from "../../../../CommonServices/VendorService";
import { fetchSubCategories } from "../../../../CommonServices/CategoryService";
import { fetchFreelancers } from "../../../../CommonServices/FreelancerService";
import { PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import SPServices from "../../../../CommonServices/SPServices";
import AddVendor from "../AddVendor/AddVendor";
import AddFreelancer from "../AddFreelancer/AddFreelancer";

interface AddRequestProps {
  context: any;
  onClose: () => void;
  onAddNewRequestClick: () => void;
  selectedRow?: any;
  refreshDashboard: () => void;
}

type SubCategoryOption = {
  Name: string;
  Id: number;
  MainCategory: string;
};

type YearOption = {
  Year: number;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function AddRequest({
  context,
  onClose,
  selectedRow,
  refreshDashboard,
}: AddRequestProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null,
  );
  const [typeOfService, setTypeOfService] = useState<
    { Name: string; Id: string | null }[]
  >([]);
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
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<"VENDOR" | "FREELANCER" | null>(
    null,
  );
  const [selectedVendorForPopup, setSelectedVendorForPopup] =
    useState<VendorData | null>(null);
  const [selectedFreelancerForPopup, setSelectedFreelancerForPopup] =
    useState<FreelancerData | null>(null);
  const [popupMode, setPopupMode] = useState<"ADD" | "VIEW">("ADD");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [isCloneInitialized, setIsCloneInitialized] = useState(false);

  const validateField = (name: string, value: any) => {
    let message = "";

    switch (name) {
      case "category":
        if (!value) message = "Category is required";
        break;
      case "amount":
        if (!value) {
          message = "Amount is required";
        } else if (!/^\d+(\.\d+)?$/.test(value)) {
          message = "Only numbers are allowed";
        } else if (Number(value) <= 0) {
          message = "Amount must be greater than 0";
        }
        break;

      case "spentBy":
        if (!value?.length) message = "Please select spend by person";
        break;

      case "department":
        if (!value) message = "Department is required";
        break;
      case "entity":
        if (!value) message = "Entity is required";
        break;
    }

    setErrors((prev: any) => ({
      ...prev,
      [name]: message,
    }));
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
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadProjectTags = async () => {
      const { data, error } = await fetchProjectTags();
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
      const { data, error } = await fetchDepartmentChoices();
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
      const { data, error } = await fetchEntityChoices();
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
      const { data, error } = await fetchCategoryChoices();
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
    setTypeOfService([
      {
        Name: "Goods",
        Id: null,
      },
      {
        Name: "Services",
        Id: null,
      },
    ]);
  }, []);

  useEffect(() => {
    const loadVendors = async () => {
      const { data, error } = await fetchVendors();
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
      const { data, error } = await fetchFreelancers();
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

  /*useEffect(() => {
    setSelectedTypeOfService(null);
    setSelectedVendor(null);
    setSelectedSubCategory(null);
    setSelectedFreelancers(null);
    setSelectedPaymentToVendor(null);
  }, [selectedCategory]);*/
  useEffect(() => {
    if (!selectedCategory) return;

    if (selectedRow) return; // cloning

    setSelectedTypeOfService(null);
    setSelectedVendor(null);
    setSelectedSubCategory(null);
    setSelectedFreelancers(null);
    setSelectedPaymentToVendor(null);
  }, [selectedCategory, selectedRow]);

  const getSubCategoryOptions = () => {
    if (!selectedCategory) return [];

    const categoryName = selectedCategory.name;

    if (
      categoryName === "Freelancer Payment" ||
      categoryName === "Vendor Payments"
    ) {
      return mapToDropdownOptions(typeOfService, {
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

  const validateBeforeConfirm = (): boolean => {
    // 1️⃣ Category
    if (!selectedCategory) {
      toast.warn("Please Select Category");
      return false;
    }

    const category = selectedCategory.name;

    // 2️⃣ Sub-category validations
    if (
      (category === "Freelancer Payment" || category === "Vendor Payments") &&
      !selectedTypeOfService
    ) {
      toast.warn("Please Select Sub-Category");
      return false;
    }

    // 3️⃣ Payment To validations
    if (category === "Freelancer Payment" && !selectedFreelancers) {
      toast.warn("Please Select Freelancer Name");
      return false;
    }

    if (category === "Vendor Payments" && !selectedPaymentToVendor) {
      toast.warn("Please Select Vendor Name");
      return false;
    }

    if (
      category === "Group health insurance" &&
      (!selectedSubCategory || !selectedPaymentToVendor)
    ) {
      toast.warn("Please Select Subcategory Type and Vendor Name");
      return false;
    }

    if (
      (category === "Transfer of funds-miscellaneous" ||
        category === "Labour Welfare Fund") &&
      !selectedPaymentToVendor
    ) {
      toast.warn("Please Select Vendor Name");
      return false;
    }

    if (
      [
        "Employee benefits",
        "Reimbursement",
        "EB bills",
        "Internet recharges",
      ].includes(category) &&
      !selectedSubCategory
    ) {
      toast.warn(`Please Select ${category}`);
      return false;
    }

    if (
      category === "Rent" &&
      (!selectedSubCategory || !selectedPaymentToVendor)
    ) {
      toast.warn("Please Select Rent and Vendor Name");
      return false;
    }

    // 4️⃣ Month & Year validation
    if (
      ["Salary", "PF", "ESI", "Profess tax", "GST", "TDS"].includes(category) &&
      (!selectedMonth || !selectedYear)
    ) {
      toast.warn("Please Select Month and Year");
      return false;
    }

    // 5️⃣ Text field validations
    if (
      ["License", "Other", "Certification Reimbursement"].includes(category) &&
      !description.trim()
    ) {
      toast.warn(`Please Fill ${category}`);
      return false;
    }

    // 6️⃣ Amount
    if (!amount || Number(amount) <= 0) {
      toast.warn("Please enter amount to request");
      return false;
    }

    // 7️⃣ Spent By
    if (!selectedUsers.length) {
      toast.warn("Please select spend by person");
      return false;
    }

    if (!selectedDepartment) {
      toast.warn("Please select Practice");
      return false;
    }
    if (!selectedEntity) {
      toast.warn("Please select Entity");
      return false;
    }

    // ✅ All validations passed
    return true;
  };

  const getNewRequestId = async (): Promise<string> => {
    const today = new Date();

    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yy = String(today.getFullYear()).slice(-2);
    const prefix = `${dd}${mm}${yy}`;

    const items = await SPServices.SPReadItems<any>({
      Listname: "PaymentRequestDetails",
      Select: "ID,RequestID,Created",
      Filter: `substringof('${prefix}', RequestID)`,
      Orderby: "Created",
      Orderbydecorasc: false,
      Topcount: 50,
    });

    let nextNumber = 1;

    if (items.length > 0) {
      //const lastReq = items[items.length - 1].RequestID;
      const lastReq = items[0].RequestID;
      nextNumber = parseInt(lastReq.slice(6), 10) + 1;
    }

    return `${prefix}${String(nextNumber).padStart(2, "0")}`;
  };

  const buildRequestPayload = (requestId: string) => {
    const category = selectedCategory?.name;

    return {
      Date: new Date(),

      PersonNameId: context.pageContext.legacyPageContext.userId,

      PaymentType: category,

      /*PaymentFor:
        category === "Freelancer Payment"
          ? {
              Value: selectedFreelancers?.FreelancerName,
              Id: selectedFreelancers?.Id,
            }
          : null,*/
      PaymentForId:
        category === "Freelancer Payment" ? selectedFreelancers?.Id : null,

      VendorNameId: [
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
        "Salary",
      ].includes(category || "")
        ? selectedPaymentToVendor?.Id
        : null,

      TypeOfService:
        category === "Freelancer Payment" || category === "Vendor Payments"
          ? selectedTypeOfService?.Name
          : null,

      Others: category === "Other" ? description : null,
      LisenceFor: category === "License" ? description : null,
      CertificationName:
        category === "Certification Reimbursement" ? description : null,

      Amount: Number(amount),

      InvoiceNotApplicable: checked,
      InvoiceNumber: invoiceNumber,

      Description: description,

      RequestID: requestId,

      RequestForsubCategoryId: ![
        "Vendor Payments",
        "Freelancer Payment",
        "Transfer of funds-miscellaneous",
        "Labour Welfare Fund",
      ].includes(category || "")
        ? (selectedSubCategory?.Id ?? null)
        : null,

      SubcategoryDate: [
        "Salary",
        "PF",
        "ESI",
        "Profess tax",
        "GST",
        "TDS",
      ].includes(category || "")
        ? `${selectedMonth?.Name}/${selectedYear?.Year}`
        : null,

      ApproverStatus: true,

      /*SpentBy: {
        "@odata.type":
          "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
        Claims: `i:0#.f|membership|${selectedUsers[0]?.secondaryText}`,
        DisplayName: selectedUsers[0]?.text,
        Email: selectedUsers[0]?.secondaryText,
      },*/
      SpentById: selectedUsers?.[0]?.id ?? null,
      Department: selectedDepartment?.name,
      Entity: selectedEntity?.name,
      IsFinanceTeam: true,
      Tags: selecteTag?.Title,
    };
  };

  const createRequest = async () => {
    const requestId = await getNewRequestId();
    const payload = buildRequestPayload(requestId);

    const response = await addNewRequest(payload);
    return { id: response.data?.item, requestId };
  };

  const submitRequest = async () => {
    try {
      const { id, requestId } = await createRequest();
      // await uploadAttachments(id, requestId);
      if (files.length > 0) {
        await createPaymentRequestFolder(requestId);

        await Promise.all(
          files.map((file) => uploadPaymentRequestAttachment(requestId, file)),
        );
      }

      toast.success("Request added successfully");
      refreshDashboard();
      setShowConfirm(false);
      onClose(); // optional: close modal
    } catch (err) {
      toast.error("Failed to submit request");
      console.error(err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = showConfirm ? "hidden" : "auto";
  }, [showConfirm]);

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

  useEffect(() => {
    if (!selectedRow) return;

    const categoryMatch = categories.find(
      (c) => c.name === selectedRow.PaymentType,
    );

    if (categoryMatch) {
      setSelectedCategory(categoryMatch);
    }
  }, [selectedRow, categories]);

  useEffect(() => {
    console.log("Clone populate effect executed");

    if (!selectedRow) return;

    if (!selectedCategory) return;
    if (isCloneInitialized) return;

    if (selectedCategory.name !== selectedRow.PaymentType) return;

    // TYPE OF SERVICE (Goods / Services)
    if (
      selectedRow.TypeOfService &&
      (selectedRow.PaymentType === "Vendor Payments" ||
        selectedRow.PaymentType === "Freelancer Payment")
    ) {
      const serviceMatch = typeOfService.find(
        (t) => t.Name === selectedRow.TypeOfService,
      );

      if (serviceMatch) {
        setSelectedTypeOfService(serviceMatch);
      }
    }

    // SUB CATEGORY
    if (selectedRow.RequestForsubCategoryId) {
      const subMatch = subCategories.find(
        (s) => s.Id === selectedRow.RequestForsubCategoryId,
      );

      if (subMatch) {
        setSelectedSubCategory(subMatch);
      }
    }

    // VENDOR
    if (selectedRow.VendorName?.Id) {
      const vendorMatch = vendors.find(
        (v) => v.Id === selectedRow.VendorName.Id,
      );

      if (vendorMatch) {
        setSelectedPaymentToVendor(vendorMatch);
        setSelectedVendor(vendorMatch);
      }
    }

    // FREELANCER
    if (selectedRow.PaymentFor?.Id) {
      const freelancerMatch = freelancers.find(
        (f) => f.Id === selectedRow.PaymentFor.Id,
      );

      if (freelancerMatch) {
        setSelectedFreelancers(freelancerMatch);
      }
    }

    // MONTH / YEAR
    if (selectedRow.SubcategoryDate) {
      const [month, year] = selectedRow.SubcategoryDate.split("/");

      const monthMatch = months.find((m) => m.Name === month);
      const yearMatch = years.find((y) => y.Year.toString() === year);

      if (monthMatch) setSelectedMonth(monthMatch);
      if (yearMatch) setSelectedYear(yearMatch);
    }

    // AMOUNT
    setAmount(selectedRow.Amount?.toString() || "");

    // INVOICE
    setChecked(selectedRow.InvoiceNotApplicable || false);

    setInvoiceNumber(selectedRow.InvoiceNumber || "");

    // DESCRIPTION
    setDescription(selectedRow.Description || "");

    // TAG
    if (selectedRow.Tags) {
      const tagMatch = tags.find((tag) => tag.Title === selectedRow.Tags);

      if (tagMatch) {
        setSelectedTag(tagMatch);
      }
    }
    //DEPARTMENT
    if (selectedRow.Department) {
      const departmentMatch = department.find(
        (d) => d.code === selectedRow.Department.code,
      );

      if (departmentMatch) {
        setSelectedDepartment(departmentMatch);
      }
    }
    //Entity
    if (selectedRow.Entity) {
      const entityMatch = entity.find(
        (e) => e.code === selectedRow.Entity.code,
      );

      if (entityMatch) {
        setSelectedEntity(entityMatch);
      }
    }

    // SPENT BY
    /*if (selectedRow.SpentBy?.Email) {
      setSelectedUsers([
        {
          text: selectedRow.SpentBy.DisplayName,
          secondaryText: selectedRow.SpentBy.Email,
        },
      ]);
    }*/
    if (selectedRow.SpentBy) {
      setSelectedUsers([
        {
          id: selectedRow.SpentBy.Id,
          text: selectedRow.SpentBy.Title,
          secondaryText: selectedRow.SpentBy.EMail,
          loginName: selectedRow.SpentBy.EMail,
        },
      ]);
    }

    setIsCloneInitialized(true);
  }, [
    selectedCategory,
    selectedRow,
    vendors,
    freelancers,
    subCategories,
    tags,
    department,
    entity,
    years,
    months,
    typeOfService,
  ]);

  useEffect(() => {
    setIsCloneInitialized(false);
  }, [selectedRow?.Id]);

  console.log("selectedRow", selectedRow);
  return (
    <div className={styles.container}>
      <div className={styles.formGrid}>
        <InputField
          type="dropdown"
          label="Category"
          id="category"
          value={selectedCategory}
          //onChange={(e) => setSelectedCategory(e.value); validateField("category", e.value)}
          onChange={(e) => {
            setSelectedCategory(e.value);
            validateField("category", e.value);
          }}
          options={mapToDropdownOptions(categories, {
            label: (i) => i.name,
            value: (i) => i,
          })}
          placeholder="Select"
          className="w-full"
          checkmark
          highlightOnSelect={false}
          labelClassName={styles.categoryLabel}
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
                selectedCategory?.name === "Transfer of funds-miscellaneous" ||
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
            labelClassName={styles.categoryLabel}
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
                onChange={(e) => setSelectedMonth(e.value)}
                options={mapToDropdownOptions(months, {
                  label: (i) => i.Name,
                  value: (i) => i,
                })}
                placeholder="Select"
                className="w-full"
                checkmark
                highlightOnSelect={false}
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
              />
            </div>
          </div>
        )}

        {isPaymentTo && (
          <InputField
            type="dropdown"
            label={
              <span className={styles.labelWithIcon}>
                <span>
                  Payment To <span className={styles.requiredStar}>*</span>
                </span>

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
          />
        )}
        <InputField
          type="input-text"
          label="Amount"
          id="amount"
          className="w-full"
          placeholder="Enter"
          value={amount}
          disabled={isMarriageGift}
          onKeyDown={(e) => {
            if (e.ctrlKey || e.metaKey) {
              return;
            }
            if (
              [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "Tab",
              ].includes(e.key)
            )
              return;

            if (!/^[0-9.]$/.test(e.key)) {
              e.preventDefault();
            }

            if (e.key === "." && amount.includes(".")) {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");

            if (!/^\d*\.?\d*$/.test(pasted)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => setAmount(e.target.value)}
          labelClassName={styles.categoryLabel}
        />

        <div className={styles.toggleField}>
          <label className={styles.toggleLabel}>Invoice Applicable</label>
          <input
            className={styles.checkBox}
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
        </div>

        <InputField
          type="input-text"
          label="Invoice Number"
          id="invoicenumber"
          className="w-full"
          placeholder="Enter"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />

        <InputField
          type="dropdown"
          label="Tag"
          id="tag"
          value={selecteTag}
          onChange={(e) => setSelectedTag(e.value)}
          options={mapToDropdownOptions(tags, {
            label: (i) => i.Title,
            value: (i) => i,
          })}
          placeholder="Select"
          className="w-full"
          checkmark
          highlightOnSelect={false}
        />
        <InputField
          type="people-picker"
          label="Spent By"
          id="spendby"
          context={context}
          personSelectionLimit={1}
          showtooltip={true}
          ensureUser={true}
          principalTypes={[PrincipalType.User]} // ✅ this is valid
          webAbsoluteUrl={context.pageContext.web.absoluteUrl}
          defaultSelectedUsers={
            selectedUsers.length > 0 ? [selectedUsers[0].secondaryText] : []
          }
          onChange={(items) => {
            const filtered = items.filter(
              (u) =>
                !u.loginName?.toUpperCase().includes("EXT") &&
                u.secondaryText &&
                u.secondaryText !== "",
            );
            setSelectedUsers(filtered);
          }}
          labelClassName={styles.categoryLabel}
        />
        <InputField
          type="dropdown"
          label={
            <span>
              Practice <span className={styles.requiredStar}>*</span>
            </span>
          }
          id="department"
          value={selectedDepartment}
          onChange={(e) => {
            setSelectedDepartment(e.value);
            validateField("department", e.value);
          }}
          options={mapToDropdownOptions(department, {
            label: (i) => i.name,
            value: (i) => i,
          })}
          placeholder="Select"
          className="w-full"
          checkmark
          highlightOnSelect={false}
        />
        <InputField
          type="dropdown"
          label={
            <span>
              Entity <span className={styles.requiredStar}>*</span>
            </span>
          }
          id="entity"
          value={selectedEntity}
          onChange={(e) => {
            setSelectedEntity(e.value);
            validateField("entity", e.value);
          }}
          options={mapToDropdownOptions(entity, {
            label: (i) => i.name,
            value: (i) => i,
          })}
          placeholder="Select"
          className="w-full"
          checkmark
          highlightOnSelect={false}
        />
        <InputField
          type="input-textarea"
          label="Description"
          id="description"
          placeholder="Enter"
          autoResize
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full"
        />
        <div className={styles.attachmentField}>
          <label className={styles.label}>Attachments</label>

          <div className={styles.fileInputWrapper}>
            <label className={styles.fileButton}>
              Choose File
              <input
                type="file"
                className={styles.hiddenInput}
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                  }
                }}
              />
            </label>

            <span className={styles.fileName}>
              {files.length > 0 ? files[0].name : "No file chosen"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.buttonsContainer}>
        <Button
          className={styles.cancelButton}
          label="Cancel"
          onClick={onClose}
          //onClick={() => onOpenCeoRejectionPopup(selectedManPowerItem)}
          //onClick={handleReject}
        />
        <Button
          className={styles.submitButton}
          label="Submit"
          onClick={() => {
            if (!validateBeforeConfirm()) return;
            setShowConfirm(true);
          }}
        />
      </div>
      {showConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <p>Confirm</p>
            <p>Are you sure you want to proceed with submitting the request?</p>

            <div className={styles.confirmButtons}>
              <Button label="No" onClick={() => setShowConfirm(false)} />
              <Button
                label="Yes"
                onClick={submitRequest}
                className={styles.submitButton}
              />
            </div>
          </div>
        </div>
      )}
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
        {/* VENDOR */}
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

        {/* FREELANCER */}
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
export default AddRequest;
