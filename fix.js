const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'Finance', 'src', 'webparts', 'financeManagement', 'components', 'EditMyRequestInfo', 'EditMyRequestInfo.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

// Replace selectedCategory Option usages
content = content.replace(/formData\?\.PaymentType/g, "formData?.Category");
content = content.replace(/PaymentType:\s*e\.value\?\.name\s*\|\|\s*"",/g, 'Category: e.value?.name || "",');

content = content.replace("PaymentType: formData.Category,", `PaymentType: formData.Category,
      TypeOfService: formData.TypeOfService,
      VendorName: formData.Vendor,
      PaymentFor: formData.Freelancer,
      InvoiceNotApplicable: formData.InvoiceApplicable,`);

// Fix isCategoryWithPayment etc.
content = content.replace(/!!selectedCategory /g, "!!selectedCategoryOption ");
content = content.replace(/selectedCategory\.name/g, "selectedCategoryOption?.name");
content = content.replace(/selectedCategory\?\.name/g, "selectedCategoryOption?.name");

// ToggleButton
content = content.replace(`checked={checked}
                onChange={(e) => setChecked(e.value)}`, `checked={formData?.InvoiceApplicable || false}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, InvoiceApplicable: e.value }))}`);

// invoiceNumber
content = content.replace(`value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}`, `value={formData?.InvoiceNumber || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, InvoiceNumber: e.target.value }))}`);

// description
content = content.replace(`value={description}
              onChange={(e) => setDescription(e.target.value)}`, `value={formData?.Description || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, Description: e.target.value }))}`);

// selecteTag 
content = content.replace(`value={setSelectedTag}
              onChange={(e) => setSelectedTag(e.value)}`, `value={tags.find(t => t.Title === formData?.Tag) || null}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, Tag: e.value?.Title }))}`);

// selectedMonth
content = content.replace(`value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.value)}`, `value={months.find(m => m.Name === formData?.Month) || null}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, Month: e.value?.Name }))}`);

// selectedYear
content = content.replace(`value={selectedYear}
                    onChange={(e) => setSelectedYear(e.value)}`, `value={years.find(y => y.Year.toString() === formData?.Year?.toString()) || null}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, Year: e.value?.Year?.toString() }))}`);

// subCategory (id="subCategory")
const oldSub = `value={
                  selectedCategoryOption?.name === "Freelancer Payment" ||
                  selectedCategoryOption?.name === "Vendor Payments"
                    ? selectedTypeOfService
                    : selectedCategoryOption?.name ===
                          "Transfer of funds-miscellaneous" ||
                        selectedCategoryOption?.name === "Labour Welfare Fund"
                      ? selectedVendor
                      : selectedSubCategory
                }
                //onChange={(e) => setSelectedTypeOfService(e.value)}
                onChange={(e) => {
                  if (
                    selectedCategoryOption?.name === "Freelancer Payment" ||
                    selectedCategoryOption?.name === "Vendor Payments"
                  ) {
                    setSelectedTypeOfService(e.value);
                  } else if (
                    selectedCategoryOption?.name ===
                      "Transfer of funds-miscellaneous" ||
                    selectedCategoryOption?.name === "Labour Welfare Fund"
                  ) {
                    setSelectedVendor(e.value);
                  } else {
                    setSelectedSubCategory(e.value);
                  }
                }}`;

const newSub = `value={(() => {
                  if (selectedCategoryOption?.name === "Freelancer Payment" || selectedCategoryOption?.name === "Vendor Payments") {
                    return typeOfService.find(t => t.Name === formData?.TypeOfService) || null;
                  }
                  if (selectedCategoryOption?.name === "Transfer of funds-miscellaneous" || selectedCategoryOption?.name === "Labour Welfare Fund") {
                    return vendors.find(v => v.VendorName === formData?.Vendor) || null;
                  }
                  return filteredSubCategories.find(s => s.Id === formData?.SubCategoryId) || null;
                })()}
                onChange={(e) => {
                  if (selectedCategoryOption?.name === "Freelancer Payment" || selectedCategoryOption?.name === "Vendor Payments") {
                    setFormData((prev: any) => ({ ...prev, TypeOfService: e.value?.Name }));
                  } else if (selectedCategoryOption?.name === "Transfer of funds-miscellaneous" || selectedCategoryOption?.name === "Labour Welfare Fund") {
                    setFormData((prev: any) => ({ ...prev, Vendor: e.value?.VendorName }));
                  } else {
                    setFormData((prev: any) => ({ ...prev, SubCategoryId: e.value?.Id }));
                  }
                }}`;

content = content.replace(oldSub, newSub);

// Payment To (id="paymentto")
const oldPayment = `value={
                  selectedCategoryOption?.name === "Freelancer Payment"
                    ? selectedFreelancers
                    : selectedPaymentToVendor
                }
                onChange={(e) => {
                  if (selectedCategoryOption?.name === "Freelancer Payment") {
                    setSelectedFreelancers(e.value);
                  } else {
                    setSelectedPaymentToVendor(e.value);
                  }
                }}`;
const newPayment = `value={
                  selectedCategoryOption?.name === "Freelancer Payment"
                    ? freelancers.find(f => f.FreelancerName === formData?.Freelancer) || null
                    : vendors.find(v => v.VendorName === formData?.Vendor) || null
                }
                onChange={(e) => {
                  if (selectedCategoryOption?.name === "Freelancer Payment") {
                    setFormData((prev: any) => ({ ...prev, Freelancer: e.value?.FreelancerName }));
                  } else {
                    setFormData((prev: any) => ({ ...prev, Vendor: e.value?.VendorName }));
                  }
                }}`;
content = content.replace(oldPayment, newPayment);

// Fix !! selectedCategory etc.
content = content.replace(/selectedCategory === null/g, "selectedCategoryOption === null");
content = content.replace(/!selectedCategory\b/g, "!selectedCategoryOption");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done');
