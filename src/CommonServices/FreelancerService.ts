import { FreelancerData } from "../types";
import SPServices from "./SPServices";

export const fetchFreelancers = async () => {
  try {
    const result = await SPServices.SPReadItems<FreelancerData>({
      Listname: "FreelancerPaymentFor",
      Select: "*,Author/EMail,Author/Title,Author/Id",
      //Filter: "IsDeleted ne 1",
      Expand: "Author",
      Topcount: 100,
      Orderby: "ID",
      Orderbydecorasc: false,
    });

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


export const fetchTypeOfService = async () => {
  try {
    const response: any = await SPServices.SPGetChoices({
      Listname: "FreelancerPaymentFor",
      FieldName: "TypeOfservice", // ensure it's the internal name
    });

    // Format for PrimeReact dropdown
    const types = response.Choices.map((choice: string) => ({
      name: choice,
      code: choice,
    }));

    return { data: types };
  } catch (error) {
    console.error("Error fetching type choices:", error);
    return { error };
  }
};


export const addNewFreelancer = async (newItem: any) => {
  try {
    const response = await SPServices.SPAddItem({
      Listname: "FreelancerPaymentFor",
      RequestJSON: newItem,
    });

    return {
      data: response,
    };
  } catch (error) {
    console.error("Error adding new freelancer:", error);
    return {
      error: error,
    };
  }
};

export const updateFreelancer = async (
  itemId: number,
  updatedItem: any
) => {
  try {
    const response = await SPServices.SPUpdateItem({
      Listname: "FreelancerPaymentFor", // Your SP List Name
      ID: itemId,
      RequestJSON: updatedItem,
    });

    return { data: response };
  } catch (error) {
    console.error("Error updating freelancer request:", error);
    return { error };
  }
};

export const uploadFreelancerAttachment = async (
  itemId: number,
  file: File
) => {
  try {
    const response = await SPServices.SPAddAttachment({
      ListName: "FreelancerPaymentFor",
      ListID: itemId,
      FileName: file.name,
      Attachments: file, // ⚠️ must support binary
    });

    return { data: response };
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return { error };
  }
};

export const getFreelancerAttachments = async (itemId: number) => {
  try {
    const response = await SPServices.SPGetAttachments({
      Listname: "FreelancerPaymentFor",
      ID: itemId,
    });

    return { data: response };
  } catch (error) {
    console.error("Error fetching vendor attachments:", error);
    return { error };
  }
};