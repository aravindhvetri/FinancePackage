import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./FreelancerStyle.module.scss";
import { FreelancerData } from "../../../../types";
import Table from "../Table/Table";
import {
  fetchFreelancers,
  updateFreelancer,
} from "../../../../CommonServices/FreelancerService";
import ActionButtons from "../ActionButttons/ActionButtons";
import SideModal from "../SideModal/SideModal";
import AddFreelancer from "../AddFreelancer/AddFreelancer";
import { ToggleButton } from "primereact/togglebutton";
import loaderLogo from "../../../../assets/TechnoRUCSLogo.png";
import InputField from "../InputField/InputField";
import classNames from "classnames";

interface FreelancerDashboardProps {
  context: any;
  onOpenPaymentHistory: (type: "freelancer", id: number) => void;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function FreelancerDashboard({
  context,
  onOpenPaymentHistory,
}: FreelancerDashboardProps) {
  const [freelancerData, setFreelancerData] = useState<FreelancerData[]>([]);
  const [freelancerDataLoading, setFreelancerDataLoading] =
    useState<boolean>(false);
  const [freelancerMode, setFreelancerMode] = useState<FreelancerMode>("ADD");
  const [selectedFreelancer, setSelectedFreelancer] =
    useState<FreelancerData | null>(null);
  const [showFreelancerModal, setShowFreelancerModal] = useState(false);
  const [filteredFreelancerData, setFilteredFreelancerData] = useState<
    FreelancerData[]
  >([]);
  const [selectedTypeOfService, setSelectedTypeOfService] =
    useState<string>("All");
  const [selectedActiceFreelancer, setSelectedActiceFreelancer] =
    useState<string>("Active");
  const [searchText, setSearchText] = useState<string>("");

  const typeOfServiceOptions = [
    { label: "All Types", value: "All" },
    { label: "Goods", value: "Goods" },
    { label: "Services", value: "Services" },
  ];

  function applyFilters(data: FreelancerData[]): FreelancerData[] {
    let filtered = data;

    // Type of service
    if (selectedTypeOfService !== "All") {
      filtered = filtered.filter(
        (item) => item.TypeOfservice === selectedTypeOfService,
      );
    }

    // Active / Inactive filter
    if (selectedActiceFreelancer === "Active") {
      filtered = filtered.filter((item) => item.ActiveStatus === true);
    }

    if (selectedActiceFreelancer === "Inactive") {
      filtered = filtered.filter((item) => item.ActiveStatus === false);
    }

    if (searchText) {
      const search = searchText.toLowerCase();

      filtered = filtered.filter((item) => {
        return (
          item.FreelancerName?.toString().toLowerCase().includes(search) ||
          item.FreelancerID?.toString().includes(search) ||
          item.EmailID?.toString().toLowerCase().includes(search)
        );
      });
    }

    return filtered;
  }

  useEffect(() => {
    const filtered = applyFilters(freelancerData);
    setFilteredFreelancerData(filtered);
  }, [
    freelancerData,
    selectedTypeOfService,
    selectedActiceFreelancer,
    searchText,
  ]);

  const fetchFreelancersDetails = async () => {
    setFreelancerDataLoading(true);
    try {
      const { data } = await fetchFreelancers();

      console.log(data);

      if (data) {
        const filtered = data.filter((item) => item.IsDeleted !== true);
        setFreelancerData(filtered);
      } else {
        console.error("No data returned from fetchFreelancerDetails");
      }
    } catch (error) {
      console.error("Error fetchFreelancerDetails:", error);
    } finally {
      setFreelancerDataLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchFreelancersDetails();
  }, []);

  const onAddNewFreelancerClick = () => {
    setFreelancerMode("ADD");
    setSelectedFreelancer(null);
    setShowFreelancerModal(true);
  };

  type FreelancerMode = "ADD" | "VIEW" | "EDIT";

  const rowActions = (rowData: FreelancerData) => {
    return (
      <ActionButtons
        buttons={[
          {
            variants: ["icon", "transparent"],
            icon: "pi pi-eye",
            tooltip: "View",
            tooltipOptions: { position: "top" },
            onClick: () => {
              setSelectedFreelancer(rowData);
              setFreelancerMode("VIEW");
              setShowFreelancerModal(true);
            },
          },
          {
            variants: ["icon", "transparent"],
            icon: "pi pi-history",
            tooltip: "History",
            tooltipOptions: { position: "top" },
            onClick: () => onOpenPaymentHistory("freelancer", rowData.Id),
          },
        ]}
      />
    );
  };

  const onToggleChange = async (rowData: FreelancerData, value: boolean) => {
    try {
      // Call your update API / SP service
      await updateFreelancer(rowData.Id, {
        ActiveStatus: value,
      });

      // Update UI instantly (optional but good UX)
      setFreelancerData((prev) =>
        prev.map((item) =>
          item.Id === rowData.Id ? { ...item, ActiveStatus: value } : item,
        ),
      );

      // If using filtered data
      setFilteredFreelancerData((prev) =>
        prev.map((item) =>
          item.Id === rowData.Id ? { ...item, ActiveStatus: value } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating ActiveStatus", error);
    }
  };

  const rowActiveStatus = (rowData: FreelancerData) => {
    return (
      <ToggleButton
        checked={rowData.ActiveStatus}
        onChange={(e) => onToggleChange(rowData, e.value)}
        onLabel="On"
        offLabel="Off"
        className={classNames(styles.toggleButton, {
          [styles.active]: rowData.ActiveStatus === true,
          [styles.inActive]: !rowData.ActiveStatus,
        })}
      />
    );
  };

  const ellipsisTemplate = (value?: string, maxWidth: string = "120px") => (
    <span
      className={styles.ellipsisCell}
      style={{ maxWidth }}
      title={value || ""}
    >
      {value || "-"}
    </span>
  );

  console.log("freelancerData",filteredFreelancerData)

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.actions}>
          <button
            className={styles.headerBtn}
            onClick={onAddNewFreelancerClick}
          >
            Add Freelancer
          </button>

          <button
            className={styles.headerBtn}
            onClick={() => {
              setSelectedTypeOfService("All");
              setSelectedActiceFreelancer("Active");
              setSearchText("");

              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              fetchFreelancersDetails();
            }}
          >
            {" "}
            <i className="fa-solid fa-arrow-rotate-right" />
          </button>
        </div>
      </div>
      <div className={styles.filterRow}>
        <InputField
          type="dropdown"
          label=""
          id="typeOfService"
          value={selectedTypeOfService}
          onChange={(e) => setSelectedTypeOfService(e.value)}
          options={typeOfServiceOptions}
          //placeholder="Select Type"
          className={styles.filterDropdownVendor}
        />

        <InputField
          type="dropdown"
          label=""
          id="status"
          value={selectedActiceFreelancer}
          onChange={(e) => setSelectedActiceFreelancer(e.value)}
          options={[
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ]}
          //placeholder="Select Type"
          className={styles.filterDropdownVendor}
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
        {freelancerDataLoading ? (
          <div className={styles.loaderWrapper}>
            <img
              src={loaderLogo}
              alt="Loading..."
              className={styles.loaderImage}
            />
          </div>
        ) : (
          <Table
            value={filteredFreelancerData}
            dataKey={"Id"}
            loading={freelancerDataLoading}
            paginator
            rows={10}
            emptyMessage="No data available"
            onRowClick={(e) => {
              setSelectedFreelancer(e.data as FreelancerData);
              setFreelancerMode("VIEW");
              setShowFreelancerModal(true);
            }}
            columns={[
              {
                field: "FreelancerID",
                header: "Freelancer Id",
                body: (rowData) => ellipsisTemplate(rowData.FreelancerID),
              },
              {
                field: "FreelancerName",
                header: "Freelancer Name",
                body: (rowData) =>
                  ellipsisTemplate(rowData.FreelancerName, "120px"),
              },
              {
                field: "TypeOfservice",
                header: "Types of Service",
                body: (rowData) => ellipsisTemplate(rowData.TypeOfservice),
              },
              {
                field: "ActiveStatus",
                header: "Active Status",
                body: (rowData) => rowActiveStatus(rowData),
              },
              {
                field: "GSTNumber",
                header: "GST freelancer",
                body: (rowData) =>
                  ellipsisTemplate(rowData.GSTNumber || "-", "100px"),
              },
              {
                field: "MobileNumberf",
                header: "Mobile No",
                body: (rowData) =>
                  ellipsisTemplate(rowData.MobileNumberf || "-"),
              },
              {
                field: "EmailID",
                header: "Email Id",
                body: (rowData) =>
                  ellipsisTemplate(rowData.EmailID || "-", "100px"),
              },
              {
                field: "BankName",
                header: "Bank Name",
                body: (rowData) =>
                  ellipsisTemplate(rowData.BankName || "-", "100px"),
              },

              {
                field: "AccountNumber",
                header: "Account Number",
                body: (rowData) =>
                  ellipsisTemplate(rowData.AccountNumber || "-", "100px"),
              },
              {
                field: "IFSCCode",
                header: "IFSC Code",
                body: (rowData) =>
                  ellipsisTemplate(rowData.IFSCCode || "-", "100px"),
              },
              {
                field: "Actions",
                header: "Actions",
                body: (rowData) => rowActions(rowData),
              },
            ]}
          />
        )}
      </div>
      <SideModal
        title={
          freelancerMode === "VIEW"
            ? "View Freelancer"
            : freelancerMode === "EDIT"
              ? "Edit Freelancer"
              : "Add Freelancer"
        }
        visible={showFreelancerModal}
        onHide={() => setShowFreelancerModal(false)}
        size="lg"
        animate
      >
        <AddFreelancer
          context={context}
          mode={freelancerMode}
          onClose={() => setShowFreelancerModal(false)}
          onAddNewFreelancerClick={onAddNewFreelancerClick}
          fetchFreelancersDetails={fetchFreelancersDetails}
          selectedFreelancer={selectedFreelancer}
          setFreelancerMode={setFreelancerMode}
        />
      </SideModal>
    </div>
  );
}

export default FreelancerDashboard;
