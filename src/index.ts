import express, { Request, Response } from 'express';
import XLSX from 'xlsx';

const app = express();
app.use(express.raw({ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', limit: '10mb' }));

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
