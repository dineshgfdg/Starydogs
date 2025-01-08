import React, { useState, useEffect } from 'react';
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
  TablePagination,
  Chip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

interface Dog {
  id: number;
  district: string;
  ulb: string;
  ward_no: string;
  gender: string;
  surgery_date: string | null;
  relocation_image: string;
}

interface TargetDetail {
  id: number;
  municipality: string;
  achievedWithoutApp: number | null;
  achievedWithApp: number;
  male: number;
  female: number;
  total: number;
  balance: number;
}

const Targets: React.FC = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetDetails, setTargetDetails] = useState<TargetDetail[]>([]);

  // Fetch dogs data and process it
  useEffect(() => {
    const fetchDogsData = async () => {
      try {
        const response = await axios.get<{ dogs: Dog[] }>('https://dog-stray-backend-x7ik.onrender.com/api/getAllDogs');
        
        // Group dogs by municipality
        const municipalityData = response.data.dogs.reduce((acc, dog) => {
          const municipality = dog.ulb;
          
          // Initialize municipality if not exists
          if (!acc[municipality]) {
            acc[municipality] = {
              withoutApp: 0,
              withApp: 0,
              male: 0,
              female: 0
            };
          }
          
          // Count total dogs for the municipality
          acc[municipality].withApp++;
          
          // Count dogs with relocation image separately
          if (dog.surgery_date !== null && dog.relocation_image) {
            acc[municipality].withoutApp++;
          }
          
          // Count gender
          if (dog.gender === 'Male') {
            acc[municipality].male++;
          } else if (dog.gender === 'Female') {
            acc[municipality].female++;
          }
          
          return acc;
        }, {} as Record<string, { withoutApp: number; withApp: number; male: number; female: number }>);

        // Convert to TargetDetail array
        const processedTargetDetails = Object.entries(municipalityData).map(([municipality, data], index) => ({
          id: index + 1,
          municipality,
          achievedWithoutApp: null, // Keep this empty
          achievedWithApp: data.withApp, // Total number of dogs
          male: data.male,
          female: data.female,
          total: data.withApp,
          balance: data.withoutApp - data.withApp // Negative if fewer dogs with relocation image
        })).sort((a, b) => b.total - a.total);

        setTargetDetails(processedTargetDetails);
        setLoading(false);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 
                             err.message || 
                             'An unknown error occurred';
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchDogsData();
  }, []);

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Helper function to get progress color
  const getProgressColor = (completed: number, total: number) => {
    const progress = (completed / total) * 100;
    if (progress < 25) return theme.palette.error.main;
    if (progress < 50) return theme.palette.warning.main;
    if (progress < 75) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Loading state
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      mt: { xs: 4, sm: 0 }  // mt: 4 for mobile, mt: 8 for tablet and above
    }}>
      <Typography 
        variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        Target Details
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
                <TableCell align="right">Achieved Without App</TableCell>
                <TableCell align="right">Achieved With App</TableCell>
                <TableCell align="right">Male</TableCell>
                <TableCell align="right">Female</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell align="right">Progress</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? targetDetails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : targetDetails
              ).map((detail) => (
                <TableRow key={detail.id} hover>
                  <TableCell>{detail.id}</TableCell>
                  <TableCell>{detail.municipality}</TableCell>
                  <TableCell align="right">
                    {detail.achievedWithoutApp ?? ''}
                  </TableCell>
                  <TableCell align="right">{detail.achievedWithApp.toLocaleString()}</TableCell>
                  <TableCell align="right">{detail.male.toLocaleString()}</TableCell>
                  <TableCell align="right">{detail.female.toLocaleString()}</TableCell>
                  <TableCell align="right">{detail.total.toLocaleString()}</TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      color: detail.balance < 0 ? 'error.main' : 'text.primary',
                      fontWeight: 'bold'
                    }}
                  >
                    {detail.balance.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={`${((detail.total > 0 ? (detail.total - Math.abs(detail.balance)) / detail.total * 100 : 0)).toFixed(1)}%`}
                      size="small"
                      sx={{
                        backgroundColor: getProgressColor(
                          detail.total - Math.abs(detail.balance), 
                          detail.total
                        ),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {'-'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {targetDetails.reduce((sum, detail) => sum + detail.achievedWithApp, 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {targetDetails.reduce((sum, detail) => sum + detail.male, 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {targetDetails.reduce((sum, detail) => sum + detail.female, 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {targetDetails.reduce((sum, detail) => sum + detail.total, 0).toLocaleString()}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: targetDetails.reduce((sum, detail) => sum + detail.balance, 0) < 0 ? 'error.main' : 'text.primary'
                  }}
                >
                  {targetDetails.reduce((sum, detail) => sum + detail.balance, 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  <Chip 
                    label={`${(
                      targetDetails.reduce((sum, detail) => sum + (detail.total - Math.abs(detail.balance)), 0) / 
                      targetDetails.reduce((sum, detail) => sum + detail.total, 0) * 100
                    ).toFixed(1)}%`}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.success.main,
                      color: 'white'
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={targetDetails.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Targets; 