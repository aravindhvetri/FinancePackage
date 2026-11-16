import * as React from "react";
import styles from "./Table.module.scss";
import { DataTable } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { DataTableRowClickEvent } from "primereact/datatable";

type TableProps<D = any> = {
  value: D[];
  loading: boolean;
  paginator: boolean;
  rows: number;
  dataKey: string;
  columns: ColumnProps[];
  emptyMessage: string;
  onRowClick?: (event: DataTableRowClickEvent) => void;

  expandedRows?: any;
  onRowToggle?: (e: any) => void;
  rowExpansionTemplate?: (rowData: any) => React.ReactNode;
};

function Table({
  value,
  loading,
  paginator,
  rows = 10,
  dataKey,
  columns = [],
  emptyMessage,
  onRowClick,
  expandedRows,
  onRowToggle,
  rowExpansionTemplate,
}: TableProps) {
  return (
    <DataTable
      value={value}
      dataKey={dataKey}
      loading={loading}
      paginator={paginator}
      rows={rows}
      expandedRows={expandedRows}
      onRowToggle={onRowToggle}
      rowExpansionTemplate={rowExpansionTemplate}
      // className={styles.dataTable}
      className={`${styles.dataTable} customDataTable`}
      onRowClick={onRowClick}
      //emptyMessage={emptyMessage}
      emptyMessage={
        <div className={styles.customEmptyMessage}>
          <i className="pi pi-info-circle" style={{ marginRight: "8px" }} />
          {emptyMessage}
        </div>
      }
    >
      {columns.map((col, index) => (
        <Column key={col.field ?? index} {...col} />
      ))}
    </DataTable>
  );
}

export default Table;
