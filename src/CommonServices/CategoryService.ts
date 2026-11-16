import { MainCategoryData, SubCategoryData } from "../types";
import SPServices from "./SPServices";

export const fetchMainCategories = async () => {
  try {
    const result = await SPServices.SPReadItems<MainCategoryData>({
      Listname: "PaymentRequestDetails",
      Select: "*,Author/EMail,Author/Title,Author/Id",
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

export const fetchSubCategories = async () => {
  try {
    const result = await SPServices.SPReadItems<SubCategoryData>({
      Listname: "RequestForSubcategory",
      Select: "*,Author/EMail,Author/Title,Author/Id,Maincategory/Id,Maincategory/MainCategory",
      Expand: "Author,Maincategory",
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