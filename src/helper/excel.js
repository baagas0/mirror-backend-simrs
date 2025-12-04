const ExcelJS = require("exceljs");

/**
 * @filename string
 * @title string
 * @header array of object
 *   [
 *     {
 *          width: 10,
 *          header: 'Nomor',
 *          key: 'no',
 *     }
 *   ]
 * 
 * @data array of object
 *   [
 *     { no: 1 }
 *     { no: 2 }
 *     { no: 3 }
 *   ]
 */
async function createExcel(filename, title, header, data) {
    return new Promise(async (resolve, reject) => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(title);

        let cell = {
            title: 1,
            header: 3,
            start: 4
        }
        const columnKey = Array.from({ length: 26 }, (_, index) => String.fromCharCode('A'.charCodeAt(0) + index))
        // console.log(column)

        sheet.mergeCells("A" + cell.title + ":" + columnKey[header.length-1] + cell.title)
        sheet.getCell("A" + cell.title).value = ""+title
        sheet.getCell("A" + cell.title).font = { bold: true, underline: true, center: true, name: 'Times New Roman', size: 14 };

        // sheet.columns = header 
        let row_header = sheet.getRow(cell.header)
            row_header.height = 30

        for (const key in header) {
            const alpha = columnKey[key]
            const item = header[key]

            sheet.getColumn(alpha).width = item.width
            sheet.getColumn(alpha).key = item.key

            sheet.getCell(`${alpha}:${cell.header}`).value = item.label
            sheet.getCell(`${alpha}:${cell.header}`).font = { bold: true }
            sheet.getCell(`${alpha}:${cell.header}`).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
            sheet.getCell(`${alpha}:${cell.header}`).alignment = { horizontal: 'center', vertical: 'middle' }

            // Content Data
            let no = 0
            for (const i of data) {
                sheet.getCell(`${alpha};${cell.start + no}`).value  = i[item.key]

                no++
            }
        }

        // let fileName = `LAPORAN HARIAN KUNJUNGAN PASIEN.xlsx`;
        
        resolve(await workbook.xlsx.writeBuffer());
    })
}

module.exports = { createExcel }