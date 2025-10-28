import React from 'react'

export interface Column {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  zebraStripes?: boolean
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, zebraStripes = true }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-neutral-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="text-small font-bold uppercase tracking-wide text-left p-sm border-b border-neutral-300"
                style={{ textAlign: column.align || 'left' }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={`
                hover:bg-neutral-100 transition-colors duration-fast
                ${zebraStripes && index % 2 === 1 ? 'bg-neutral-50' : 'bg-white'}
              `}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="text-body p-sm border-b border-neutral-300"
                  style={{ textAlign: column.align || 'left' }}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
