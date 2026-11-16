import * as React from "react";
//import styles from "./AddFreelancerStyle.module.scss";
import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import InputField from "../InputField/InputField";
import { mapToDropdownOptions } from "../../../../utils/dropdown";
import { FreelancerData, TypeOfServiceOption } from "../../../../types";
import { toast } from "react-toastify";
import {
  fetchTypeOfService,
  addNewFreelancer,
  fetchFreelancers,
  updateFreelancer,
  getFreelancerAttachments,
  uploadFreelancerAttachment,
} from "../../../../CommonServices/FreelancerService";
import styles from "./AddFreelancerStyle.module.scss";

interface AddFreelancerProps {
  context: any;
  fetchFreelancersDetails: any;
  onAddNewFreelancerClick: () => void;
  onClose: () => void;
  mode: "ADD" | "VIEW" | "EDIT";
  selectedFreelancer: FreelancerData | null;
  setFreelancerMode: (mode: "ADD" | "VIEW" | "EDIT") => void;
}

function AddFreelancer({
  context,
  onClose,
  fetchFreelancersDetails,
  selectedFreelancer,
  mode,
  setFreelancerMode,
  onAddNewFreelancerClick,
}: AddFreelancerProps) {
  const [freelancerName, setFreelancerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [emailId, setEmailId] = useState("");
  const [checked, setChecked] = useState(false);
  const [typeOfServices, setTypeOfServices] = useState<TypeOfServiceOption[]>(
    [],
  );
  const [selectedTypeOfServices, setSelectedTypeOfServices] =
    useState<TypeOfServiceOption | null>(null);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccNo, setBankAccNamo] = useState("");
  const [bankIfscCode, setBankIfscCode] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [freelancerList, setFreelancerList] = useState<any[]>([]);
  const [showProceedPopup, setShowProceedPopup] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<any>(null);

  useEffect(() => {
    if (selectedFreelancer) {
      setFreelancerName(selectedFreelancer.FreelancerName);
      setMobileNo(selectedFreelancer.MobileNumberf);
      setEmailId(selectedFreelancer.EmailID);
      setChecked(!!selectedFreelancer.GSTFreelancer);
      setGstNumber(selectedFreelancer.GSTNumber || "");
      setAccountName(selectedFreelancer.AccountName || "");
      setBankName(selectedFreelancer.BankName || "");
      setBankAccNamo(selectedFreelancer.AccountNumber || "");
      setBankIfscCode(selectedFreelancer.IFSCCode || "");
      setAdditionalDetails(selectedFreelancer.AdditionalDetails || "");
      setSelectedTypeOfServices(
        selectedFreelancer.TypeOfservice
          ? { name: selectedFreelancer.TypeOfservice }
          : null,
      );
    }
  }, [selectedFreelancer]);

  useEffect(() => {
    const loadTypeOfService = async () => {
      const { data } = await fetchTypeOfService();
      if (data) {
        setTypeOfServices(data);
      } else {
        toast.error("Failed to load roles");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadTypeOfService();
  }, []);

  useEffect(() => {
    const loadFreelancers = async () => {
      const { data } = await fetchFreelancers(); // FreelancerDetails list
      if (data) setFreelancerList(data);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadFreelancers();
  }, []);

  const generateFreelancerId = () => {
    if (!freelancerList.length) return "FLC001";

    const lastFreelancer = freelancerList
      .filter((v) => v.FreelancerID)
      .sort((a, b) => b.ID - a.ID)[0];

    if (!lastFreelancer?.FreelancerID) return "FLC001";

    const lastNumber = parseInt(lastFreelancer.FreelancerID.substring(3), 10);
    return `FLC${String(lastNumber + 1).padStart(3, "0")}`;
  };

  const handleSubmit = async () => {
    if (mode === "VIEW") return;

    const payload = {
      FreelancerName: freelancerName,
      AccountNumber: bankAccNo,
      IFSCCode: bankIfscCode,
      MobileNumberf: Number(mobileNo),
      EmailID: emailId,
      AdditionalDetails: additionalDetails,
      GSTFreelancer: checked,
      GSTNumber: checked ? gstNumber : null,
      AccountName: accountName,
      BankName: bankName,
      TypeOfservice: selectedTypeOfServices?.name,
    };

    try {
      let itemId: number | null = null;

      if (mode === "EDIT" && selectedFreelancer) {
        await updateFreelancer(selectedFreelancer.ID, payload);
        itemId = selectedFreelancer.ID;
        toast.success("Freelancer updated successfully");
      } else {
        const res = await addNewFreelancer({
          ...payload,
          FreelancerID: generateFreelancerId(),
        });
        console.log("Add Freelancer Response:", res);

        itemId = res?.data?.data?.ID;
        toast.success("Freelancer added successfully");
      }

      if (attachment && itemId) {
        await uploadFreelancerAttachment(itemId, attachment);
      }

      fetchFreelancersDetails();
      onClose();
    } catch (err) {
      toast.error("Failed to save vendor");
    }
  };

  useEffect(() => {
    const loadAttachments = async () => {
      if (!selectedFreelancer?.ID) return;

      try {
        const res = await getFreelancerAttachments(selectedFreelancer.ID);

        if (res.data && res.data.length > 0) {
          setExistingAttachment(res.data[0]); // single attachment
        } else {
          setExistingAttachment(null);
        }
      } catch (error) {
        console.error("Error fetching attachments", error);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadAttachments();
  }, [selectedFreelancer]);

  const isViewMode = mode === "VIEW";

  const handleDeleteFreelancer = async () => {
    if (!selectedFreelancer) return;

    try {
      await updateFreelancer(selectedFreelancer.ID, {
        IsDeleted: true,
      });

      toast.success("Vendor deleted successfully");

      setShowProceedPopup(false);
      fetchFreelancersDetails(); // refresh table
      onClose(); // close modal
    } catch (error) {
      toast.error("Failed to delete vendor");
    }
  };

  return (
    <>
      <div className={styles.formHeader}>
        {mode === "VIEW" && (
          <>
            <button className={styles.reqEditBtn}>
              <i
                className="fa-solid fa-pen-to-square"
                onClick={() => setFreelancerMode("EDIT")}
                title="Edit Freelancer"
              />
            </button>
            <button className={styles.reqEditBtn}>
              <i
                className="fa-solid fa-trash"
                onClick={() => setShowProceedPopup(true)}
                title="Edit Freelancer"
              />
            </button>
          </>
        )}
      </div>
      <div className={styles.container}>
        <div className={styles.formGrid}>
          <InputField
            type="input-text"
            label="Freelancer Name"
            id="freelancerName"
            className="w-full"
            placeholder="Enter"
            value={freelancerName}
            onChange={(e) => setFreelancerName(e.target.value)}
            disabled={isViewMode}
            labelClassName={styles.categoryLabel}
          />
          <InputField
            type="input-text"
            label="Mobile Number"
            id="mobNo"
            className="w-full"
            placeholder="Enter"
            value={mobileNo}
            disabled={isViewMode}
            onKeyDown={(e) => {
              // Allow navigation keys
              if (
                [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                ].includes(e.key)
              ) {
                return;
              }

              // Allow only digits
              if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
              }

              // Limit to 10 digits
              if (mobileNo.length >= 10) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");

              // Allow only digits & max 10 length
              if (!/^\d{1,10}$/.test(pasted)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setMobileNo(value);
            }}
          />

          <div className={styles.toggleField}>
            <label className={styles.toggleLabel}>GST Freelacer</label>
            <input
              className={styles.checkBox}
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                setChecked(e.target.checked);

                // auto clear GST number when unchecked (important)
                if (!e.target.checked) setGstNumber("");
              }}
              disabled={isViewMode}
            />
          </div>

          {checked && (
            <InputField
              type="input-text"
              label="GST Number"
              id="gstNo"
              className="w-full"
              placeholder="Enter"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              disabled={isViewMode}
            />
          )}

          <InputField
            type="input-text"
            label="Email Id"
            id="emailId"
            className="w-full"
            placeholder="Enter"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            disabled={isViewMode}
          />

          <InputField
            type="dropdown"
            label="Type"
            id="type"
            value={selectedTypeOfServices}
            onChange={(e) => setSelectedTypeOfServices(e.value)}
            options={mapToDropdownOptions(typeOfServices, {
              label: (i?: any) => i.name,
              value: (i) => i,
            })}
            placeholder="Select"
            className="w-full"
            checkmark
            highlightOnSelect={false}
            disabled={isViewMode}
          />

          <InputField
            type="input-text"
            label="Account Name"
            id="accName"
            className="w-full"
            placeholder="Enter"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            disabled={isViewMode}
          />

          <InputField
            type="input-text"
            label="Bank Name"
            id="bankName"
            className="w-full"
            placeholder="Enter"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            disabled={isViewMode}
          />

          <InputField
            type="input-text"
            label="Bank Account Number"
            id="bankAccNo"
            className="w-full"
            placeholder="Enter"
            value={bankAccNo}
            onChange={(e) => setBankAccNamo(e.target.value)}
            disabled={isViewMode}
          />

          <InputField
            type="input-text"
            label="Bank IFSC Code"
            id="bankIfscCode"
            className="w-full"
            placeholder="Enter"
            value={bankIfscCode}
            onChange={(e) => setBankIfscCode(e.target.value)}
            disabled={isViewMode}
          />

          <InputField
            type="input-textarea"
            label="Additional Details"
            id="details"
            placeholder="Enter"
            autoResize
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
            rows={5}
            className="w-full"
            disabled={isViewMode}
          />
          <div className={styles.fileField}>
            <label className={styles.fileLabel}>Attachment</label>

            {!attachment && existingAttachment && (
              <div className={styles.attachmentPreview}>
                <span className={styles.fileName}>
                  {existingAttachment.FileName}
                </span>

                <a
                  href={existingAttachment.ServerRelativeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.downloadLink}
                >
                  View / Download
                </a>
              </div>
            )}

            {/* Always show file input (except VIEW mode) */}
            {!isViewMode && (
              <div className={styles.fileUploadWrapper}>
                <label className={styles.customFileButton}>
                  Choose File
                  <input
                    type="file"
                    className={styles.hiddenFileInput}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setAttachment(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <span className={styles.fileStatus}>
                  {attachment ? attachment.name : "No file chosen"}
                </span>
              </div>
            )}

            {/*  Show selected new file 
            {attachment && (
              <div className={styles.fileName}>Selected: {attachment.name}</div>
            )} */}
          </div>
        </div>

        <div className={styles.buttonsContainer}>
          <Button
            className={styles.cancelButton}
            label="Cancel"
            onClick={onClose}
          />
          {mode !== "VIEW" && (
            <Button
              className={styles.submitButton}
              label={mode === "EDIT" ? "Update" : "Submit"}
              onClick={handleSubmit}
            />
          )}
        </div>
        {showProceedPopup && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmBox}>
              <p className={styles.confirmTitle}>Confirm</p>
              <p className={styles.confirmMessage}>
                Are you sure you want to delete this freelancer?
              </p>

              <div className={styles.confirmButtons}>
                <Button
                  label="No"
                  className={styles.noBtn}
                  onClick={() => setShowProceedPopup(false)}
                />
                <Button
                  label="Yes"
                  className={styles.yesBtn}
                  onClick={handleDeleteFreelancer}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
export default AddFreelancer;
