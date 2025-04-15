import express, { Request, Response } from 'express';
import XLSX from 'xlsx';

const app = express();
app.use((req: Request, res: Response, next) => {
  const contentType = req.headers['content-type'];
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.oasis.opendocument.spreadsheet', // .ods
    'application/x-vnd.oasis.opendocument.spreadsheet' // Alternative MIME for .ods
  ];

  if (req.method === 'POST' && !validTypes.includes(contentType || '')) {
    return res.status(415).json({ 
      error: 'Unsupported Media Type. Please upload a spreadsheet file (.xlsx, .xls, or .ods)' 
    });
  }
  next();
});

app.use(express.raw({ 
  type: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/x-vnd.oasis.opendocument.spreadsheet'
  ],
  limit: '10mb'
}));


app.post('/', (req: Request, res: Response) => {
  try {
    const workbook = XLSX.read(req.body, { type: 'buffer' });

    const result = workbook.SheetNames.map(sheetName => ({
      sheetName,
      data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
    }));

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
