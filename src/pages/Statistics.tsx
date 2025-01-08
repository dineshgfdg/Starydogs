import React, { useState, useRef } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  IconButton,
  Collapse,
  useTheme,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../utils/pdfExport';

interface DistrictData {
  name: string;
  total: number;
  completed: number;
  balance: number;
  ulbs: {
    name: string;
    total: number;
    completed: number;
    balance: number;
  }[];
}

const Statistics = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(anchorEl);
  const tableRef = useRef<HTMLTableElement>(null);

  const formatDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    
    // Get 5 months ago date for the "from" date
    const fromDate = new Date(today);
    fromDate.setMonth(today.getMonth() - 5);
    const fromDay = '01';
    const fromMonth = (fromDate.getMonth() + 1).toString().padStart(2, '0');
    const fromYear = fromDate.getFullYear();

    return {
      asOn: `${day}.${month}.${year}`,
      fromDate: `${fromDay}.${fromMonth}.${fromYear}`,
      toDate: `${day}.${month}.${year}`
    };
  };

  const dates = formatDate();

  // Data structure organized by regions and districts
  const regionsData = [
    {
      name: 'Visakhapatnam Region',
      total: 33162,
      completed: 10578,
      balance: 22584,
      districts: [
        {
          name: 'Srikakulam District',
          total: 4080,
          completed: 1000,
          balance: 3080,
          ulbs: [
            { name: 'Srikakulam', total: 2940, completed: 1000, balance: 1940 },
            { name: 'Amudalavalasa', total: 130, completed: 0, balance: 130 },
            { name: 'Ichapuram', total: 860, completed: 0, balance: 860 },
            { name: 'Palasa', total: 150, completed: 0, balance: 150 }
          ]
        },
        {
          name: 'Vizianagaram District',
          total: 7296,
          completed: 3023,
          balance: 4273,
          ulbs: [
            { name: 'Vizianagaram', total: 6463, completed: 2718, balance: 3745 },
            { name: 'Bobbili', total: 391, completed: 179, balance: 212 },
            { name: 'Rajam', total: 302, completed: 126, balance: 176 },
            { name: 'Nellimarla', total: 140, completed: 0, balance: 140 }
          ]
        },
        {
          name: 'Parvathipuram Manyam District',
          total: 616,
          completed: 237,
          balance: 379,
          ulbs: [
            { name: 'Palakonda', total: 121, completed: 0, balance: 121 },
            { name: 'Parvathipuram', total: 365, completed: 237, balance: 128 },
            { name: 'Salur', total: 130, completed: 0, balance: 130 }
          ]
        },
        {
          name: 'Visakhapatnam District',
          total: 20783,
          completed: 6318,
          balance: 14465,
          ulbs: [
            { name: 'GVMC', total: 20783, completed: 6318, balance: 14465 }
          ]
        },
        {
          name: 'Anakapalli District',
          total: 387,
          completed: 0,
          balance: 387,
          ulbs: [
            { name: 'Yelamanchili', total: 143, completed: 0, balance: 143 },
            { name: 'Narsipatnam', total: 244, completed: 0, balance: 244 }
          ]
        }
      ]
    },
    {
      name: 'Rajamahendravaram Region',
      total: 59662,
      completed: 4848,
      balance: 54814,
      districts: [
        {
          name: 'Kakinada District',
          total: 8318,
          completed: 0,
          balance: 8318,
          ulbs: [
            { name: 'Kakinada', total: 5000, completed: 0, balance: 5000 },
            { name: 'Tuni', total: 1125, completed: 0, balance: 1125 },
            { name: 'Pithapuram', total: 632, completed: 0, balance: 632 },
            { name: 'Samalkota', total: 639, completed: 0, balance: 639 },
            { name: 'Peddapuram', total: 358, completed: 0, balance: 358 },
            { name: 'Gollaprolu', total: 254, completed: 0, balance: 254 },
            { name: 'Yeleswaram', total: 310, completed: 0, balance: 310 }
          ]
        },
        {
          name: 'Dr.B.R.Ambedkar Konaseema District',
          total: 1208,
          completed: 438,
          balance: 770,
          ulbs: [
            { name: 'Amalapuram', total: 435, completed: 0, balance: 435 },
            { name: 'Mandapeta', total: 544, completed: 438, balance: 106 },
            { name: 'Ramachandrapuram', total: 44, completed: 0, balance: 44 },
            { name: 'Mummidivaram', total: 185, completed: 0, balance: 185 }
          ]
        },
        {
          name: 'East Godavari District',
          total: 8122,
          completed: 2104,
          balance: 6018,
          ulbs: [
            { name: 'Rajamahendravaram', total: 7610, completed: 2098, balance: 5512 },
            { name: 'Nidadavole', total: 135, completed: 0, balance: 135 },
            { name: 'Kovvur', total: 377, completed: 6, balance: 371 }
          ]
        },
        {
          name: 'West Godavari District',
          total: 4297,
          completed: 402,
          balance: 3895,
          ulbs: [
            { name: 'Bhimavaram', total: 1455, completed: 402, balance: 1053 },
            { name: 'Tadepalligudem', total: 1126, completed: 0, balance: 1126 },
            { name: 'Palakol', total: 501, completed: 0, balance: 501 },
            { name: 'Narasapuram', total: 655, completed: 0, balance: 655 },
            { name: 'Tanuku', total: 425, completed: 0, balance: 425 },
            { name: 'Akiveedu', total: 135, completed: 0, balance: 135 }
          ]
        },
        {
          name: 'Eluru District',
          total: 2697,
          completed: 0,
          balance: 2697,
          ulbs: [
            { name: 'Eluru', total: 1900, completed: 0, balance: 1900 },
            { name: 'Nuzvid', total: 165, completed: 0, balance: 165 },
            { name: 'Jangareddygudem', total: 412, completed: 0, balance: 412 },
            { name: 'Chintalapudi', total: 220, completed: 0, balance: 220 }
          ]
        },
        {
          name: 'Krishna District',
          total: 3982,
          completed: 50,
          balance: 3932,
          ulbs: [
            { name: 'Machilipatnam', total: 458, completed: 0, balance: 458 },
            { name: 'Gudivada', total: 1170, completed: 0, balance: 1170 },
            { name: 'YSR Tadigadapa', total: 1825, completed: 0, balance: 1825 },
            { name: 'Pedana', total: 209, completed: 0, balance: 209 },
            { name: 'Vuyyuru', total: 320, completed: 50, balance: 270 }
          ]
        },
        {
          name: 'NTR District',
          total: 31038,
          completed: 1854,
          balance: 29184,
          ulbs: [
            { name: 'Vijayawada', total: 29641, completed: 1854, balance: 27787 },
            { name: 'Jaggaiahpeta', total: 680, completed: 0, balance: 680 },
            { name: 'Kondapalli', total: 136, completed: 0, balance: 136 },
            { name: 'Nandigama', total: 318, completed: 0, balance: 318 },
            { name: 'Tiruvuru', total: 263, completed: 0, balance: 263 }
          ]
        }
      ]
    },
    {
      name: 'Guntur Region',
      total: 57918,
      completed: 7524,
      balance: 50394,
      districts: [
        {
          name: 'Guntur District',
          total: 38922,
          completed: 4122,
          balance: 34800,
          ulbs: [
            { name: 'Guntur', total: 31389, completed: 3209, balance: 28180 },
            { name: 'Tenali', total: 1425, completed: 772, balance: 653 },
            { name: 'Ponnur', total: 200, completed: 0, balance: 200 },
            { name: 'Mangalagiri-Tadepalli', total: 5908, completed: 141, balance: 5767 }
          ]
        },
        {
          name: 'Bapatla District',
          total: 1181,
          completed: 15,
          balance: 1166,
          ulbs: [
            { name: 'Bapatla', total: 308, completed: 10, balance: 298 },
            { name: 'Repalle', total: 221, completed: 0, balance: 221 },
            { name: 'Chirala', total: 232, completed: 5, balance: 227 },
            { name: 'Addanki', total: 420, completed: 0, balance: 420 }
          ]
        },
        {
          name: 'Palnadu District',
          total: 2788,
          completed: 768,
          balance: 2020,
          ulbs: [
            { name: 'Gurazala', total: 84, completed: 0, balance: 84 },
            { name: 'Dachepalli', total: 350, completed: 0, balance: 350 },
            { name: 'Piduguralla', total: 700, completed: 472, balance: 228 },
            { name: 'Macherla', total: 185, completed: 135, balance: 50 },
            { name: 'Sattenapalle', total: 362, completed: 0, balance: 362 },
            { name: 'Chilakaluripet', total: 465, completed: 0, balance: 465 },
            { name: 'Narasaraopet', total: 455, completed: 161, balance: 294 },
            { name: 'Vinukonda', total: 187, completed: 0, balance: 187 }
          ]
        },
        {
          name: 'Prakasam District',
          total: 8002,
          completed: 685,
          balance: 7317,
          ulbs: [
            { name: 'Ongole', total: 5456, completed: 0, balance: 5456 },
            { name: 'Markapur', total: 820, completed: 430, balance: 390 },
            { name: 'Giddalur', total: 209, completed: 32, balance: 177 },
            { name: 'Chimakurthy', total: 243, completed: 5, balance: 238 },
            { name: 'Podili', total: 234, completed: 56, balance: 178 },
            { name: 'Kanigiri', total: 722, completed: 162, balance: 560 },
            { name: 'Darsi', total: 318, completed: 0, balance: 318 }
          ]
        },
        {
          name: 'Sri Potti Sriramulu Nellore District',
          total: 7025,
          completed: 1934,
          balance: 5091,
          ulbs: [
            { name: 'Nellore', total: 6119, completed: 1678, balance: 4441 },
            { name: 'Kavali', total: 112, completed: 0, balance: 112 },
            { name: 'Allur', total: 255, completed: 81, balance: 174 },
            { name: 'Kandukur', total: 182, completed: 72, balance: 110 },
            { name: 'Buchireddypalem', total: 216, completed: 40, balance: 176 },
            { name: 'Atmakur (Nlr)', total: 141, completed: 63, balance: 78 }
          ]
        }
      ]
    },
    {
      name: 'Ananthapuramu Region',
      total: 53379,
      completed: 11767,
      balance: 41612,
      districts: [
        {
          name: 'Kurnool District',
          total: 6725,
          completed: 969,
          balance: 5756,
          ulbs: [
            { name: 'Kurnool', total: 4512, completed: 969, balance: 3543 },
            { name: 'Gudur(K)', total: 205, completed: 0, balance: 205 },
            { name: 'Adoni', total: 1410, completed: 0, balance: 1410 },
            { name: 'Yemmiganur', total: 598, completed: 0, balance: 598 }
          ]
        },
        {
          name: 'Nandyal District',
          total: 7261,
          completed: 2887,
          balance: 4374,
          ulbs: [
            { name: 'Nandyal', total: 3343, completed: 1725, balance: 1618 },
            { name: 'Allagadda', total: 734, completed: 350, balance: 384 },
            { name: 'Dhone', total: 742, completed: 31, balance: 711 },
            { name: 'Bethamcherla', total: 1150, completed: 641, balance: 509 },
            { name: 'Atmakur(K)', total: 590, completed: 0, balance: 590 },
            { name: 'Nandikotkur', total: 702, completed: 140, balance: 562 }
          ]
        },
        {
          name: 'Ananthapuramu District',
          total: 9589,
          completed: 445,
          balance: 9144,
          ulbs: [
            { name: 'Ananthapuramu', total: 4979, completed: 0, balance: 4979 },
            { name: 'Rayadurg', total: 817, completed: 0, balance: 817 },
            { name: 'Kalyanadurgam', total: 708, completed: 0, balance: 708 },
            { name: 'Tadipatri', total: 564, completed: 0, balance: 564 },
            { name: 'Guntakal', total: 1807, completed: 445, balance: 1362 },
            { name: 'Gooty', total: 714, completed: 0, balance: 714 }
          ]
        },
        {
          name: 'Sri Sathya Sai District',
          total: 5601,
          completed: 694,
          balance: 4907,
          ulbs: [
            { name: 'Dharmavaram', total: 2995, completed: 0, balance: 2995 },
            { name: 'Penukonda', total: 376, completed: 0, balance: 376 },
            { name: 'Hindupur', total: 812, completed: 0, balance: 812 },
            { name: 'Madakasira', total: 123, completed: 0, balance: 123 },
            { name: 'Kadiri', total: 969, completed: 410, balance: 559 },
            { name: 'Puttaparthy', total: 326, completed: 284, balance: 42 }
          ]
        },
        {
          name: 'Y.S.R District',
          total: 7674,
          completed: 1350,
          balance: 6324,
          ulbs: [
            { name: 'Kadapa', total: 3692, completed: 0, balance: 3692 },
            { name: 'Proddatur', total: 2473, completed: 860, balance: 1613 },
            { name: 'Pulivendula', total: 236, completed: 236, balance: 0 },
            { name: 'Jammalamadugu', total: 162, completed: 0, balance: 162 },
            { name: 'Budwel', total: 547, completed: 219, balance: 328 },
            { name: 'Mydukur', total: 154, completed: 35, balance: 119 },
            { name: 'Yerraguntla', total: 185, completed: 0, balance: 185 },
            { name: 'Kamalapuram', total: 225, completed: 0, balance: 225 }
          ]
        },
        {
          name: 'Annamayya District',
          total: 2836,
          completed: 1087,
          balance: 1749,
          ulbs: [
            { name: 'Madanapalle', total: 1668, completed: 367, balance: 1301 },
            { name: 'B.Kottakota', total: 360, completed: 360, balance: 0 },
            { name: 'Rajampet', total: 455, completed: 230, balance: 225 },
            { name: 'Rayachoti', total: 353, completed: 130, balance: 223 }
          ]
        },
        {
          name: 'Chittoor District',
          total: 4765,
          completed: 1116,
          balance: 3649,
          ulbs: [
            { name: 'Chittoor', total: 2902, completed: 168, balance: 2734 },
            { name: 'Punganur', total: 117, completed: 80, balance: 37 },
            { name: 'Palamaner', total: 687, completed: 671, balance: 16 },
            { name: 'Nagari', total: 509, completed: 62, balance: 447 },
            { name: 'Kuppam', total: 550, completed: 135, balance: 415 }
          ]
        },
        {
          name: 'Tirupati District',
          total: 8928,
          completed: 3219,
          balance: 5709,
          ulbs: [
            { name: 'Tirupathi', total: 4275, completed: 2283, balance: 1992 },
            { name: 'Srikalahasthi', total: 2050, completed: 140, balance: 1910 },
            { name: 'Venkatagiri', total: 864, completed: 339, balance: 525 },
            { name: 'Sullurpet', total: 303, completed: 70, balance: 233 },
            { name: 'Naidupeta', total: 306, completed: 306, balance: 0 },
            { name: 'Gudur (Tpt)', total: 631, completed: 0, balance: 631 },
            { name: 'Puttur', total: 499, completed: 81, balance: 418 }
          ]
        }
      ]
    }
  ];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExpandDistrict = (districtName: string) => {
    setExpandedDistrict(expandedDistrict === districtName ? null : districtName);
  };

  const getProgressColor = (completed: number, total: number) => {
    const percentage = (completed / total) * 100;
    if (percentage >= 75) return theme.palette.success.main;
    if (percentage >= 50) return theme.palette.warning.main;
    if (percentage >= 25) return theme.palette.info.main;
    return theme.palette.error.main;
  };

  const DistrictRow = ({ district }: { district: DistrictData }) => {
    const isExpanded = expandedDistrict === district.name;
    const progressColor = getProgressColor(district.completed, district.total);

    return (
      <>
        <TableRow 
          hover 
          sx={{ 
            '& > *': { borderBottom: 'unset' },
            cursor: 'pointer',
            backgroundColor: isExpanded ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
          }}
          onClick={() => handleExpandDistrict(district.name)}
        >
          <TableCell sx={{ width: { xs: 30, sm: 50 } }}>
            <IconButton size="small">
              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            <Typography variant="subtitle2">{district.name}</Typography>
          </TableCell>
          <TableCell align="right">{district.total.toLocaleString()}</TableCell>
          <TableCell align="right">
            <Chip
              label={`${district.completed.toLocaleString()} (${((district.completed/district.total)*100).toFixed(1)}%)`}
              size="small"
              sx={{
                backgroundColor: progressColor,
                color: 'white',
              }}
            />
          </TableCell>
          <TableCell align="right">{district.balance.toLocaleString()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 2 }}>
                <Typography variant="h6" gutterBottom component="div">
                  ULBs in {district.name}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ULB Name</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Completed</TableCell>
                      <TableCell align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {district.ulbs.map((ulb) => (
                      <TableRow key={ulb.name}>
                        <TableCell component="th" scope="row">
                          {ulb.name}
                        </TableCell>
                        <TableCell align="right">{ulb.total.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${ulb.completed.toLocaleString()} (${((ulb.completed/ulb.total)*100).toFixed(1)}%)`}
                            size="small"
                            sx={{
                              backgroundColor: getProgressColor(ulb.completed, ulb.total),
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">{ulb.balance.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  const handleDownload = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['MUNICIPAL ADMINISTRATION DEPARTMENT'],
      ['Stray Dogs to be Sterilized & Vaccinated in the ULBs'],
      [`(as on ${dates.asOn})`],
      [],
      ['Sl. No', 'Name of the ULB', 'No. of Stray Dogs to be Sterilized & Vaccinated in the ULB', 
       'No. of Stray Dogs Sterilized & Vaccinated from ' + dates.fromDate + ' to ' + dates.toDate, 'Balance'],
      ['(1)', '(2)', '(3)', '(4)', '(5)']
    ]);

    // Set column widths
    const colWidths = [{ wch: 8 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    ws['!cols'] = colWidths;

    let rowIndex = 7; // Starting from row 7 (1-based)
    let slNo = 1;

    regionsData.forEach(region => {
      region.districts.forEach(district => {
        // Add district header
        XLSX.utils.sheet_add_aoa(ws, [[
          '', district.name, '', '', ''
        ]], { origin: { r: rowIndex, c: 0 } });
        rowIndex++;

        // Add ULBs
        district.ulbs.forEach(ulb => {
          XLSX.utils.sheet_add_aoa(ws, [[
            slNo,
            ulb.name,
            ulb.total,
            ulb.completed,
            ulb.balance
          ]], { origin: { r: rowIndex, c: 0 } });
          
          // Style the cells
          for (let col = 0; col < 5; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
            if (!ws[cellRef]) ws[cellRef] = {};
            ws[cellRef].s = {
              font: { name: 'Arial', sz: 10 },
              alignment: { horizontal: col > 1 ? 'right' : 'left', vertical: 'center' },
              border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            };
          }
          
          rowIndex++;
          slNo++;
        });

        // Add district total
        XLSX.utils.sheet_add_aoa(ws, [[
          '', 'District Total', district.total, district.completed, district.balance
        ]], { origin: { r: rowIndex, c: 0 } });
        
        // Style district total row
        for (let col = 0; col < 5; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
          if (!ws[cellRef]) ws[cellRef] = {};
          ws[cellRef].s = {
            font: { name: 'Arial', sz: 10, bold: true },
            fill: { fgColor: { rgb: "EEEEEE" } },
            alignment: { horizontal: col > 1 ? 'right' : 'left', vertical: 'center' },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }
        rowIndex++;
      });

      // Add region total
      XLSX.utils.sheet_add_aoa(ws, [[
        '', `${region.name} Total`, region.total, region.completed, region.balance
      ]], { origin: { r: rowIndex, c: 0 } });
      
      // Style region total row
      for (let col = 0; col < 5; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = {
          font: { name: 'Arial', sz: 11, bold: true },
          fill: { fgColor: { rgb: "DDDDDD" } },
          alignment: { horizontal: col > 1 ? 'right' : 'left', vertical: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
      rowIndex++;
    });

    // Add grand total
    XLSX.utils.sheet_add_aoa(ws, [[
      '', 'Grand Total', 204121, 34717, 169404
    ]], { origin: { r: rowIndex, c: 0 } });
    
    // Style grand total row
    for (let col = 0; col < 5; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
      if (!ws[cellRef]) ws[cellRef] = {};
      ws[cellRef].s = {
        font: { name: 'Arial', sz: 12, bold: true },
        fill: { fgColor: { rgb: "4CAF50" } },
        alignment: { horizontal: col > 1 ? 'right' : 'left', vertical: 'center' },
        border: {
          top: { style: 'double' },
          bottom: { style: 'double' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
    }

    // Style header rows
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 5; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = {
          font: { name: 'Arial', sz: row < 3 ? 14 : 12, bold: true },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: row > 3 ? {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          } : {}
        };
      }
    }

    // Merge cells for title rows
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Statistics');
    XLSX.writeFile(wb, `Stray_Dogs_Statistics_${dates.asOn.replace(/\./g, '_')}.xlsx`);
  };

  // Export Menu Handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setAnchorEl(null);
  };

  // PDF Export Function
  const handlePDFExport = async () => {
    if (!tableRef.current) return;

    try {
      // Prepare full dataset for export
      const fullDataset: any[] = [];
      
      regionsData.forEach(region => {
        region.districts.forEach(district => {
          district.ulbs.forEach(ulb => {
            fullDataset.push({
              'Region': region.name,
              'District': district.name,
              'ULB Name': ulb.name,
              'Total Dogs': ulb.total,
              'Completed Dogs': ulb.completed,
              'Balance Dogs': ulb.balance,
              'Completion Rate': `${((ulb.completed/ulb.total)*100).toFixed(1)}%`
            });
          });
        });
      });

      // Export full dataset
      await exportToPDF(
        tableRef.current, 
        'Stray_Dogs_Statistics', 
        { 
          fullDataExport: true,
          includeImages: false  // No images in statistics
        }, 
        fullDataset
      );
    } catch (err) {
      console.error('PDF Export Error:', err);
    }

    // Close export menu
    setAnchorEl(null);
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      mt: { xs: 4, sm: 0 }  // mt: 4 for mobile, mt: 8 for tablet and above
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: 2,
        mb: 3 
      }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Dog Sterilization Statistics by Region
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            As on {dates.asOn}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Data from {dates.fromDate} to {dates.toDate}
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <TextField
            size="small"
            placeholder="Search districts or ULBs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: { xs: 1, sm: 'none' },
              minWidth: { sm: '250px' }
            }}
          />
          <IconButton color="primary" onClick={handleExportMenuOpen}>
            <PrintIcon />
          </IconButton>
        </Box>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: { xs: 'calc(100vh - 250px)', sm: 'calc(100vh - 200px)' },
          width: '100%',
          overflow: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 600, sm: 750 }  // Minimum width to prevent squishing
          },
          '& .MuiTableCell-root': {
            px: { xs: 1, sm: 2 },  // Adjust padding for cells
            py: { xs: 1, sm: 1.5 },
            whiteSpace: 'nowrap'  // Prevent text wrapping
          }
        }}
      >
        <Table stickyHeader ref={tableRef}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: { xs: 30, sm: 50 } }} />
              <TableCell>District</TableCell>
              <TableCell align="right">Total Dogs</TableCell>
              <TableCell align="right">Sterilized</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {regionsData.map((region) => (
              <React.Fragment key={region.name}>
                <TableRow sx={{ 
                  backgroundColor: theme.palette.grey[100],
                  '& .MuiTableCell-root': {
                    py: { xs: 1, sm: 1.5 }
                  }
                }}>
                  <TableCell colSpan={5}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      {region.name}
                    </Typography>
                  </TableCell>
                </TableRow>
                {region.districts.map((district) => (
                  <DistrictRow key={district.name} district={district} />
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Statistics; 