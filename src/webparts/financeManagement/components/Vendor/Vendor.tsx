import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./VendorStyle.module.scss";
import { VendorData } from "../../../../types";
import Table from "../Table/Table";
import {
  fetchVendors,
  updateVendor,
} from "../../../../CommonServices/VendorService";
import ActionButtons from "../ActionButttons/ActionButtons";
import AddVendor from "../AddVendor/AddVendor";
import SideModal from "../SideModal/SideModal";
import { ToggleButton } from "primereact/togglebutton";
import loaderLogo from "../../../../assets/TechnoRUCSLogo.png";
import InputField from "../InputField/InputField";
import classNames from "classnames";

interface VendorDashboardProps {
  context: any;
  onOpenPaymentHistory: (type: "vendor", id: number) => void;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function VendorDashboard({
  context,
  onOpenPaymentHistory,
}: VendorDashboardProps) {
  const [vendorData, setVendorData] = useState<VendorData[]>([]);
  const [vendorDataLoading, setVendorDataLoading] = useState<boolean>(false);

  const [vendorMode, setVendorMode] = useState<VendorMode>("ADD");
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [filteredVendorData, setFilteredVendorData] = useState<VendorData[]>(
    [],
  );
  const [selectedTypeOfService, setSelectedTypeOfService] =
    useState<string>("All");
  const [selectedActiceVendor, setSelectedActiceVendor] =
    useState<string>("Active");
  const [searchText, setSearchText] = useState<string>("");

  const typeOfServiceOptions = [
    { label: "All Types", value: "All" },
    { label: "Goods", value: "Goods" },
    { label: "Services", value: "Services" },
    { label: "Goods/Services", value: "Goods/Services" },
    { label: "Landlord", value: "Landlord" },
  ];

  function applyFilters(data: VendorData[]): VendorData[] {
    let filtered = data;

    // Type of service
    if (selectedTypeOfService !== "All") {
      filtered = filtered.filter(
        (item) => item.TypeOfservice === selectedTypeOfService,
      );
    }

    // Active / Inactive filter
    if (selectedActiceVendor === "Active") {
      filtered = filtered.filter((item) => item.ActiveStatus === true);
    }

    if (selectedActiceVendor === "Inactive") {
      filtered = filtered.filter((item) => item.ActiveStatus === false);
    }

    if (searchText) {
      const search = searchText.toLowerCase();

      filtered = filtered.filter((item) => {
        return (
          item.VendorName?.toString().toLowerCase().includes(search) ||
          item.VendorID?.toString().includes(search) ||
          item.EmailID?.toString().toLowerCase().includes(search)
        );
      });
    }

    return filtered;
  }

  useEffect(() => {
    const filtered = applyFilters(vendorData);
    setFilteredVendorData(filtered);
  }, [vendorData, selectedTypeOfService, selectedActiceVendor, searchText]);

  const fetchVendorsDetails = async () => {
    setVendorDataLoading(true);
    try {
      const { data } = await fetchVendors();

      console.log(data);

      if (data) {
        const filtered = data.filter((item) => item.IsDeleted !== true);
        setVendorData(filtered);
      } else {
        console.error("No data returned from fetchVendorDetails");
      }
    } catch (error) {
      console.error("Error fetchVendorDetails:", error);
    } finally {
      setVendorDataLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchVendorsDetails();
  }, []);

  const onAddNewVendorClick = () => {
    setVendorMode("ADD");
    setSelectedVendor(null);
    setShowVendorModal(true);
  };

  type VendorMode = "ADD" | "VIEW" | "EDIT";

  const rowActions = (rowData: VendorData) => {
    return (
      <ActionButtons
        buttons={[
          {
            variants: ["icon", "transparent"],
            icon: "pi pi-eye",
            tooltip: "View",
            tooltipOptions: { position: "top" },
            onClick: () => {
              setSelectedVendor(rowData);
              setVendorMode("VIEW");
              setShowVendorModal(true);
            },
          },
          {
            variants: ["icon", "transparent"],
            icon: "pi pi-history",
            tooltip: "History",
            tooltipOptions: { position: "top" },
            onClick: () => onOpenPaymentHistory("vendor", rowData.Id),
          },
        ]}
      />
    );
  };

  const onToggleChange = async (rowData: VendorData, value: boolean) => {
    try {
      // Call your update API / SP service
      await updateVendor(rowData.Id, {
        ActiveStatus: value,
      });

      // Update UI instantly (optional but good UX)
      setVendorData((prev) =>
        prev.map((item) =>
          item.Id === rowData.Id ? { ...item, ActiveStatus: value } : item,
        ),
      );

      // If using filtered data
      setFilteredVendorData((prev) =>
        prev.map((item) =>
          item.Id === rowData.Id ? { ...item, ActiveStatus: value } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating ActiveStatus", error);
    }
  };

  const rowActiveStatus = (rowData: VendorData) => {
    return (
      <ToggleButton
        //checked={rowData.ActiveStatus}
        checked={rowData.ActiveStatus === true}
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

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.actions}>
          <button className={styles.headerBtn} onClick={onAddNewVendorClick}>
            Add Vendor
          </button>

          <button
            className={styles.headerBtn}
            onClick={() => {
              setSelectedTypeOfService("All");
              setSelectedActiceVendor("Active");
              setSearchText("");

              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              fetchVendorsDetails();
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
          value={selectedActiceVendor}
          onChange={(e) => setSelectedActiceVendor(e.value)}
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
        {vendorDataLoading ? (
          <div className={styles.loaderWrapper}>
            <img
              src={loaderLogo}
              alt="Loading..."
              className={styles.loaderImage}
            />
          </div>
        ) : (
          <Table
            value={filteredVendorData}
            dataKey={"Id"}
            loading={vendorDataLoading}
            paginator
            rows={10}
            emptyMessage="No data available"
            onRowClick={(e) => {
              setSelectedVendor(e.data as VendorData);
              setVendorMode("VIEW");
              setShowVendorModal(true);
            }}
            columns={[
              {
                field: "VendorID",
                header: "Vendor Id",
                body: (rowData) => ellipsisTemplate(rowData.VendorID),
              },
              {
                field: "VendorName",
                header: "Vendor Name",
                body: (rowData) =>
                  ellipsisTemplate(rowData.VendorName, "120px"),
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
                header: "GST Vendor",
                body: (rowData) =>
                  ellipsisTemplate(rowData.GSTNumber || "-", "100px"),
              },
              {
                field: "MobileNumber",
                header: "Mobile No",
                body: (rowData) =>
                  ellipsisTemplate(rowData.MobileNumber || "-"),
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
          vendorMode === "VIEW"
            ? "View Vendor"
            : vendorMode === "EDIT"
              ? "Edit Vendor"
              : "Add Vendor"
        }
        visible={showVendorModal}
        onHide={() => setShowVendorModal(false)}
        size="lg"
        animate
      >
        <AddVendor
          context={context}
          mode={vendorMode}
          onClose={() => setShowVendorModal(false)}
          onAddNewVendorClick={onAddNewVendorClick}
          fetchVendorsDetails={fetchVendorsDetails}
          selectedVendor={selectedVendor}
          setVendorMode={setVendorMode}
        />
      </SideModal>
    </div>
  );
}

export default VendorDashboard;
