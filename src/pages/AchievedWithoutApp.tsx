import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  Button,
  TablePagination,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';


interface AchievedWithoutAppDetail {
  id: number;
  municipality: string;
  currentAchieved: number;
  achievedCount: number | null;
}

const AchievedWithoutApp: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [details, setDetails] = useState<AchievedWithoutAppDetail[]>([
    { id: 1, municipality: 'Chittoor', currentAchieved: 1015, achievedCount: null },
    { id: 2, municipality: 'Nagari', currentAchieved: 0, achievedCount: null },
    { id: 3, municipality: 'Puttur', currentAchieved: 868, achievedCount: null },
    { id: 4, municipality: 'Srikalahasti', currentAchieved: 293, achievedCount: null },
    { id: 5, municipality: 'Tirupati', currentAchieved: 6190, achievedCount: null },
  ]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handler for updating achieved count
  const handleAchievedCountChange = (id: number, newCount: string) => {
    setDetails(details.map(detail => 
      detail.id === id 
        ? { ...detail, achievedCount: newCount === '' ? null : parseInt(newCount, 10) } 
        : detail
    ));
  };

  // Handler for submit
  const handleSubmit = (id: number) => {
    const detail = details.find(d => d.id === id);
    
    if (detail && detail.achievedCount !== null) {
      // Here you would typically send the data to a backend
      console.log(`Submitting ${detail.achievedCount} for ${detail.municipality}`);
      
      setSnackbarMessage(`Successfully submitted ${detail.achievedCount} for ${detail.municipality}`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } else {
      setSnackbarMessage('Please enter a valid count');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  // Calculate total current achieved count
  const totalCurrentAchieved = details.reduce((sum, detail) => 
    sum + detail.currentAchieved, 0);

  // Calculate total new achieved count
  const totalNewAchieved = details.reduce((sum, detail) => 
    sum + (detail.achievedCount || 0), 0);

  // Close Snackbar handler
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      mt: { xs: 4, sm: 0 }  // mt: 4 for mobile, mt: 8 for tablet and above
    }}>
      <Typography 
        variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        Achieved Without App
      </Typography>

      <Paper 
        elevation={3} 
        sx={{ 
          width: '100%', 
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Municipality</TableCell>
                <TableCell align="right">Achieved</TableCell>
                <TableCell align="right">Enter Count</TableCell>
                <TableCell align="right">Submit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? details.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : details
              ).map((detail) => (
                <TableRow key={detail.id} hover>
                  <TableCell>{detail.id}</TableCell>
                  <TableCell>{detail.municipality}</TableCell>
                  <TableCell align="right">
                    {detail.currentAchieved.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      variant="outlined"
                      size="small"
                      placeholder="Enter count"
                      value={detail.achievedCount ?? ''}
                      onChange={(e) => {
                        handleAchievedCountChange(detail.id, e.target.value);
                      }}
                      inputProps={{ 
                        min: 0,
                        style: { textAlign: 'right' }
                      }}
                      sx={{ 
                        width: 120,
                        '& .MuiOutlinedInput-input': {
                          color: detail.achievedCount === null ? 'text.secondary' : 'inherit'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      disabled={detail.achievedCount === null}
                      onClick={() => handleSubmit(detail.id)}
                    >
                      Submit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '1rem' 
                  }}
                >
                  {totalCurrentAchieved.toLocaleString()}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '1rem' 
                  }}
                >
                  {totalNewAchieved.toLocaleString()}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={details.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AchievedWithoutApp; 