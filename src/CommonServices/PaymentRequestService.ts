import {
  PaymentRequestData,
  RequestPaymentData,
  ProjectTagData,
  IDepartmentData,
} from "../types";
import SPServices from "./SPServices";
import { sp } from "@pnp/sp/presets/all";

export const fetchPaymentRequests = async () => {
  try {
    const result = await SPServices.SPReadItems<PaymentRequestData>({
      Listname: "PaymentRequestDetails",
      Select:
        "*,Author/EMail,Author/Title,Author/Id,PersonName/EMail,PersonName/Title,PersonName/Id,SpentBy/EMail,SpentBy/Title,SpentBy/Id,PaymentFor/Id,PaymentFor/FreelancerName,VendorName/Id,VendorName/VendorName,RequestForsubCategory/Id,RequestForsubCategory/Subcategory,FinalApprovalBy/EMail,FinalApprovalBy/Title,FinalApprovalBy/Id",
      Expand:
        "Author,PersonName,SpentBy,PaymentFor,VendorName,RequestForsubCategory,FinalApprovalBy",
      Topcount: 5000,
      Orderby: "ID",
      Orderbydecorasc: false,
    });
    console.log("payment request data: ", result);
    return {
      data: result,
    };
  } catch (error) {
    console.error("Error fetching payment requests:", error);
    return {
      error: error,
    };
  }
};

export const fetchRequestPayment = async () => {
  try {
    const result = await SPServices.SPReadItems<RequestPaymentData>({
      Listname: "RequestPaymentDetails",
      Select: "*,Author/EMail,Author/Title,Author/Id",
      Expand: "Author",
      Topcount: 5000,
      Orderby: "ID",
      Orderbydecorasc: false,
    });

    return {
      data: result,
    };
  } catch (error) {
    console.error("Error fetching request payment requests:", error);
    return {
      error: error,
    };
  }
};

export const fetchCategoryChoices = async () => {
  try {
    const response: any = await SPServices.SPGetChoices({
      Listname: "PaymentRequestDetails",
      FieldName: "PaymentType", // ensure it's the internal name
    });

    // Format for PrimeReact dropdown
    const categories = response.Choices.map((choice: string) => ({
      name: choice,
      code: choice,
    }));

    return { data: categories };
  } catch (error) {
    console.error("Error fetching role choices:", error);
    return { error };
  }
};

export const fetchProjectTags = async () => {
  try {
    const result = await SPServices.SPReadItems<ProjectTagData>({
      Listname: "ProjectTags",
      Select: "*,Author/EMail,Author/Title,Author/Id",
      Expand: "Author",
      Topcount: 5000,
      Orderby: "ID",
      Orderbydecorasc: false,
    });

    return {
      data: result,
    };
  } catch (error) {
    console.error("Error fetching request payment requests:", error);
    return {
      error: error,
    };
  }
};

export const fetchDepartmentChoices = async () => {
  try {
    const response: any = await SPServices.SPGetChoices({
      Listname: "PaymentRequestDetails",
      FieldName: "Department", // ensure it's the internal name
    });

    // Format for PrimeReact dropdown
    const categories = response.Choices.map((choice: string) => ({
      name: choice,
      code: choice,
    }));

    return { data: categories };
  } catch (error) {
    console.error("Error fetching department choices:", error);
    return { error };
  }
};

export const fetchEntityChoices = async () => {
  try {
    const response: any = await SPServices.SPGetChoices({
      Listname: "PaymentRequestDetails",
      FieldName: "Entity", // ensure it's the internal name
    });

    // Format for PrimeReact dropdown
    const categories = response.Choices.map((choice: string) => ({
      name: choice,
      code: choice,
    }));

    return { data: categories };
  } catch (error) {
    console.error("Error fetching entity choices:", error);
    return { error };
  }
};

export const fetchFTActionChoices = async () => {
  try {
    const response: any = await SPServices.SPGetChoices({
      Listname: "PaymentRequestDetails",
      FieldName: "FinanceTeamAction", // ensure it's the internal name
    });

    // Format for PrimeReact dropdown
    const categories = response.Choices.map((choice: string) => ({
      name: choice,
      code: choice,
    }));

    return { data: categories };
  } catch (error) {
    console.error("Error fetching role choices:", error);
    return { error };
  }
};

export const fetchAccountChoices = async () => {
  try {
    const response: any = await SPServices.SPGetChoices({
      Listname: "RequestPaymentDetails",
      FieldName: "Account", // ensure it's the internal name
    });

    // Format for PrimeReact dropdown
    const categories = response.Choices.map((choice: string) => ({
      name: choice,
      code: choice,
    }));

    return { data: categories };
  } catch (error) {
    console.error("Error fetching role choices:", error);
    return { error };
  }
};

export const fetchStatus = async () => {
  try {
    const response: any = await SPServices.SPGetChoices({
      Listname: "PaymentRequestDetails",
      FieldName: "PaymentProcess", // ensure it's the internal name
    });

    // Format for PrimeReact dropdown
    const categories = response.Choices.map((choice: string) => ({
      name: choice,
      code: choice,
    }));

    return { data: categories };
  } catch (error) {
    console.error("Error fetching role choices:", error);
    return { error };
  }
};

export const fetchPaymentType = async () => {
  try {
    const response: any = await SPServices.SPGetChoices({
      Listname: "PaymentRequestDetails",
      FieldName: "PaymentType", // ensure it's the internal name
    });

    // Format for PrimeReact dropdown
    const categories = response.Choices.map((choice: string) => ({
      name: choice,
      code: choice,
    }));

    return { data: categories };
  } catch (error) {
    console.error("Error fetching role choices:", error);
    return { error };
  }
};

export const addNewRequest = async (newItem: any) => {
  try {
    const response = await SPServices.SPAddItem({
      Listname: "PaymentRequestDetails",
      RequestJSON: newItem,
    });

    return {
      data: response,
    };
  } catch (error) {
    console.error("Error adding new request:", error);
    return {
      error: error,
    };
  }
};

export const updateRequest = async (itemId: number, updatedItem: any) => {
  try {
    const response = await SPServices.SPUpdateItem({
      Listname: "PaymentRequestDetails", // Your SP List Name
      ID: itemId,
      RequestJSON: updatedItem,
    });

    return { data: response };
  } catch (error) {
    console.error("Error updating manpower request:", error);
    return { error };
  }
};

export const addNewRequestPaymentDetails = async (newItem: any) => {
  try {
    const response = await SPServices.SPAddItem({
      Listname: "RequestPaymentDetails",
      RequestJSON: newItem,
    });

    return {
      data: response,
    };
  } catch (error) {
    console.error("Error adding new request:", error);
    return {
      error: error,
    };
  }
};

export const updateRequestPaymentDetails = async (
  itemId: number,
  updatedItem: any,
) => {
  try {
    const response = await SPServices.SPUpdateItem({
      Listname: "RequestPaymentDetails", // Your SP List Name
      ID: itemId,
      RequestJSON: updatedItem,
    });

    return { data: response };
  } catch (error) {
    console.error("Error updating manpower request:", error);
    return { error };
  }
};

export const completeBulkPayment = async (newItem: any) => {
  try {
    const response = await SPServices.SPAddItem({
      Listname: "RequestPaymentDetails",
      RequestJSON: newItem,
    });

    return {
      data: response,
    };
  } catch (error) {
    console.error("Error adding new request:", error);
    return {
      error: error,
    };
  }
};

export const createPaymentRequestFolder = async (requestId: string) => {
  try {
    const response = await SPServices.SPCreateFolder({
      LibraryName: "AttachmentsDetailsNew",
      FolderName: requestId,
    });

    return { data: response };
  } catch (error) {
    console.error("Error creating folder:", error);
    return { error };
  }
};

/*export const uploadPaymentRequestAttachment = async (
  requestId: string,
  file: File
) => {
  try {
    const response = await SPServices.SPUploadFileToFolder({
      LibraryName: "AttachmentsDetailsNew",
      FolderName: requestId,
      FileName: file.name,
      File: file,
    });

    return { data: response };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { error };
  }
};*/

export const uploadPaymentRequestAttachment = async (
  requestId: string,
  file: File,
) => {
  try {
    // ✅ ensure folder exists first
    await SPServices.SPCreateFolder({
      LibraryName: "AttachmentsDetailsNew",
      FolderName: requestId,
    });

    // ✅ then upload file
    const response = await SPServices.SPUploadFileToFolder({
      LibraryName: "AttachmentsDetailsNew",
      FolderName: requestId,
      FileName: file.name,
      File: file,
    });

    return { data: response };
  } catch (error) {
    console.error("Error uploading file:", error);

    return { error };
  }
};

export const deleteRequestAttachment = async (
  requestId: string,
  fileName: string,
) => {
  try {
    const response = await SPServices.SPDeleteFileFromFolder({
      LibraryName: "AttachmentsDetailsNew",
      FolderName: requestId,
      FileName: fileName,
    });

    return { data: response };
  } catch (error) {
    console.error("Error deleting file:", error);
    return { error };
  }
};

export const getRequestAttachments = async (requestId: string) => {
  try {
    const items = await SPServices.SPReadItems({
      Listname: "AttachmentsDetailsNew",
      Select: "*,FileLeafRef,FileRef,Author/Title,Created,FSObjType",
      Expand: "Author",
      Topcount: 5000,
    });

    // 🔥 Step 1: Find folder (same as LookUp)
    const folder = items.find(
      (item: any) => item.FileLeafRef === requestId && item.FSObjType === 1,
    );

    if (!folder) return { data: [] };

    // 🔥 Step 2: Filter files inside folder
    const folderPath = folder.FileRef + "/";

    const files = items.filter(
      (item: any) =>
        item.FileRef.startsWith(folderPath) && item.FSObjType === 0,
    );

    return { data: files };
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return { error };
  }
};

export const deleteMyRequest = async (itemId: number) => {
  try {
    const response = await SPServices.SPDeleteItem({
      Listname: "PaymentRequestDetails",
      ID: itemId,
    });

    return {
      data: response,
    };
  } catch (error) {
    console.error("Error deleting request:", error);
    return {
      error,
    };
  }
};

export const addPaymentTypeChoice = async (
  newChoice: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!newChoice?.trim()) {
      return { success: false, message: "Invalid category name" };
    }

    const listTitle = "PaymentRequestDetails";
    const fieldName = "PaymentType";

    // Step 1: Get the site URL from sp
    const webInfo = await sp.web.select("Url").get();
    const siteUrl = webInfo.Url;

    // Step 2: Fetch existing field info via REST (more reliable than PnPjs .get())
    const fieldRes = await fetch(
      `${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/fields/getbyinternalnameortitle('${fieldName}')`,
      {
        headers: {
          Accept: "application/json;odata=verbose",
        },
        credentials: "same-origin",
      },
    );

    const fieldJson = await fieldRes.json();
    const existingChoices: string[] = fieldJson.d.Choices.results || [];

    // Step 3: Prevent duplicates
    if (
      existingChoices
        .map((c) => c.toLowerCase())
        .includes(newChoice.toLowerCase())
    ) {
      return { success: false, message: "Category already exists" };
    }

    // Step 4: Get Request Digest (required for POST/PATCH in SharePoint)
    const digestRes = await fetch(`${siteUrl}/_api/contextinfo`, {
      method: "POST",
      headers: { Accept: "application/json;odata=verbose" },
      credentials: "same-origin",
    });
    const digestJson = await digestRes.json();
    const requestDigest = digestJson.d.GetContextWebInformation.FormDigestValue;

    // Step 5: Update the field with new choices list
    const updatedChoices = [...existingChoices, newChoice];

    const updateRes = await fetch(
      `${siteUrl}/_api/web/lists/getbytitle('${listTitle}')/fields/getbyinternalnameortitle('${fieldName}')`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": requestDigest,
          "X-HTTP-Method": "MERGE",
          "IF-MATCH": "*",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          __metadata: { type: "SP.FieldChoice" },
          Choices: {
            __metadata: { type: "Collection(Edm.String)" },
            results: updatedChoices,
          },
        }),
      },
    );

    if (!updateRes.ok && updateRes.status !== 204) {
      const errText = await updateRes.text();
      console.error("SharePoint field update error:", errText);
      return { success: false, message: "Failed to update field choices" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding PaymentType choice:", error);
    return { success: false, message: "Failed to add category" };
  }
};

export const addNewCategory = async (newItem: any) => {
  try {
    const response = await SPServices.SPAddItem({
      Listname: "RequestForMainCategory",
      RequestJSON: newItem,
    });

    return {
      data: response,
    };
  } catch (error) {
    console.error("Error adding new category:", error);
    return {
      error: error,
    };
  }
};

export const addNewSubCategory = async (newItem: any) => {
  try {
    const response = await SPServices.SPAddItem({
      Listname: "RequestForSubcategory",
      RequestJSON: newItem,
    });

    return {
      data: response,
    };
  } catch (error) {
    console.error("Error adding sub category:", error);

    return {
      error: error,
    };
  }
};
