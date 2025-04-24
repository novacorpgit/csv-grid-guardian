
import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface DataGridProps {
  data: any[];
}

const DataGrid: React.FC<DataGridProps> = ({ data }) => {
  const columnDefs = data.length > 0
    ? Object.keys(data[0]).map(key => ({
        field: key,
        filter: true,
        sortable: true
      }))
    : [];

  return (
    <div className="ag-theme-alpine w-full h-[600px]">
      <AgGridReact
        columnDefs={columnDefs}
        rowData={data}
        pagination={true}
        paginationPageSize={15}
        defaultColDef={{
          flex: 1,
          minWidth: 150,
          resizable: true
        }}
      />
    </div>
  );
};

export default DataGrid;
