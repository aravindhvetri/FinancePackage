import * as React from "react";
import { ChangeEvent } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import styles from "./InputField.module.scss";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { FormEvent, Nullable } from "primereact/ts-helpers";
import classNames from "classnames";
import "./dropdown.scss";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { SelectItem } from "primereact/selectitem";

type DropdownProps = {
  type: "dropdown";
  options: SelectItem[];
  onChange?: (value: DropdownChangeEvent) => void;
  checkmark?: boolean;
  highlightOnSelect?: boolean;
  value?: any;
};

type InputTextProps = {
  type: "input-text";
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
  value?: string;
};

type InputTextareaProps = {
  type: "input-textarea";
  autoResize?: boolean;
  onChange?: (value: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  value?: string;
};

type CalendarProps = {
  type: "calendar";
  onChange?: (
    event: FormEvent<Date, React.SyntheticEvent<Element, Event>>,
  ) => void;
  value?: Nullable<Date>;
  showIcon?: boolean;
  showTime?: boolean;
  hourFormat?: "12" | "24";
};

type PeoplePickerProps = {
  type: "people-picker";
  context?: any;
  personSelectionLimit?: number;
  showtooltip?: boolean;
  ensureUser?: boolean;
  principalTypes?: PrincipalType[];
  webAbsoluteUrl?: any;
  defaultSelectedUsers?: any[];
  onChange?: (items: any[]) => void;
};

type InputFieldProps = (
  | DropdownProps
  | InputTextProps
  | InputTextareaProps
  | CalendarProps
  | PeoplePickerProps
) & {
  id?: string;
  //label?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
  labelClassName?: string;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function InputField(props: InputFieldProps) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function renderContent() {
    if (props.type === "dropdown") {
      return (
        <Dropdown
          id={props.id}
          value={props.value}
          onChange={props.onChange}
          options={props.options}
          placeholder={props.placeholder || "Select an option"}
          disabled={props.disabled}
          className={classNames(styles.dropdown, props.className)}
          //showClear
        />
      );
    }

    if (props.type === "input-text") {
      return (
        <InputText
          id={props.id}
          value={props.value}
          onChange={props.onChange}
          onKeyDown={props.onKeyDown}
          onPaste={props.onPaste}
          disabled={props.disabled}
          //placeholder={props.placeholder || "Enter text"}
          placeholder={props.placeholder}
          className={classNames(
            styles.inputText,
            props.className,
            props.error && styles.errorInput,
          )}
        />
      );
    }

    if (props.type === "input-textarea") {
      return (
        <InputTextarea
          id={props.id}
          autoResize={props.autoResize}
          value={props.value}
          onChange={props.onChange}
          rows={props.rows || 3}
          className={classNames(styles.inputTextarea, props.className)}
          disabled={props.disabled}
          placeholder={props.placeholder}
        />
      );
    }

    if (props.type === "calendar") {
      return (
        <Calendar
          id={props.id}
          value={props.value}
          onChange={props.onChange}
          showIcon={props.showIcon}
          className={classNames(styles.calendar, props.className)}
          disabled={props.disabled}
          placeholder={props.placeholder}
          showTime={props.showTime}
          hourFormat={props.hourFormat}
        />
      );
    }

    if (props.type === "people-picker") {
      return (
        <div className={styles.peoplePicker}>
          <PeoplePicker
            context={props.context}
            personSelectionLimit={props.personSelectionLimit}
            showtooltip={props.showtooltip}
            ensureUser={props.ensureUser}
            principalTypes={props.principalTypes}
            webAbsoluteUrl={props.webAbsoluteUrl}
            defaultSelectedUsers={props.defaultSelectedUsers}
            onChange={props.onChange}
          />
        </div>
      );
    }

    return null;
  }

  return (
    <div className={styles.field}>
      {/*<label htmlFor={props.id} className={styles.label}>
        {props.label}
      </label>*/}

      {props.label && (
        <label
          htmlFor={props.id}
          //className={styles.label}
          className={classNames(styles.label, props.labelClassName)}
        >
          {props.label}
        </label>
      )}

      <div className={styles.inputArea}>{renderContent()}</div>

      {props.error && <small className={styles.errorText}>{props.error}</small>}
    </div>
  );
}

export default InputField;
