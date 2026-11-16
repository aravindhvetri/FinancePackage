import { SelectItem } from "primereact/selectitem";
import { IconType } from "primereact/utils";

type Option<D = any> = {
  label?: (data: D) => string;
  value?: (data: D) => any;
  className?: (data: D) => string;
  icon?: (data: D) => IconType<SelectItem>;
  title?: (data: D) => string;
  disabled?: (data: D) => boolean;
};

export function mapToDropdownOptions<D = any>(data: D[], options?: Option<D>) {
  const { label, value, className, icon, title, disabled } = options ?? {};

  return (data ?? []).map<SelectItem>((item) => {
    return {
      label: label?.(item),
      value: value?.(item),
      className: className?.(item),
      icon: icon?.(item),
      title: title?.(item),
      disabled: disabled?.(item),
    };
  });
}
