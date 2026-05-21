import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { BookType } from 'xlsx';

function dateNum(
  v: number | boolean | Date | string,
  date1904: boolean = false,
) {
  if (date1904) (v as number) += 1462;
  const epoch = Date.parse(v as string);
  return (
    (epoch - (new Date(Date.UTC(1899, 11, 30)) as unknown as number)) /
    (24 * 60 * 60 * 1000)
  );
}

function sheetFromArrayOfArrays(data: IData[]) {
  const ws: IData = {};
  const range = {
    s: {
      c: 10000000,
      r: 10000000,
    },
    e: {
      c: 0,
      r: 0,
    },
  };
  for (let R = 0; R !== data.length; ++R) {
    for (let C = 0; C !== data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      const cell: {
        v: number | boolean | Date | string;
        t?: string;
        z?: string;
      } = {
        v: data[R][C],
      };
      // eslint-disable-next-line no-continue
      if (cell.v == null) continue;
      const cellRef = XLSX.utils.encode_cell({
        c: C,
        r: R,
      });

      if (typeof cell.v === 'number') cell.t = 'n';
      else if (typeof cell.v === 'boolean') cell.t = 'b';
      else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14];
        cell.v = dateNum(cell.v);
      } else cell.t = 's';

      ws[cellRef] = cell;
    }
  }
  if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
  return ws;
}

class Workbook {
  public SheetNames: string[] = [];

  public Sheets: IData = {};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function s2ab(s: any) {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  // eslint-disable-next-line no-bitwise
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

/**
 * @description 导出excel文件
 * @export
 * @param {{
 *   multiHeader: [];
 *   header: string[];
 *   data: string[][];
 *   filename: string;
 *   merges: [];
 *   autoWidth: boolean;
 *   bookType: BookType;
 * }} {
 *   multiHeader = [],
 *   header,
 *   data,
 *   filename,
 *   merges = [],
 *   autoWidth = true,
 *   bookType = 'xlsx',
 * }
 */
export function exportJsonToExcel({
  multiHeader = [],
  header,
  data,
  filename,
  merges = [],
  autoWidth = true,
  bookType = 'xlsx',
}: {
  multiHeader: [];
  header: string[];
  data: string[][];
  filename: string;
  merges: [];
  autoWidth: boolean;
  bookType: BookType;
}): void {
  /* original data */
  filename = filename || 'excel-list';
  data = [...data];
  data.unshift(header);
  for (let i = multiHeader.length - 1; i > -1; i--) {
    data.unshift(multiHeader[i]);
  }
  const wsName = 'SheetJS';
  const wb = new Workbook();
  const ws = sheetFromArrayOfArrays(data);

  if (merges.length > 0) {
    if (!ws['!merges']) ws['!merges'] = [];
    merges.forEach(item => {
      ws['!merges'].push(XLSX.utils.decode_range(item));
    });
  }
  if (autoWidth) {
    /* 设置worksheet每列的最大宽度 */
    const colWidth = data.map(row =>
      row.map(val => {
        /* 先判断是否为null/undefined */
        if (val == null) {
          return {
            wch: 10,
          };
        }
        if (val.toString().charCodeAt(0) > 255) {
          /* 再判断是否为中文 */
          return {
            wch: val.toString().length * 2,
          };
        }
        return {
          wch: val.toString().length,
        };
      }),
    );
    /* 以第一行为初始值 */
    const result = colWidth[0];
    for (let i = 1; i < colWidth.length; i++) {
      for (let j = 0; j < colWidth[i].length; j++) {
        if (result[j].wch < colWidth[i][j].wch) {
          result[j].wch = colWidth[i][j].wch;
        }
      }
    }
    ws['!cols'] = result;
  }

  /* add worksheet to workbook */
  wb.SheetNames.push(wsName);
  wb.Sheets[wsName] = ws;

  const wbOut = XLSX.write(wb, {
    bookType,
    bookSST: false,
    type: 'binary',
  });
  saveAs(
    new Blob([s2ab(wbOut)], {
      type: 'application/octet-stream',
    }),
    `${filename}.${bookType}`,
  );
}

/**
 * @description 读取excel文件
 * @export
 * @param {File} file
 * @param {number} sheetIndex
 * @returns {*}  {Promise<IData[]>}
 */
export async function readExcelFile(
  file: File,
  sheetIndex: number,
): Promise<IData[]> {
  const readFile = (_file: File) => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsBinaryString(_file);
      reader.onload = ev => {
        resolve(ev.target?.result);
      };
    });
  };
  let data = await readFile(file);
  const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });
  const worksheet: XLSX.WorkSheet =
    workbook.Sheets[workbook.SheetNames[sheetIndex]];
  data = XLSX.utils.sheet_to_json(worksheet);
  return data as IData[];
}
