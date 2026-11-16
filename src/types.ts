export interface PaymentRequestData {
  "odata.type": string;
  "odata.id": string;
  "odata.etag": string;
  "odata.editLink": string;
  "Author@odata.navigationLinkUrl": string;
  Author: {
    "odata.type": string;
    "odata.id": string;
    EMail: string;
    Title: string;
    Id: number;
  };
  PersonName: {
    "odata.type": string;
    "odata.id": string;
    Id: number;
    Title: string;
    EMail: string;
  };
  FinalApprovalBy: {
    "odata.type": string;
    "odata.id": string;
    Id: number;
    Title: string;
    EMail: string;
  };
  SpentBy: {
    "odata.type": string;
    "odata.id": string;
    Id: number;
    Title: string;
    EMail: string;
  };
  FileSystemObjectType: number;
  Id: number;
  ServerRedirectedEmbedUri: string | null;
  ServerRedirectedEmbedUrl: string;
  ContentTypeId: string;
  Title: string | null;
  OData__ColorTag: string | null;
  ComplianceAssetId: string | null;
  RequestID: number;
  Date: string;
  Category: string;
  SubCategory: string;
  FinalApprovedAmount: number;
  Status: string;
  CEOStatus?: boolean;
  IsScheduled?: boolean | null;
  FinanceTeamAction?: string;
  PaymentProcess?: string;
  PaymentType?: string;
  PaymentFor?: {
    Id: number;
    FreelancerName: string;
  };
  RequestForsubCategory?: {
    Id: number;
    Subcategory: string;
  };
  SubcategoryDate: string;
  VendorName?: {
    Id: number;
    VendorName: string;
  };
  PaymentCompletedDate?: string;
  PaymentCompletedMonth: number;
  PaymentCompletedYear: number;
  ApproverStatus?: string | boolean;
  TypeOfService: string;
  Amount: number;
  Description: string;
  InvoiceNumber: string;
  LisenceFor: string;
  CertificationName: string;
  Others: string;
  InvoiceSubmitted?: string | boolean;
  FinalRejectedBy?: {
    Id: number;
    EMail: string;
  };
  PaymentScheduledDate: string;
  selected?: boolean;
  MarkedAsReview?: boolean;
  ID: number;
  Modified: string;
  Created: string;
  AuthorId: number;
  EditorId: number;
  OData__UIVersionString: string;
  Attachments: boolean;
  GUID: string;
  Department: string;
  Entity: string;
}

export interface RequestPaymentData {
  "odata.type": string;
  "odata.id": string;
  "odata.etag": string;
  "odata.editLink": string;
  "Author@odata.navigationLinkUrl": string;
  Author: {
    "odata.type": string;
    "odata.id": string;
    EMail: string;
    Title: string;
    Id: number;
  };
  FileSystemObjectType: number;
  Id: number;
  ServerRedirectedEmbedUri: string | null;
  ServerRedirectedEmbedUrl: string;
  ContentTypeId: string;
  Title: string | null;
  OData__ColorTag: string | null;
  ComplianceAssetId: string | null;
  RequestID: number;
  TDS: number;
  OtherDeductions: number;
  CGSTAmount: number;
  IGSTAmount: number;
  SGST: number;
  Reference: string;
  Remarks: string;
  Amount: number;
  ParentReqPayID: number;
  Date?: string;
  FinalAmount?: string;
  Account?: string;
  InvoiceNumber?: string;
  GSTIN: boolean;
  ID: number;
  Modified: string;
  Created: string;
  AuthorId: number;
  EditorId: number;
  OData__UIVersionString: string;
  Attachments: boolean;
  GUID: string;
}

export interface VendorData {
  "odata.type": string;
  "odata.id": string;
  "odata.etag": string;
  "odata.editLink": string;
  "Author@odata.navigationLinkUrl": string;
  Author: {
    "odata.type": string;
    "odata.id": string;
    EMail: string;
    Title: string;
    Id: number;
  };
  FileSystemObjectType: number;
  Id: number;
  ServerRedirectedEmbedUri: string | null;
  ServerRedirectedEmbedUrl: string;
  ContentTypeId: string;
  Title: string | null;
  OData__ColorTag: string | null;
  ComplianceAssetId: string | null;
  ID: number;
  VendorID: string;
  VendorName: string;
  EmailID: string;
  MobileNumber: string;
  TypeOfservice?: string;
  ActiveStatus?: boolean;
  IsDeleted?: boolean | null;
  GSTNumber: string;
  GSTVentor?: string;
  AccountName?: string;
  BankName?: string;
  AccountNumber?: string;
  IFSCCode?: string;
  AdditionalDetails?: string;
  Modified: string;
  Created: string;
  AuthorId: number;
  EditorId: number;
  OData__UIVersionString: string;
  Attachments: boolean;
  GUID: string;
}

export interface FreelancerData {
  "odata.type": string;
  "odata.id": string;
  "odata.etag": string;
  "odata.editLink": string;
  "Author@odata.navigationLinkUrl": string;
  Author: {
    "odata.type": string;
    "odata.id": string;
    EMail: string;
    Title: string;
    Id: number;
  };
  FileSystemObjectType: number;
  Id: number;
  ServerRedirectedEmbedUri: string | null;
  ServerRedirectedEmbedUrl: string;
  ContentTypeId: string;
  Title: string | null;
  OData__ColorTag: string | null;
  ComplianceAssetId: string | null;
  ID: number;
  FreelancerID: number;
  FreelancerName: string;
  EmailID: string;
  MobileNumberf: string;
  TypeOfservice?: string;
  ActiveStatus?: boolean;
  IsDeleted?: boolean | null;
  GSTNumber: string;
  GSTFreelancer?: string;
  AccountName?: string;
  BankName?: string;
  AccountNumber?: string;
  IFSCCode?: string;
  AdditionalDetails?: string;
  Modified: string;
  Created: string;
  AuthorId: number;
  EditorId: number;
  OData__UIVersionString: string;
  Attachments: boolean;
  GUID: string;
}

export type CategoryData = {
  name: string;
  code: string;
};

export type FTActionCategoryData = {
  name: string;
  code: string;
};

export type AccountCategoryData = {
  name: string;
  code: string;
};

export interface MainCategoryData {
  Id: number;
  MainCategory: string;
}

export interface SubCategoryData {
  Id: number;
  Subcategory: string;
  Maincategory?: {
    Id: number;
    MainCategory: string;
  };
}

export interface ProjectTagData {
  Id: number;
  Title: string;
}

export interface IDepartmentData {
  // Id: number;
  // Title: string;
  name: string;
  code?: string;
}

export interface IEntityData {
  name: string;
  code?: string;
}

export interface TypeOfServiceOption {
  name: string;
  code?: string;
}

export interface StatusData {
  name: string;
  code?: string;
}
export interface PaymentTypeData {
  name: string;
  code?: string;
}
