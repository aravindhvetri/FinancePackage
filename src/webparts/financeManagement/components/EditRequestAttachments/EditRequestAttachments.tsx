/* eslint-disable react/jsx-no-target-blank */
import * as React from "react";
import styles from "./EditRequestAttachmentsStyle.module.scss";
import { useEffect, useState } from "react";
import {
  getRequestAttachments,
  uploadPaymentRequestAttachment,
  deleteRequestAttachment,
} from "../../../../CommonServices/PaymentRequestService";
import Table from "../Table/Table";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import loaderLogo from "../../../../assets/TechnoRUCSLogo.png";
import { toast } from "react-toastify";

interface Props {
  requestId: string;
}

function EditRequestAttachments({ requestId }: Props) {
  const [files, setFiles] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 🔹 Load existing files
  /*const loadFiles = async () => {
    //setLoading(true);
    const { data } = await getRequestAttachments(requestId);
    if (data) setFiles(data);
    console.log("data", data);
    setLoading(false);
  };*/
  const loadFiles = async () => {
    setLoading(true);

    const response = await getRequestAttachments(requestId);

    console.log("Attachment response:", response);
    console.log("Attachment data:", response.data);

    if (response.data) {
      setFiles(response.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (requestId) loadFiles();
  }, [requestId]);

  const handleUpload = async () => {
    if (!newFiles.length) return;

    // ✅ duplicate file check
    const existingFileNames = files.map((f) => f.FileLeafRef);

    const duplicate = newFiles.find((file) =>
      existingFileNames.includes(file.name),
    );

    if (duplicate) {
      toast.warn(`${duplicate.name} already exists`);
      return;
    }

    try {
      setUploading(true);

      for (const file of newFiles) {
        await uploadPaymentRequestAttachment(requestId, file);
        console.log("Uploaded:", file.name);
      }

      toast.success("Files uploaded successfully");

      setNewFiles([]);

      await loadFiles();
      console.log("Files state:", files);
    } catch (error) {
      console.error(error);

      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  //  Delete
  const handleDelete = (fileName: string) => {
    confirmDialog({
      message: "Are you sure you want to delete this attachment?",
      header: "Delete Confirmation",
      acceptClassName: styles.confirmYesBtn,
      rejectClassName: styles.confirmNoBtn,
      className: styles.customConfirmDialog,

      accept: async () => {
        const result = await deleteRequestAttachment(requestId, fileName);

        if (result.error) {
          console.error("Delete failed");
          return;
        }

        await loadFiles();
      },
    });
  };

  const getFileIconStyle = (fileName: string) => {
    const name = fileName.toLowerCase();

    if (name.endsWith(".pdf")) return { icon: "fa-file-pdf", color: "#E53935" };
    if (
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg")
    )
      return { icon: "fa-file-image", color: "#43A047" };
    if (name.endsWith(".xls") || name.endsWith(".xlsx"))
      return { icon: "fa-file-excel", color: "#2E7D32" };
    if (name.endsWith(".doc") || name.endsWith(".docx"))
      return { icon: "fa-file-word", color: "#1565C0" };

    return { icon: "fa-file", color: "#546E7A" };
  };
  return (
    <div className={styles.container}>
      <ConfirmDialog />
      {/* Upload */}
      <div className={styles.uploadBox}>
        <label className={styles.uploadBox}>
          <span className={styles.uploadText}>+ New file</span>
          <span className={styles.subText}> or drag and drop</span>

          <input
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setNewFiles(Array.from(e.target.files));
              }
            }}
          />
        </label>

        {/* ✅ Selected files preview */}
        {newFiles.length > 0 && (
          <div className={styles.selectedFiles}>
            {newFiles.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                {file.name}
              </div>
            ))}
          </div>
        )}

        {/*<button className={styles.uploadBtn} onClick={handleUpload}>
          Upload
        </button>*/}
        <button
          className={`${styles.uploadBtn} ${
            !newFiles.length ? styles.uploadBtnDisabled : ""
          }`}
          onClick={handleUpload}
          disabled={!newFiles.length || uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {uploading && (
          <div className={styles.uploadLoader}>
            <img
              src={loaderLogo}
              alt="Uploading..."
              style={{ width: "40px" }}
            />
            <span>Uploading files...</span>
          </div>
        )}
      </div>

      {/* Table */}
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
            value={files}
            dataKey={"Id"}
            loading={loading}
            paginator={false}
            rows={files?.length || 0}
            emptyMessage="No attachments available"
            columns={[
              {
                field: "Created",
                header: "Date",
                body: (rowData: any) =>
                  new Date(rowData.Created).toLocaleDateString("en-GB"),
              },
              {
                field: "FileLeafRef",
                header: "File name",
                body: (rowData: any) => {
                  const file = getFileIconStyle(rowData.FileLeafRef);

                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i
                        className={`fa-solid ${file.icon}`}
                        style={{ color: file.color }}
                      />
                      <span>{rowData.FileLeafRef}</span>
                    </div>
                  );
                },
              },
              {
                field: "Author",
                header: "Uploaded by",
                body: (rowData: any) => rowData.Author?.Title || "-",
              },
              {
                field: "Position",
                header: "Position",
                body: () => "Finance",
              },
              {
                field: "Invoice",
                header: "Invoice",
                body: (rowData: any) => {
                  const isInvoice =
                    rowData.Invoice === true || rowData.Invoice === 1;

                  return (
                    <span style={{ color: isInvoice ? "green" : "red" }}>
                      {isInvoice ? "YES" : "NO"}
                    </span>
                  );
                },
              },
              {
                field: "Actions",
                header: "Actions",
                body: (rowData: any) => (
                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* Download */}
                    <a href={`${rowData.FileRef}?download=1`} download>
                      <i className="fa-solid fa-download" />
                    </a>

                    {/* Delete */}
                    <button
                      className={styles.dltBtnCon}
                      onClick={() => handleDelete(rowData.FileLeafRef)}
                    >
                      <i className={`fa-solid fa-trash ${styles.deleteIcon}`} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}

export default EditRequestAttachments;
