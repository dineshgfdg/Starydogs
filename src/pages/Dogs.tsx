import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Button,
  Menu,
  MenuItem as MuiMenuItem,
  Tabs,
  Tab,
  DialogTitle
} from '@mui/material';
import { 
  PictureAsPdf as PdfIcon, 
  TableChart as ExcelIcon, 
  Print as PrintIcon,
  Map as MapIcon,
  List as ListIcon
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { exportToPDF } from '../utils/pdfExport';

// Type for ULB mapping
type ULBMapping = {
  [key: string]: string[];
};

// Districts and ULBs mapping
const DISTRICTS = [
  'Anantapur District',
  'Annamayya District',
  'Bapatla District',
  'Chittoor District',
  'East Godavari District',
  'Eluru District',
  'Guntur District',
  'Kadapa District',
  'Kakinada District',
  'Konaseema District',
  'Krishna District',
  'Kurnool District',
  'Nandyal District',
  'Nellore District',
  'NTR District',
  'Srikakulam District',
  'Vizianagaram District',
  'Parvathipuram Manyam District',
  'Visakhapatnam District',
  'Anakapalli District',
  'West Godavari District',
  'Palnadu District',
  'Prakasam District',
  'Sri Sathya Sai District',
  'Tirupati District'
];

const ULB_BY_DISTRICT: ULBMapping = {
  'Anantapur District': [
    'Ananthapuramu', 'Guntakal', 'Tadipatri', 'Rayadurg', 'Gooty', 'Kalyanadurgam',
  ] as string[],
  'Annamayya District': [
    'Madanapalle', 'Rayachoti', 'Rajampet', 'B.Kothakota',
  ] as string[],
  'Bapatla District': [
    'Bapatla', 'Chirala', 'Addanki', 'Repalle',
  ] as string[],
  'Chittoor District': [
    'Chittoor', 'Punganur', 'Palamaner', 'Nagari', 'Kuppam',
  ] as string[],
  'East Godavari District': [
    'Rajamahendravaram', 'Nidadavole', 'Kovvur',
  ] as string[],
  'Eluru District': [
    'Eluru', 'Jangareddygudem', 'Nuzvid', 'Chintalapudi',
  ] as string[],
  'Guntur District': [
    'Guntur', 'Mangalagiri-Tadepalli', 'Tenali', 'Ponnur',
  ] as string[],
  'Kadapa District': [
    'Kadapa', 'Proddatur', 'Pulivendula', 'Badvel', 'Mydukur', 
    'Jammalamadugu', 'Yerraguntla', 'Kamalapuram',
  ] as string[],
  'Kakinada District': [
    'Kakinada', 'Samalkota', 'Peddapuram', 'Pithapuram', 'Tuni', 
    'Gollaprolu', 'Yeleswaram',
  ] as string[],
  'Konaseema District': [
    'Amalapuram', 'Ramachandrapuram', 'Mandapeta', 'Mummidivaram',
  ] as string[],
  'Krishna District': [
    'Machilipatnam', 'Gudivada', 'YSR Tadigadapa', 'Pedana', 'Vuyyuru',
  ] as string[],
  'Kurnool District': [
    'Kurnool', 'Adoni', 'Yemmiganur', 'Gudur',
  ] as string[],
  'Nandyal District': [
    'Nandyal', 'Dhone', 'Nandikotkur', 'Allagadda', 'Atmakur', 'Bethamcherla',
  ] as string[],
  'Nellore District': [
    'Nellore', 'Kavali', 'Kandukur', 'Atmakur', 'Allur', 'Buchireddypalem',
  ] as string[],
  'NTR District': [
    'Vijayawada', 'Jaggaiahpeta', 'Nandigama', 'Kondapalli', 'Tiruvuru',
  ] as string[],
  'Srikakulam District': [
    'Srikakulam', 'Amudalavalasa', 'Ichapuram', 'Palasa',
  ] as string[],
  'Vizianagaram District': [
    'Vizianagaram', 'Bobbili', 'Rajam', 'Nellimarla',
  ] as string[],
  'Parvathipuram Manyam District': [
    'Palakonda', 'Parvathipuram', 'Salur',
  ] as string[],
  'Visakhapatnam District': [
    'GVMC',
  ] as string[],
  'Anakapalli District': [
    'Yelamanchili', 'Narsipatnam',
  ] as string[],
  'West Godavari District': [
    'Bhimavaram', 'Tadepalligudem', 'Palakol', 'Narasapuram', 'Tanuku', 'Akiveedu',
  ] as string[],
  'Palnadu District': [
    'Gurazala', 'Dachepalli', 'Piduguralla', 'Macherla', 'Sattenapalle', 
    'Chilakaluripet', 'Narasaraopet', 'Vinukonda',
  ] as string[],
  'Prakasam District': [
    'Ongole', 'Markapur', 'Giddalur', 'Chimakurthy', 'Podili', 'Kanigiri', 'Darsi',
  ] as string[],
  'Sri Sathya Sai District': [
    'Dharmavaram', 'Penukonda', 'Hindupur', 'Madakasira', 'Kadiri', 'Puttaparthy',
  ] as string[],
  'Tirupati District': [
    'Tirupathi', 'Srikalahasthi', 'Venkatagiri', 'Sullurpet', 
    'Naidupeta', 'Gudur', 'Puttur',
  ] as string[],
};

// Updated interface to match the API response
interface Dog {
  id: number;
  district: string;
  ulb: string;
  ward_no: string;
  gender: string;
  date_of_caught: string;
  latitude: string;
  longitude: string;
  before_surgery_image: string;
  surgery_date: string | null;
  after_surgery_image: string;
  relocation_date: string | null;
  relocation_image: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DogsResponse {
  status: number;
  message: string;
  dogs: Dog[];
}

const Dogs: React.FC = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [filteredDogs, setFilteredDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Export menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(anchorEl);

  // Ref for table export
  const tableRef = useRef<HTMLTableElement>(null);
  
  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedULB, setSelectedULB] = useState<string>('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await axios.get<DogsResponse>('https://dog-stray-backend-x7ik.onrender.com/api/getAllDogs');
        
        // Sort dogs by ID in ascending order
        const sortedDogs = response.data.dogs.sort((a, b) => a.id - b.id);
        
        setDogs(sortedDogs);
        setFilteredDogs(sortedDogs);
        setLoading(false);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 
                             err.message || 
                             'An unknown error occurred';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchDogs();
  }, []);

  // Filter effect
  useEffect(() => {
    let result = dogs;
    
    if (selectedDistrict) {
      result = result.filter(dog => dog.district === selectedDistrict);
    }
    
    if (selectedULB) {
      result = result.filter(dog => dog.ulb === selectedULB);
    }
    
    // Sort by ID in ascending order
    result.sort((a, b) => a.id - b.id);
    
    setFilteredDogs(result);
    setPage(0);
  }, [selectedDistrict, selectedULB, dogs]);

  // District change handler
  const handleDistrictChange = (event: SelectChangeEvent) => {
    const district = event.target.value as string;
    setSelectedDistrict(district);
    setSelectedULB(''); // Reset ULB when district changes
  };

  // ULB change handler
  const handleULBChange = (event: SelectChangeEvent) => {
    setSelectedULB(event.target.value as string);
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleCloseDialog = () => {
    setSelectedImage(null);
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Image Thumbnail Component
  const ImageThumbnail = ({ src, alt }: { src: string, alt: string }) => (
    <Tooltip title={alt}>
      <img 
        src={src} 
        alt={alt}
        onClick={() => handleImageClick(src)}
        style={{ 
          width: 80, 
          height: 80, 
          objectFit: 'cover', 
          cursor: 'pointer',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }} 
      />
    </Tooltip>
  );

  // PDF Export Function
  const handlePDFExport = async () => {
    if (!tableRef.current) return;

    try {
      // Export full dataset
      await exportToPDF(
        tableRef.current, 
        'Stray_Dogs_Report', 
        { 
          fullDataExport: true,
          includeImages: true
        }, 
        filteredDogs.map(dog => ({
          'Dog ID': dog.id,
          'Caught Date': new Date(dog.date_of_caught).toLocaleDateString(),
          'Ward No': dog.ward_no,
          'Gender': dog.gender,
          'ULB': dog.ulb,
          'District': dog.district,
          'Surgery Date': dog.surgery_date ? new Date(dog.surgery_date).toLocaleDateString() : 'N/A',
          'Relocation Date': dog.relocation_date ? new Date(dog.relocation_date).toLocaleDateString() : 'N/A',
          'Status': dog.status,
          'Before Surgery Image': dog.before_surgery_image,
          'After Surgery Image': dog.after_surgery_image,
          'Relocation Image': dog.relocation_image
        }))
      );
    } catch (err) {
      console.error('PDF Export Error:', err);
    }

    // Close export menu
    setAnchorEl(null);
  };

  // Excel Export Function
  const handleExcelExport = () => {
    // Sort filtered dogs by ID before exporting
    const sortedExportData = [...filteredDogs].sort((a, b) => a.id - b.id);

    // Transform dogs data for Excel export
    const exportData = sortedExportData.map(dog => ({
      'Dog ID': dog.id,
      'Caught Date': new Date(dog.date_of_caught).toLocaleDateString(),
      'Ward No': dog.ward_no,
      'Gender': dog.gender,
      'ULB': dog.ulb,
      'District': dog.district,
      'Surgery Date': dog.surgery_date ? new Date(dog.surgery_date).toLocaleDateString() : 'N/A',
      'Relocation Date': dog.relocation_date ? new Date(dog.relocation_date).toLocaleDateString() : 'N/A'
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stray Dogs');

    // Export to Excel
    XLSX.writeFile(workbook, 'Stray_Dogs_Report.xlsx');

    // Close export menu
    setAnchorEl(null);
  };

  // Print Function
  const handlePrint = () => {
    // Sort filtered dogs by ID before printing
    const sortedFilteredDogs = [...filteredDogs].sort((a, b) => a.id - b.id);

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print the document');
      return;
    }

    // Prepare full HTML for printing
    const printContent = `
      <html>
        <head>
          <title>Animal Birth Control ABC & Anti-Babies Vaccination Program of Stray Dogs</title>
          <style>
            @page { 
              size: landscape; 
              margin: 10mm; 
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 10px;
              zoom: 0.85; 
              transform: scale(0.85);
              transform-origin: top left;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              font-size: 9px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 5px; 
              text-align: left;
              word-break: break-word;
              vertical-align: top;
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            img { 
              max-width: 150px; 
              max-height: 150px; 
              object-fit: contain;
              margin: 2px;
            }
            h1 {
              font-size: 16px;
              margin-bottom: 10px;
            }
            p {
              font-size: 12px;
              margin-bottom: 10px;
            }
            @media print {
              body {
                zoom: 0.85;
                transform: scale(0.85);
                transform-origin: top left;
              }
            }
          </style>
        </head>
        <body>
          <h1>Animal Birth Control ABC & Anti-Babies Vaccination Program of Stray Dogs</h1>
          <p>Total Dogs: ${sortedFilteredDogs.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date Of Catching</th>
                <th>Ward No</th>
                <th>Gender</th>
                <th>Name of ULB</th>
                <th>Name of District</th>
                <th>Surgery Date</th>
                <th>Before Surgery Image</th>
                <th>After Surgery Image</th>
                <th>Date of Relocation</th>
                <th>Relocation Image</th>
              </tr>
            </thead>
            <tbody>
              ${sortedFilteredDogs.map(dog => `
                <tr>
                  <td>${dog.id}</td>
                  <td>${new Date(dog.date_of_caught).toLocaleDateString()}</td>
                  <td>${dog.ward_no}</td>
                  <td>${dog.gender}</td>
                  <td>${dog.ulb}</td>
                  <td>${dog.district}</td>
                  <td>${dog.surgery_date ? new Date(dog.surgery_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    ${dog.before_surgery_image 
                      ? `<img src="${dog.before_surgery_image}" alt="Before Surgery Image">` 
                      : 'No Image'}
                  </td>
                  <td>
                    ${dog.after_surgery_image 
                      ? `<img src="${dog.after_surgery_image}" alt="After Surgery Image">` 
                      : 'No Image'}
                  </td>
                  <td>${dog.relocation_date ? new Date(dog.relocation_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    ${dog.relocation_image 
                      ? `<img src="${dog.relocation_image}" alt="Relocation Image">` 
                      : 'No Image'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(printContent);
    
    // Close the document writing and trigger print
    printWindow.document.close();
    
    // Slight delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      // Close the print window after printing
      printWindow.close();
    }, 500);

    // Close export menu
    setAnchorEl(null);
  };

  // Export Menu Handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setAnchorEl(null);
  };

  // MapView Link Component
  const MapViewLink = ({ latitude, longitude }: { latitude: string, longitude: string }) => {
    // Check if coordinates are valid
    const isValidCoordinates = latitude && longitude && 
      !isNaN(parseFloat(latitude)) && 
      !isNaN(parseFloat(longitude));

    if (!isValidCoordinates) {
      return <Typography variant="body2" color="textSecondary">No Location</Typography>;
    }

    // MapMyIndia direct link
    const mapLink = `https://maps.mapmyindia.com/@${latitude},${longitude},17z`;

    return (
      <Tooltip title="View on Map">
        <Button 
          variant="outlined" 
          color="primary" 
          size="small"
          href={mapLink} 
          target="_blank" 
          rel="noopener noreferrer"
          startIcon={<MapIcon />}
          sx={{ 
            fontSize: '0.7rem', 
            padding: '2px 8px' 
          }}
        >
          View Map
        </Button>
      </Tooltip>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      mt: { xs: 4, sm: 0 }  // mt: 4 for mobile, mt: 8 for tablet and above
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Animal Birth Control (ABC) & Anti-Babies Vaccination Program (ARV)of Stray Dogs 
        </Typography>
        
        {/* Export Button */}
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleExportMenuOpen}
          startIcon={<PrintIcon />}
        >
          Export
        </Button>

        {/* Export Menu */}
        <Menu
          anchorEl={anchorEl}
          open={exportMenuOpen}
          onClose={handleExportMenuClose}
        >
          <MuiMenuItem onClick={handlePDFExport}>
            <PdfIcon sx={{ mr: 1 }} /> Export to PDF
          </MuiMenuItem>
          <MuiMenuItem onClick={handleExcelExport}>
            <ExcelIcon sx={{ mr: 1 }} /> Export to Excel
          </MuiMenuItem>
          <MuiMenuItem onClick={handlePrint}>
            <PrintIcon sx={{ mr: 1 }} /> Print
          </MuiMenuItem>
        </Menu>
      </Box>
      
      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Select District</InputLabel>
            <Select
              value={selectedDistrict}
              label="Select District"
              onChange={handleDistrictChange}
            >
              <MenuItem value="">All Districts</MenuItem>
              {DISTRICTS.map((district) => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Select ULB</InputLabel>
            <Select
              value={selectedULB}
              label="Select ULB"
              onChange={handleULBChange}
              disabled={!selectedDistrict}
            >
              <MenuItem value="">All ULBs</MenuItem>
              {selectedDistrict && (ULB_BY_DISTRICT[selectedDistrict] || []).map((ulb: string) => (
                <MenuItem key={ulb} value={ulb}>
                  {ulb}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Table View */}
      <TableContainer component={Paper}>
        <Table 
          ref={tableRef} 
          sx={{ minWidth: 1200 }} 
          aria-label="dogs table"
        >
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date Of Catching</TableCell>
              <TableCell>Ward No</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Name of ULB</TableCell>
              <TableCell>Name of District</TableCell>
              <TableCell>Surgery Date</TableCell>
              <TableCell>Before Surgery Image</TableCell>
              <TableCell>After Surgery Image</TableCell>
              <TableCell>Date of Relocation</TableCell>
              <TableCell>Relocation Image</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredDogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : filteredDogs
            ).map((dog) => (
              <TableRow key={dog.id}>
                <TableCell>{dog.id}</TableCell>
                <TableCell>
                  {new Date(dog.date_of_caught).toLocaleDateString()}
                </TableCell>
                <TableCell>{dog.ward_no}</TableCell>
                <TableCell>{dog.gender}</TableCell>
                <TableCell>{dog.ulb}</TableCell>
                <TableCell>{dog.district}</TableCell>
                <TableCell>
                  {dog.surgery_date 
                    ? new Date(dog.surgery_date).toLocaleDateString() 
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {dog.before_surgery_image ? (
                    <ImageThumbnail 
                      src={dog.before_surgery_image} 
                      alt="Before Surgery Image" 
                    />
                  ) : (
                    'No Image'
                  )}
                </TableCell>
                <TableCell>
                  {dog.after_surgery_image ? (
                    <ImageThumbnail 
                      src={dog.after_surgery_image} 
                      alt="After Surgery Image" 
                    />
                  ) : (
                    'No Image'
                  )}
                </TableCell>
                <TableCell>
                  {dog.relocation_date 
                    ? new Date(dog.relocation_date).toLocaleDateString() 
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {dog.relocation_image ? (
                    <ImageThumbnail 
                      src={dog.relocation_image} 
                      alt="Relocation Image" 
                    />
                  ) : (
                    'No Image'
                  )}
                </TableCell>
                <TableCell>
                  <MapViewLink 
                    latitude={dog.latitude} 
                    longitude={dog.longitude} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredDogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Image Dialog */}
      <Dialog open={!!selectedImage} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogContent>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Full Size" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                objectFit: 'contain', 
                maxHeight: '80vh' 
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dogs; 