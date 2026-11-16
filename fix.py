import re

file_path = r"d:\Finance\src\webparts\financeManagement\components\EditMyRequestInfo\EditMyRequestInfo.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace selectedCategory Option usages
content = content.replace("formData?.PaymentType", "formData?.Category")
content = content.replace('PaymentType: e.value?.name || "",', 'Category: e.value?.name || "",')
content = content.replace("PaymentType: formData.Category,", "PaymentType: formData.Category, \n      TypeOfService: formData.TypeOfService, \n      VendorName: formData.Vendor, \n      PaymentFor: formData.Freelancer, \n      InvoiceNotApplicable: formData.InvoiceApplicable,")

# Fix isCategoryWithPayment etc.
content = content.replace("!!selectedCategory ", "!!selectedCategoryOption ")
content = content.replace("selectedCategory.name", "selectedCategoryOption?.name")
content = content.replace("selectedCategory?.name", "selectedCategoryOption?.name")


# ToggleButton
content = content.replace("""checked={checked}
                onChange={(e) => setChecked(e.value)}""", """checked={formData?.InvoiceApplicable || false}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, InvoiceApplicable: e.value }))}""")

# invoiceNumber
content = content.replace("""value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}""", """value={formData?.InvoiceNumber || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, InvoiceNumber: e.target.value }))}""")

# description
content = content.replace("""value={description}
              onChange={(e) => setDescription(e.target.value)}""", """value={formData?.Description || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, Description: e.target.value }))}""")

# selecteTag (Wait, in EditMyRequestInfo.tsx the typo is value={setSelectedTag})
content = content.replace("""value={setSelectedTag}
              onChange={(e) => setSelectedTag(e.value)}""", """value={tags.find(t => t.Title === formData?.Tag) || null}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, Tag: e.value?.Title }))}""")

# selectedMonth
content = content.replace("""value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.value)}""", """value={months.find(m => m.Name === formData?.Month) || null}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, Month: e.value?.Name }))}""")

# selectedYear
content = content.replace("""value={selectedYear}
                    onChange={(e) => setSelectedYear(e.value)}""", """value={years.find(y => y.Year.toString() === formData?.Year?.toString()) || null}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, Year: e.value?.Year?.toString() }))}""")

# subCategory (id="subCategory")
old_sub = """value={
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
                }}"""

new_sub = """value={(() => {
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
                }}"""

content = content.replace(old_sub, new_sub)

# Payment To (id="paymentto")
old_payment = """value={
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
                }}"""
new_payment = """value={
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
                }}"""
content = content.replace(old_payment, new_payment)

# Fix !! selectedCategories
content = content.replace("selectedCategory === null", "selectedCategoryOption === null")
content = content.replace("!selectedCategory", "!selectedCategoryOption")


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
