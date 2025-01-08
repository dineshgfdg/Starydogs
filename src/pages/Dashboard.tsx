import React, { useState, useRef, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  Button,
  MenuItem as MuiMenuItem,
  CircularProgress,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Stack,
  tableCellClasses,
  styled,
  Fade,
} from '@mui/material';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  Scatter,
} from 'recharts';
import {
  Pets as PetsIcon,
  Healing as HealingIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { exportToPDF } from '../utils/pdfExport';
import * as XLSX from 'xlsx';
import Carousel from 'react-material-ui-carousel';

interface Dog {
  id: number;
  district: string;
  ulb: string;
  ward_no: string;
  gender: string;
  date_of_caught: string;
  surgery_date: string | null;
  relocation_image:string;
  after_surgery_image:string;
  relocation_date: string | null;
  status: string;
}

interface DogsResponse {
  status: number;
  message: string;
  dogs: Dog[];
}

interface RegionData {
  name: string;
  total: number;
  completed: number;
  remaining: number;
  completionRate: string;
}

interface TopDistrict {
  name: string;
  total: number;
  completed: number;
  released: number;
  maleCount: number;
  femaleCount: number;
  pendingCount: number;
  progressPercentage: number;
}

// Add new interface for target details
interface TargetDetail {
  id: number;
  municipality: string;
  achievedWithoutApp: number;
  achievedWithApp: number;
  male: number;
  female: number;
  total: number;
  balance: number;
}

// AmCharts-style Color Palette
const DASHBOARD_COLORS = {
  gates: '#55D8C1',      // Turquoise for Dogs Registered
  attendance: '#8B5CF6', // Purple for Sterilization
  transport: '#818CF8',  // Light Purple for Complaints
  background: '#F8FAFC', // Light Background
  cardBg: '#FFFFFF',     // White
  progressBar: '#E2E8F0', // Light Gray
  text: '#2C3E50',       // Dark text
  chartColors: [
    '#55D8C1',  // Turquoise
    '#8B5CF6',  // Purple
    '#818CF8',  // Light Purple
    '#F59E0B',  // Yellow
    '#10B981',  // Green
  ]
};

// Add interfaces
interface DashboardMetrics {
  totalULBs: number;
  totalStrayDogs: number;
  sterilizedDogs: number;
  pendingDogs: number;
  releasedDogs: number;
}

interface TimelineData {
  date: string;
  registered: number;
  sterilized: number;
  released: number;
}

// Add new interfaces for pie chart data
interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// Styled components for government-style table
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

// Add styled component for date input
const StyledDateInput = styled('input')(({ theme }) => ({
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.23)',
  fontSize: '14px',
  fontFamily: theme.typography.fontFamily,
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
  },
}));

// Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  total, 
  subtitle,
  color 
}: { 
  title: string;
  value: string | number;
  total: string | number;
  subtitle: string;
  color: string;
}) => (
  <Box
    sx={{
      backgroundColor: DASHBOARD_COLORS.cardBg,
      borderRadius: 2,
      p: 3,
      height: '100%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontSize: '1rem',
        color: DASHBOARD_COLORS.text,
        mb: 1
      }}
    >
      {title}
    </Typography>
    <Typography
      variant="h4"
      sx={{
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: color,
        mb: 1
      }}
    >
      {value}/{total}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontSize: '0.8rem',
        color: 'text.secondary',
        mb: 2
      }}
    >
      {subtitle}
    </Typography>
    <Box
      sx={{
        width: '100%',
        height: 8,
        backgroundColor: DASHBOARD_COLORS.progressBar,
        borderRadius: 4,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          width: `${(Number(value) / Number(total)) * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 4
        }}
      />
    </Box>
    <Typography
      variant="body2"
      sx={{
        fontSize: '0.8rem',
        color: color,
        textAlign: 'right',
        mt: 1
      }}
    >
      {((Number(value) / Number(total)) * 100).toFixed(0)}%
    </Typography>
  </Box>
);

// Update the CustomLegendProps interface
interface CustomLegendProps {
  value: string;
  entry: {
    payload?: any;
  };
}

const CustomLegend = ({ value, entry }: CustomLegendProps) => {
  if (!entry?.payload) return null;
  
  const { name, value: count, percentage, color } = entry.payload;
  return (
    <span style={{ color }}>
      {name}: {count.toLocaleString()} ({percentage})
    </span>
  );
};

// Add the custom label renderer
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill={DASHBOARD_COLORS.text}
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ fontSize: '12px' }}
    >
      {value.toLocaleString()}
    </text>
  );
};

// Update the PieChartComponent
const PieChartComponent = ({ data, title }: { data: Array<{ name: string; value: number; color: string; percentage: string }>; title: string }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <Paper 
      sx={{ 
        p: 2,
        pb: 2,
        height: 700,
        backgroundColor: DASHBOARD_COLORS.cardBg,
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: '0.9rem',
          color: DASHBOARD_COLORS.text,
          mb: 1,
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>
      <Box sx={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={0}
              fill="#8884d8"
              dataKey="value"
              labelLine={true}
              label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                  style={{ transition: 'all 0.3s ease' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      {/* Status Distribution */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 4,
        mt: 'auto',
        pt: 2,
        borderTop: '1px solid rgba(0,0,0,0.1)'
      }}>
        {data.map((status) => (
          <Box 
            key={status.name}
            sx={{ 
              textAlign: 'center',
              minWidth: 120
            }}
          >
            <Typography 
              sx={{ 
                color: status.color,
                fontWeight: 'bold',
                fontSize: '0.85rem',
                mb: 0.5
              }}
            >
              {status.name}
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
              {status.value.toLocaleString()}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              {status.percentage}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

// Update the CustomTooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      color: string;
      percentage: string;
    };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          bgcolor: 'background.paper', 
          p: 1.5,
          border: '1px solid #ccc',
          minWidth: 150
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: data.payload.color,
            fontWeight: 'bold',
            mb: 0.5
          }}
        >
          {data.payload.name}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Count: {data.value.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Percentage: {data.payload.percentage}
        </Typography>
      </Paper>
    );
  }
  return null;
};

// Update the color palette for districts
const DISTRICT_COLORS = [
  '#FF6B6B',  // Coral Red
  '#4ECDC4',  // Turquoise
  '#45B7D1',  // Sky Blue
  '#96CEB4',  // Sage Green
  '#FFD93D',  // Bright Yellow
  '#6C5CE7',  // Purple
  '#FF8C42',  // Orange
  '#A8E6CF',  // Mint Green
  '#FF9999',  // Pink
  '#3D84A8',  // Steel Blue
  '#F7D794',  // Sand
  '#786FA6',  // Dusty Purple
  '#F8A5C2',  // Rose
  '#63CDDA',  // Light Blue
  '#FF6B8B',  // Salmon
  '#7ED6DF',  // Aqua
  '#E056FD',  // Magenta
  '#686DE0',  // Royal Blue
  '#95AFC0',  // Cool Gray
  '#F9CA24',  // Golden Yellow
  '#22A6B3',  // Teal
  '#FEA47F',  // Peach
  '#B33771',  // Berry
  '#30336B',  // Navy Blue
  '#6AB04C'   // Grass Green
];

// Update the DistrictProgressChart component
const DistrictProgressChart = ({ data }: { data: TopDistrict[] }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<'top' | 'bottom'>('top');

  // Sort districts by total count
  const sortedData = [...data].sort((a, b) => b.total - a.total);
  
  // Split data into two halves
  const topHalf = sortedData.slice(0, Math.ceil(sortedData.length / 2));
  const bottomHalf = sortedData.slice(Math.ceil(sortedData.length / 2));

  const currentData = selectedRange === 'top' ? topHalf : bottomHalf;

  return (
    <Paper 
      sx={{ 
        p: 2,
        pb: 2,
        height: 700,
        backgroundColor: DASHBOARD_COLORS.cardBg,
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '0.85rem',
            color: DASHBOARD_COLORS.text,
          }}
        >
          District-wise Progress Distribution
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="small"
            variant={selectedRange === 'top' ? "contained" : "outlined"}
            onClick={() => setSelectedRange('top')}
            sx={{ 
              fontSize: '0.7rem',
              py: 0.5,
              minWidth: 'auto'
            }}
          >
            Top Districts
          </Button>
          <Button 
            size="small"
            variant={selectedRange === 'bottom' ? "contained" : "outlined"}
            onClick={() => setSelectedRange('bottom')}
            sx={{ 
              fontSize: '0.7rem',
              py: 0.5,
              minWidth: 'auto'
            }}
          >
            Other Districts
          </Button>
        </Box>
      </Box>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={currentData.map((district, index) => ({
                name: district.name.replace(' District', ''),
                value: district.total,
                color: DISTRICT_COLORS[index],
                percentage: `${district.progressPercentage}%`,
                completed: district.completed
              }))}
              cx="50%"
              cy="50%"
              outerRadius={130}
              innerRadius={70}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={({ name }) => `${name}`}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {currentData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={DISTRICT_COLORS[index]}
                  fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                  style={{ transition: 'all 0.3s ease' }}
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        bgcolor: 'background.paper', 
                        p: 1,
                        border: '1px solid #ccc',
                        fontSize: '0.7rem'
                      }}
                    >
                      <div style={{ color: data.color, fontWeight: 'bold' }}>{data.name}</div>
                      <div>Total: {data.value.toLocaleString()}</div>
                      <div>Progress: {data.percentage}</div>
                      <div>Completed: {data.completed.toLocaleString()}</div>
                    </Paper>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      {/* District List */}
      <Box 
        sx={{ 
          mt: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 1.5,
          maxHeight: '150px',
          overflowY: 'auto',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          pt: 2,
          px: 1
        }}
      >
        {currentData.map((district, index) => (
          <Box 
            key={district.name}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box 
              sx={{ 
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: DISTRICT_COLORS[index]
              }} 
            />
            <Box>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', lineHeight: '1.2' }}>
                {district.name.replace(' District', '')}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: '1.2' }}>
                {district.total.toLocaleString()} ({district.progressPercentage}%)
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

// Districts array
const DISTRICTS = [
  'Anantapur District', 'Annamayya District', 'Bapatla District', 'Chittoor District',
  'East Godavari District', 'Eluru District', 'Guntur District', 'Kadapa District',
  'Kakinada District', 'Konaseema District', 'Krishna District', 'Kurnool District',
  'Nandyal District', 'Nellore District', 'NTR District', 'Srikakulam District',
  'Vizianagaram District', 'Parvathipuram Manyam District', 'Visakhapatnam District',
  'Anakapalli District', 'West Godavari District', 'Palnadu District', 'Prakasam District',
  'Sri Sathya Sai District', 'Tirupati District'
];

const Dashboard = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(anchorEl);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // State for dogs data
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for real-time metrics
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalULBs: 1224,
    totalStrayDogs: 15217,
    sterilizedDogs: 10098,
    pendingDogs: 5119,
    releasedDogs: 6060
  });

  // State for timeline data
  const [timelineData, setTimelineData] = useState<TimelineData[]>([
    { date: '29-12', registered: 1950, sterilized: 850, released: 600 },
    { date: '30-12', registered: 1960, sterilized: 920, released: 620 },
    { date: '31-12', registered: 1940, sterilized: 980, released: 650 },
    { date: '01-01', registered: 1945, sterilized: 1050, released: 680 },
    { date: '02-01', registered: 1930, sterilized: 1150, released: 720 },
    { date: '03-01', registered: 1935, sterilized: 1250, released: 760 },
    { date: '04-01', registered: 1925, sterilized: 1300, released: 800 }
  ]);

  // Backend URL - Change this when integrating with your backend
  const BACKEND_URL = 'https://dog-stray-backend-x7ik.onrender.com/api';

  // Function to update timeline data
  const updateTimelineData = () => {
    setTimelineData(prev => {
      // Remove first item and add new data point
      const newData = [...prev.slice(1)];
      const lastDate = new Date(prev[prev.length - 1].date.split('-').reverse().join('-'));
      lastDate.setDate(lastDate.getDate() + 1);
      
      // Format new date
      const newDate = `${String(lastDate.getDate()).padStart(2, '0')}-${String(lastDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Get last values
      const lastValues = prev[prev.length - 1];
      
      // Calculate new values with smaller, more predictable changes
      const newRegistered = lastValues.registered + Math.floor(Math.random() * 40) - 20;
      const newSterilized = lastValues.sterilized + Math.floor(Math.random() * 30);
      
      // Make released dogs increase more steadily with smaller variations
      const releasedIncrement = Math.floor(Math.random() * 20) + 10; // 10-30 increment
      const newReleased = lastValues.released + releasedIncrement;
      
      // Add new data point
      newData.push({
        date: newDate,
        registered: newRegistered,
        sterilized: newSterilized,
        released: newReleased
      });
      
      return newData;
    });
  };

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/getAllDogs`);
      const dogs = response.data.dogs;

      // Calculate district-wise statistics
      const districtStats = DISTRICTS.map(districtName => {
        const districtDogs = dogs.filter((dog: Dog) => dog.district === districtName);
        const total = districtDogs.length;
        const completed = districtDogs.filter((dog: Dog) => dog.after_surgery_image !== "").length;
        const released = districtDogs.filter((dog: Dog) => dog.after_surgery_image !== "" && dog.relocation_image !== "").length;
        const maleCount = districtDogs.filter((dog: Dog) => dog.gender === "Male").length;
        const femaleCount = districtDogs.filter((dog: Dog) => dog.gender === "Female").length;
        
        return {
          name: districtName,
          total: total,
          completed: completed,
          released: released,
          maleCount: maleCount,
          femaleCount: femaleCount,
          pendingCount: total - completed,
          progressPercentage: total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0
        };
      }).filter((district: TopDistrict) => district.total > 0)  // Only include districts with dogs
       .sort((a: TopDistrict, b: TopDistrict) => b.total - a.total);      // Sort by total dogs descending

      // Update topDistricts state
      setTopDistricts(districtStats);

      // Calculate metrics from the dogs data
      const totalDogs = dogs.length;
      const sterilizedDogs = dogs.filter((dog: Dog) => dog.after_surgery_image !== "").length;
      const releasedDogs = dogs.filter((dog: Dog) => dog.after_surgery_image !== "" && dog.relocation_image !== "").length;
      const pendingDogs = totalDogs - sterilizedDogs;

      // Get unique ULBs count
      const uniqueULBs = new Set(dogs.map((dog: Dog) => dog.ulb)).size;

      setMetrics({
        totalULBs: uniqueULBs,
        totalStrayDogs: totalDogs,
        sterilizedDogs: sterilizedDogs,
        pendingDogs: pendingDogs,
        releasedDogs: releasedDogs
      });

      // Update timeline data based on caught dates
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const dayDogs = dogs.filter((dog: Dog) => {
          const dogDate = new Date(dog.date_of_caught);
          return dogDate.getDate() === date.getDate() &&
                 dogDate.getMonth() === date.getMonth() &&
                 dogDate.getFullYear() === date.getFullYear();
        });

        return {
          date: dateStr,
          registered: dayDogs.length,
          sterilized: dayDogs.filter((dog: Dog) => dog.surgery_date !== null).length,
          released: dayDogs.filter((dog: Dog) => dog.relocation_date !== null).length
        };
      });

      setTimelineData(last7Days);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Effect for real-time updates
  useEffect(() => {
    // Initial fetch
    fetchDashboardData();

    // Set up interval for real-time updates (every 3 seconds)
    const interval = setInterval(fetchDashboardData, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Fetch dogs data
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await axios.get<DogsResponse>('https://dog-stray-backend-x7ik.onrender.com/api/getAllDogs');
        setDogs(response.data.dogs);
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

  // Calculate statistics
  const totalDogs = dogs.length;
  const sterilizedDogs = dogs.filter((dog: Dog) => dog.surgery_date !== null).length;
  const remainingDogs = totalDogs - sterilizedDogs;
  const overallProgress = ((sterilizedDogs / totalDogs) * 100).toFixed(1);

  // Prepare stats
  const dashboardStats = [
    { 
      title: 'Total Dogs',
      value: totalDogs.toLocaleString(),
      icon: <PetsIcon />,
      color: '#2196F3'
    },
    { 
      title: 'Dogs Sterilized',
      value: sterilizedDogs.toLocaleString(),
      icon: <HealingIcon />,
      color: '#4CAF50'
    },
    { 
      title: 'Balance Remaining',
      value: remainingDogs.toLocaleString(),
      icon: <AssignmentIcon />,
      color: '#FF9800'
    },
    { 
      title: 'Overall Progress',
      value: `${overallProgress}%`,
      icon: <CheckCircleIcon />,
      color: '#9C27B0'
    },
  ];

  // Region-wise data calculation
  const regionData: RegionData[] = [
    { 
      name: 'Visakhapatnam',
      total: dogs.filter(dog => dog.district.includes('Visakhapatnam')).length,
      completed: dogs.filter(dog => dog.district.includes('Visakhapatnam') && dog.surgery_date !== null).length,
      remaining: dogs.filter(dog => dog.district.includes('Visakhapatnam') && dog.surgery_date === null).length,
      completionRate: ((dogs.filter(dog => dog.district.includes('Visakhapatnam') && dog.surgery_date !== null).length / 
                        dogs.filter(dog => dog.district.includes('Visakhapatnam')).length) * 100).toFixed(1)
    },
    { 
      name: 'Rajamahendravaram',
      total: dogs.filter(dog => dog.district.includes('Rajamahendravaram')).length,
      completed: dogs.filter(dog => dog.district.includes('Rajamahendravaram') && dog.surgery_date !== null).length,
      remaining: dogs.filter(dog => dog.district.includes('Rajamahendravaram') && dog.surgery_date === null).length,
      completionRate: ((dogs.filter(dog => dog.district.includes('Rajamahendravaram') && dog.surgery_date !== null).length / 
                        dogs.filter(dog => dog.district.includes('Rajamahendravaram')).length) * 100).toFixed(1)
    },
    { 
      name: 'Guntur',
      total: dogs.filter(dog => dog.district.includes('Guntur')).length,
      completed: dogs.filter(dog => dog.district.includes('Guntur') && dog.surgery_date !== null).length,
      remaining: dogs.filter(dog => dog.district.includes('Guntur') && dog.surgery_date === null).length,
      completionRate: ((dogs.filter(dog => dog.district.includes('Guntur') && dog.surgery_date !== null).length / 
                        dogs.filter(dog => dog.district.includes('Guntur')).length) * 100).toFixed(1)
    },
    { 
      name: 'Ananthapuramu',
      total: dogs.filter(dog => dog.district.includes('Anantapur')).length,
      completed: dogs.filter(dog => dog.district.includes('Anantapur') && dog.surgery_date !== null).length,
      remaining: dogs.filter(dog => dog.district.includes('Anantapur') && dog.surgery_date === null).length,
      completionRate: ((dogs.filter(dog => dog.district.includes('Anantapur') && dog.surgery_date !== null).length / 
                        dogs.filter(dog => dog.district.includes('Anantapur')).length) * 100).toFixed(1)
    },
    { 
      name: 'Tirupati',
      total: dogs.filter(dog => dog.district.includes('Tirupati')).length,
      completed: dogs.filter(dog => dog.district.includes('Tirupati') && dog.surgery_date !== null).length,
      remaining: dogs.filter(dog => dog.district.includes('Tirupati') && dog.surgery_date === null).length,
      completionRate: ((dogs.filter(dog => dog.district.includes('Tirupati') && dog.surgery_date !== null).length / 
                        dogs.filter(dog => dog.district.includes('Tirupati')).length) * 100).toFixed(1)
    }
  ];

  // Add state for top districts
  const [topDistricts, setTopDistricts] = useState<TopDistrict[]>([]);

  // Expanded district sample data with more comprehensive information
  const districtSampleData = [
    { 
      name: 'Visakhapatnam District', 
      total: 5670, 
      sterilized: 3890, 
      released: 3456, 
      maleCount: 3012, 
      femaleCount: 2658,
      pendingCount: 1780,
      completionRate: '68.6%'
    },
    { 
      name: 'Guntur District', 
      total: 4890, 
      sterilized: 3234, 
      released: 2890, 
      maleCount: 2789, 
      femaleCount: 2101,
      pendingCount: 1656,
      completionRate: '66.1%'
    },
    { 
      name: 'Krishna District', 
      total: 4123, 
      sterilized: 2890, 
      released: 2567, 
      maleCount: 2345, 
      femaleCount: 1778,
      pendingCount: 1233,
      completionRate: '70.1%'
    },
    { 
      name: 'East Godavari District', 
      total: 4567, 
      sterilized: 3123, 
      released: 2789, 
      maleCount: 2678, 
      femaleCount: 1889,
      pendingCount: 1444,
      completionRate: '68.4%'
    },
    { 
      name: 'West Godavari District', 
      total: 3890, 
      sterilized: 2567, 
      released: 2234, 
      maleCount: 2123, 
      femaleCount: 1767,
      pendingCount: 1323,
      completionRate: '66.0%'
    },
    { 
      name: 'Chittoor District', 
      total: 3890, 
      sterilized: 2678, 
      released: 2345, 
      maleCount: 2234, 
      femaleCount: 1656,
      pendingCount: 1212,
      completionRate: '68.8%'
    },
    { 
      name: 'Prakasam District', 
      total: 3567, 
      sterilized: 2345, 
      released: 2123, 
      maleCount: 1945, 
      femaleCount: 1622,
      pendingCount: 1222,
      completionRate: '65.7%'
    },
    { 
      name: 'Nellore District', 
      total: 3234, 
      sterilized: 2123, 
      released: 1890, 
      maleCount: 1678, 
      femaleCount: 1556,
      pendingCount: 1111,
      completionRate: '65.6%'
    },
    { 
      name: 'Kurnool District', 
      total: 3789, 
      sterilized: 2567, 
      released: 2234, 
      maleCount: 2123, 
      femaleCount: 1666,
      pendingCount: 1222,
      completionRate: '67.7%'
    },
    { 
      name: 'Kadapa District', 
      total: 2890, 
      sterilized: 1945, 
      released: 1678, 
      maleCount: 1456, 
      femaleCount: 1434,
      pendingCount: 945,
      completionRate: '67.3%'
    }
  ];

  // Update the pie chart data to use the top 6 districts for better visualization
  const pieChartData = topDistricts.slice(0, 6).map((district, index) => ({
    name: district.name.replace(' District', ''),
    value: district.total,
    color: DASHBOARD_COLORS.chartColors[index % DASHBOARD_COLORS.chartColors.length],
    percentage: `${district.progressPercentage}%`,
    completed: district.completed
  }));

  // Export Menu Handlers
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePDFExport = async () => {
    if (!dashboardRef.current) return;

    try {
      // Prepare full dataset for export
      const fullDataset = [
        ...dashboardStats.map(stat => ({
          'Statistic': stat.title,
          'Value': stat.value
        })),
        ...regionData.map(region => ({
          'Region': region.name,
          'Total Dogs': region.total,
          'Completed Dogs': region.completed,
          'Remaining Dogs': region.remaining,
          'Completion Rate': `${region.completionRate}%`
        })),
        ...topDistricts.map(district => ({
          'District': district.name,
          'Total Dogs': district.total,
          'Completed Dogs': district.completed,
          'Completion Rate': `${((district.completed/district.total)*100).toFixed(1)}%`
        }))
      ];

      // Export full dataset
      await exportToPDF(
        dashboardRef.current, 
        'Stray_Dogs_Dashboard', 
        { 
          fullDataExport: true,
          includeImages: false  // No images in dashboard
        }, 
        fullDataset
      );
    } catch (err) {
      console.error('PDF Export Error:', err);
    }

    setAnchorEl(null);
  };

  // Inside the Dashboard component, before the return statement
  const targetDetails: TargetDetail[] = [
    { 
      id: 1, 
      municipality: 'Chittoor', 
      achievedWithoutApp: 2802, 
      achievedWithApp: 1015, 
      male: 1910, 
      female: 1503, 
      total: 3413, 
      balance: -1626 
    },
    { 
      id: 2, 
      municipality: 'Nagari', 
      achievedWithoutApp: 850, 
      achievedWithApp: 0, 
      male: 470, 
      female: 297, 
      total: 767, 
      balance: 83 
    },
    { 
      id: 3, 
      municipality: 'Puttur', 
      achievedWithoutApp: 963, 
      achievedWithApp: 868, 
      male: 371, 
      female: 209, 
      total: 580, 
      balance: -485 
    },
    { 
      id: 4, 
      municipality: 'Srikalahasti', 
      achievedWithoutApp: 450, 
      achievedWithApp: 293, 
      male: 385, 
      female: 291, 
      total: 676, 
      balance: -519 
    },
    { 
      id: 5, 
      municipality: 'Tirupati', 
      achievedWithoutApp: 8425, 
      achievedWithApp: 6190, 
      male: 3267, 
      female: 2379, 
      total: 5646, 
      balance: -3411 
    }
  ];

  // Add new state for table visibility
  const [showRegisteredTable, setShowRegisteredTable] = useState(false);
  const [showSterilizedTable, setShowSterilizedTable] = useState(false);
  const [showComplaintsTable, setShowComplaintsTable] = useState(false);

  // Add state for date filters
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  // Function to handle data export
  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Function to handle printing
  const handlePrint = (tableId: string) => {
    const printContent = document.getElementById(tableId);
    if (printContent) {
      const title = tableId === 'registeredTable' ? 'Registered Dogs Report' :
                    tableId === 'sterilizedTable' ? 'Sterilized Dogs Report' :
                    'Complaints Report';
      
      const dateRange = startDate && endDate ? 
        `From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` : 
        'All Time';

      const newWin = window.open('', 'Print-Window');
      newWin?.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .header img { max-width: 100px; height: auto; }
              .title { font-size: 24px; font-weight: bold; margin: 10px 0; }
              .subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
              th { background-color: #f5f5f5; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
              @media print {
                .header { margin-top: 0; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
              }
            </style>
          </head>
          <body onload="window.print()">
            <div class="header">
              <img src="/logo.png" alt="Logo" />
              <div class="title">${title}</div>
              <div class="subtitle">Date Range: ${dateRange}</div>
            </div>
            ${printContent.outerHTML}
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>Stray Dog Population Management System - Government of Andhra Pradesh</p>
            </div>
          </body>
        </html>
      `);
      newWin?.document.close();
    }
  };

  // Function to filter data based on date range
  const getFilteredData = <T extends TimelineData | Dog>(data: T[]): T[] => {
    if (!startDate || !endDate) return data;
    
    return data.filter(item => {
      const itemDate = 'date' in item 
        ? new Date(item.date.split('-').reverse().join('-'))
        : new Date((item as Dog).date_of_caught);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Add state to track which analysis is currently shown
  const [currentAnalysis, setCurrentAnalysis] = useState<'registered' | 'sterilized' | 'released' | null>(null);

  // Modify the click handlers
  const handleAnalysisClick = (type: 'registered' | 'sterilized' | 'released') => {
    if (currentAnalysis === type) {
      setCurrentAnalysis(null);
    } else {
      setCurrentAnalysis(type);
    }
  };

  // Loading and error states
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

  // Update the pie chart data calculations
  const districtData = districtSampleData.map((district, index) => ({
    name: district.name,
    value: district.total,
    sterilized: district.sterilized,
    released: district.released,
    color: DASHBOARD_COLORS.chartColors[index % DASHBOARD_COLORS.chartColors.length],
    percentage: ((district.sterilized / district.total) * 100).toFixed(1) + '%'
  }));

  // Add this near the top of your Dashboard component
  const carouselItems = [
    {
      image: '/assets/Starydog.jpeg',
      title: 'Stray Dogs',
      description: 'Helping stray dogs find better lives'
    },
    {
      image: '/assets/DogCatch.jpeg',
      title: 'Catching stray dogs',
      description: 'Humane capture and handling of stray dogs'
    },
    {
      image: '/assets/Feeding.jpeg',
      title: 'Post operative Care',
      description: 'Post operative care of sterilised dogs'
    },
    {
      image: '/assets/SterilizedDogs.jpeg',
      title: 'Sterilization Program',
      description: 'Animal Birth Control (ABC) Program'
    },
    {
      image: '/assets/Res.jpeg',
      title: 'Released Dogs',
      description: 'All the sterilised dogs will be released back into their original territory after Anti Rabies Vaccine'
    }
  ];

  // Add this carousel component before your Grid container in the return statement
  

  // Rest of the existing dashboard rendering code remains the same
  return (
    <Box 
      ref={dashboardRef} 
      sx={{ 
        backgroundColor: DASHBOARD_COLORS.background,
        minHeight: '100vh',
        width: '100%',
        py: 4,
        px: { xs: 2, md: 4 }
      }}
    >


<Box sx={{ mb: 4 }}>
    <Carousel
      animation="slide"
      indicators={true}
      navButtonsAlwaysVisible={true}
      cycleNavigation={true}
      autoPlay={true}
      interval={4000}
      sx={{
        minHeight: { xs: '200px', sm: '300px', md: '400px' },
        '& .MuiPaper-root': {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      {carouselItems.map((item, index) => (
        <Paper key={index} elevation={3}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: '300px', sm: '400px', md: '500px' }
            }}
          >
            <Box
              component="img"
              src={item.image}
              alt={item.title}
              
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                color: 'white',
                padding: 2
              }}
            >
              <Typography variant="h5" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body1">
                {item.description}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Carousel>
  </Box>
      <Grid container spacing={3}>
        {/* Summary Metric Cards */}
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              background: `linear-gradient(rgba(25, 118, 210, 0.6), rgba(13, 71, 161, 0.7)), url('/assets/ULB.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
              p: 3,
              textAlign: 'left',
              boxShadow: '0 2px 4px rgba(121, 85, 72, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                '& .emoji': {
                  transform: 'scale(1.15)'
                }
              }
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: '2.5rem', lineHeight: 1 }}>
              {123}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9, mt: 2 }}>
              Total ULBs
            </Typography>
           
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              background: `linear-gradient(rgba(76, 175, 80, 0.6), rgba(27, 94, 32, 0.7)), url('/assets/Starydog.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
              p: 3,
              textAlign: 'left',
              boxShadow: '0 2px 4px rgba(255, 82, 82, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                '& .emoji': {
                  transform: 'scale(1.15)'
                }
              }
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: '2.5rem', lineHeight: 1 }}>
              {204121}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9, mt: 2 }}>
             Target Dog Population
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              background: `linear-gradient(rgba(255, 152, 0, 0.6), rgba(230, 81, 0, 0.7)), url('/assets/DogCatch.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
              p: 3,
              textAlign: 'left',
              boxShadow: '0 2px 4px rgba(67, 160, 71, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                '& .emoji': {
                  transform: 'scale(1.15)'
                }
              }
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: '2.5rem', lineHeight: 1 }}>
              {34717}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9, mt: 2 }}>
             No.of Dogs caught 
            </Typography>
           
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              background: `linear-gradient(rgba(156, 39, 176, 0.6), rgba(74, 20, 140, 0.7)), url('/assets/SterilizedDogs.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
              p: 3,
              textAlign: 'left',
              boxShadow: '0 2px 4px rgba(255, 179, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                '& .emoji': {
                  transform: 'scale(1.15)'
                }
              }
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: '2.5rem', lineHeight: 1 }}>
              {34717}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9, mt: 2 }}>
             No.of Dogs Sterilised
            </Typography>
           
          </Box>
        </Grid>
       
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              background: `linear-gradient(rgba(0, 150, 136, 0.6), rgba(0, 77, 64, 0.7)), url('/assets/ReleasedDogs.jpeg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
              p: 3,
              textAlign: 'left',
              boxShadow: '0 2px 4px rgba(67, 160, 71, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                '& .emoji': {
                  transform: 'scale(1.15)'
                }
              }
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: '2.5rem', lineHeight: 1 }}>
              {34717}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9, mt: 2 }}>
             No.of Dogs Releaed after ARV
            </Typography>
           
          </Box>
        </Grid>
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              background: `linear-gradient(rgba(233, 30, 99, 0.6), rgba(136, 14, 79, 0.7)), url('/assets/Res.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
              p: 3,
              textAlign: 'left',
              boxShadow: '0 2px 4px rgba(67, 160, 71, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                '& .emoji': {
                  transform: 'scale(1.15)'
                }
              }
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: '2.5rem', lineHeight: 1 }}>
              {169404}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9, mt: 2 }}>
              Balance to be covered
            </Typography>
           
          </Box>
        </Grid>
        {/* Metric Cards */}
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Dogs Registered"
            value={34717}
            total={204121}
            subtitle="Total Registered vs Target"
            color={DASHBOARD_COLORS.gates}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Sterilization"
            value={34717}
            total={34717}
            subtitle="Total Sterilized vs Total Dogs"
            color={DASHBOARD_COLORS.attendance}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Released Dogs"
            value={34717}
            total={34717}
            subtitle="Released vs Sterilized Dogs"
            color="#4CAF50"
          />
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              height: 425,
              backgroundColor: DASHBOARD_COLORS.cardBg,
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '0.9rem',
                color: DASHBOARD_COLORS.text,
                mb: 2
              }}
            >
              Dogs Registered - Last 7 Days
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={DASHBOARD_COLORS.progressBar} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: DASHBOARD_COLORS.text }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: DASHBOARD_COLORS.text }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: DASHBOARD_COLORS.cardBg,
                      border: `1px solid ${DASHBOARD_COLORS.progressBar}`,
                      borderRadius: 4,
                      fontSize: '0.8rem'
                    }}
                  />
                  <Bar 
                    dataKey="registered" 
                    fill={DASHBOARD_COLORS.gates}
                    radius={[4, 4, 0, 0]}
                    animationDuration={300}
                    animationBegin={0}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Box 
              sx={{ 
                mt: 2,
                display: 'flex', 
                justifyContent: 'center' 
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleAnalysisClick('registered')}
                endIcon={currentAnalysis === 'registered' ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                sx={{
                  color: DASHBOARD_COLORS.gates,
                  borderColor: DASHBOARD_COLORS.gates,
                  fontSize: '0.7rem',
                  padding: '4px 12px',
                  minHeight: '24px',
                  '&:hover': {
                    borderColor: DASHBOARD_COLORS.gates,
                    backgroundColor: `${DASHBOARD_COLORS.gates}10`,
                  }
                }}
              >
                MORE ANALYSIS
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              height: 425,
              backgroundColor: DASHBOARD_COLORS.cardBg,
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '0.9rem',
                color: DASHBOARD_COLORS.text,
                mb: 2
              }}
            >
              Sterilization - Last 7 Days
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={DASHBOARD_COLORS.progressBar} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: DASHBOARD_COLORS.text }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: DASHBOARD_COLORS.text }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: DASHBOARD_COLORS.cardBg,
                      border: `1px solid ${DASHBOARD_COLORS.progressBar}`,
                      borderRadius: 4,
                      fontSize: '0.8rem'
                    }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="sterilized"
                    stroke={DASHBOARD_COLORS.attendance}
                    strokeWidth={2}
                    dot={{ fill: DASHBOARD_COLORS.attendance, r: 4 }}
                    animationDuration={300}
                    animationBegin={0}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Box 
              sx={{ 
                mt: 2,
                display: 'flex', 
                justifyContent: 'center' 
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleAnalysisClick('sterilized')}
                endIcon={currentAnalysis === 'sterilized' ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                sx={{
                  color: DASHBOARD_COLORS.attendance,
                  borderColor: DASHBOARD_COLORS.attendance,
                  fontSize: '0.7rem',
                  padding: '4px 12px',
                  minHeight: '24px',
                  '&:hover': {
                    borderColor: DASHBOARD_COLORS.attendance,
                    backgroundColor: `${DASHBOARD_COLORS.attendance}10`,
                  }
                }}
              >
                MORE ANALYSIS
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3,
              height: 425,
              backgroundColor: DASHBOARD_COLORS.cardBg,
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '0.9rem',
                color: DASHBOARD_COLORS.text,
                mb: 2
              }}
            >
              Released Dogs - Last 7 Days
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={DASHBOARD_COLORS.progressBar} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: DASHBOARD_COLORS.text }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: DASHBOARD_COLORS.text }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: DASHBOARD_COLORS.cardBg,
                      border: `1px solid ${DASHBOARD_COLORS.progressBar}`,
                      borderRadius: 4,
                      fontSize: '0.8rem'
                    }}
                  />
                  <defs>
                    <linearGradient id="releasedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone"
                    dataKey="released"
                    fill="url(#releasedGradient)"
                    stroke="none"
                    isAnimationActive={false}
                    hide={true}
                  />
                  <Scatter
                    dataKey="released"
                    fill="#4CAF50"
                    r={4}
                    isAnimationActive={false}
                    hide={true}
                  />
                  <Line 
                    type="natural"
                    dataKey="released"
                    stroke="#4CAF50"
                    strokeWidth={3}
                    dot={{ fill: "#4CAF50", r: 4 }}
                    activeDot={{ r: 6, fill: "#4CAF50" }}
                    isAnimationActive={true}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
            <Box 
              sx={{ 
                mt: 2,
                display: 'flex', 
                justifyContent: 'center' 
              }}
            >
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleAnalysisClick('released')}
                endIcon={currentAnalysis === 'released' ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                sx={{
                  color: "#4CAF50",
                  borderColor: "#4CAF50",
                  fontSize: '0.7rem',
                  padding: '4px 12px',
                  minHeight: '24px',
                  '&:hover': {
                    borderColor: "#4CAF50",
                    backgroundColor: `#4CAF5010`,
                  }
                }}
              >
                MORE ANALYSIS
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Analysis Section */}
        <Grid item xs={12}>
          <Fade in={currentAnalysis !== null} unmountOnExit>
            <Paper sx={{ mt: 2, p: 2, width: '100%' }}>
              {currentAnalysis === 'registered' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Start Date</Typography>
                        <StyledDateInput
                          type="date"
                          value={startDate ? startDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => setStartDate(new Date(e.target.value))}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>End Date</Typography>
                        <StyledDateInput
                          type="date"
                          value={endDate ? endDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => setEndDate(new Date(e.target.value))}
                        />
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => handlePrint('registeredTable')} size="small">
                        <PrintIcon />
                      </IconButton>
                      <IconButton onClick={() => exportToExcel(getFilteredData<Dog>(dogs), 'registered_dogs')} size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                  <TableContainer>
                    <Table id="registeredTable" size="small">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Date</StyledTableCell>
                          <StyledTableCell>District</StyledTableCell>
                          <StyledTableCell>ULB</StyledTableCell>
                          <StyledTableCell>Ward No</StyledTableCell>
                          <StyledTableCell>Gender</StyledTableCell>
                          <StyledTableCell>Status</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFilteredData<Dog>(dogs).map((dog) => (
                          <StyledTableRow key={dog.id}>
                            <StyledTableCell>
                              {new Date(dog.date_of_caught).toLocaleDateString()}
                            </StyledTableCell>
                            <StyledTableCell>{dog.district}</StyledTableCell>
                            <StyledTableCell>{dog.ulb}</StyledTableCell>
                            <StyledTableCell>{dog.ward_no}</StyledTableCell>
                            <StyledTableCell>{dog.gender}</StyledTableCell>
                            <StyledTableCell>
                              {dog.surgery_date ? 'Sterilized' : 'Pending'}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              
              {currentAnalysis === 'sterilized' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Start Date</Typography>
                        <StyledDateInput
                          type="date"
                          value={startDate ? startDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => setStartDate(new Date(e.target.value))}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>End Date</Typography>
                        <StyledDateInput
                          type="date"
                          value={endDate ? endDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => setEndDate(new Date(e.target.value))}
                        />
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => handlePrint('sterilizedTable')} size="small">
                        <PrintIcon />
                      </IconButton>
                      <IconButton onClick={() => exportToExcel(getFilteredData<Dog>(dogs.filter(dog => dog.surgery_date)), 'sterilized_dogs')} size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                  <TableContainer>
                    <Table id="sterilizedTable" size="small">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Date of Surgery</StyledTableCell>
                          <StyledTableCell>District</StyledTableCell>
                          <StyledTableCell>ULB</StyledTableCell>
                          <StyledTableCell>Ward No</StyledTableCell>
                          <StyledTableCell>Gender</StyledTableCell>
                          <StyledTableCell>Relocation Date</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFilteredData<Dog>(dogs.filter(dog => dog.surgery_date)).map((dog) => (
                          <StyledTableRow key={dog.id}>
                            <StyledTableCell>
                              {new Date(dog.surgery_date!).toLocaleDateString()}
                            </StyledTableCell>
                            <StyledTableCell>{dog.district}</StyledTableCell>
                            <StyledTableCell>{dog.ulb}</StyledTableCell>
                            <StyledTableCell>{dog.ward_no}</StyledTableCell>
                            <StyledTableCell>{dog.gender}</StyledTableCell>
                            <StyledTableCell>
                              {dog.relocation_date ? new Date(dog.relocation_date).toLocaleDateString() : 'Pending'}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              
              {currentAnalysis === 'released' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Start Date</Typography>
                        <StyledDateInput
                          type="date"
                          value={startDate ? startDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => setStartDate(new Date(e.target.value))}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>End Date</Typography>
                        <StyledDateInput
                          type="date"
                          value={endDate ? endDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => setEndDate(new Date(e.target.value))}
                        />
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => handlePrint('releasedTable')} size="small">
                        <PrintIcon />
                      </IconButton>
                      <IconButton onClick={() => exportToExcel(getFilteredData<Dog>(dogs.filter(dog => dog.relocation_date)), 'released_dogs')} size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                  <TableContainer>
                    <Table id="releasedTable" size="small">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Release Date</StyledTableCell>
                          <StyledTableCell>District</StyledTableCell>
                          <StyledTableCell>ULB</StyledTableCell>
                          <StyledTableCell>Ward No</StyledTableCell>
                          <StyledTableCell>Gender</StyledTableCell>
                          <StyledTableCell>Surgery Date</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFilteredData<Dog>(dogs.filter(dog => dog.relocation_date)).map((dog) => (
                          <StyledTableRow key={dog.id}>
                            <StyledTableCell>
                              {new Date(dog.relocation_date!).toLocaleDateString()}
                            </StyledTableCell>
                            <StyledTableCell>{dog.district}</StyledTableCell>
                            <StyledTableCell>{dog.ulb}</StyledTableCell>
                            <StyledTableCell>{dog.ward_no}</StyledTableCell>
                            <StyledTableCell>{dog.gender}</StyledTableCell>
                            <StyledTableCell>
                              {new Date(dog.surgery_date!).toLocaleDateString()}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Paper>
          </Fade>
        </Grid>

        {/* District Progress Pie Charts Section */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box>
                <DistrictProgressChart 
                  data={topDistricts} 
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <PieChartComponent 
                data={[
                  { 
                    name: 'Pending', 
                    value: metrics.pendingDogs,
                    color: '#E74C3C',
                    percentage: `${((metrics.pendingDogs / metrics.totalStrayDogs) * 100).toFixed(1)}%`
                  },
                  { 
                    name: 'Sterilized Only', 
                    value: Math.max(0, metrics.sterilizedDogs - metrics.releasedDogs),
                    color: '#F39C12',
                    percentage: `${Math.max(0, ((metrics.sterilizedDogs - metrics.releasedDogs) / metrics.totalStrayDogs) * 100).toFixed(1)}%`
                  },
                  { 
                    name: 'Released', 
                    value: Math.min(metrics.releasedDogs, metrics.sterilizedDogs),
                    color: '#27AE60',
                    percentage: `${((Math.min(metrics.releasedDogs, metrics.sterilizedDogs) / metrics.totalStrayDogs) * 100).toFixed(1)}%`
                  }
                ]} 
                title="Dog Population Status Distribution" 
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Top Districts Performance Section */}
        <Grid item xs={12}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 3,
                  height: '100%',
                  backgroundColor: DASHBOARD_COLORS.cardBg,
                  borderRadius: 2,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    backgroundColor: 'rgba(255, 106, 0, 0.1)',
                    borderRadius: '50%',
                    transform: 'rotate(45deg)',
                    zIndex: 0
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1rem',
                    color: DASHBOARD_COLORS.text,
                    mb: 2,
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  Top Districts Performance
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.7rem'
                    }}
                  >
                    Last 7 Days
                  </Typography>
                </Typography>

                <TableContainer sx={{ maxHeight: 550 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <StyledTableCell sx={{ fontSize: '0.75rem', py: 1 }}>District</StyledTableCell>
                        <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>Total Dogs</StyledTableCell>
                        <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>Male</StyledTableCell>
                        <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>Female</StyledTableCell>
                        <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>Sterilized</StyledTableCell>
                        <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>Released</StyledTableCell>
                        <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>Progress</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topDistricts.map((district, index) => (
                        <StyledTableRow key={district.name}>
                          <StyledTableCell sx={{ fontSize: '0.75rem', py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  width: 8, 
                                  height: 8, 
                                  borderRadius: '50%', 
                                  backgroundColor: DASHBOARD_COLORS.chartColors[index % DASHBOARD_COLORS.chartColors.length],
                                  mr: 1 
                                }} 
                              />
                              {district.name.replace(' District', '')}
                            </Box>
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>
                            {district.total}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>
                            {district.maleCount}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>
                            {district.femaleCount}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>
                            {district.completed}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>
                            {district.released}
                          </StyledTableCell>
                          <StyledTableCell align="center" sx={{ fontSize: '0.75rem', py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: district.progressPercentage > 50 ? 'success.main' : 'error.main',
                                  fontWeight: 'bold',
                                  fontSize: '0.75rem',
                                  mr: 0.5
                                }}
                              >
                                {district.progressPercentage}%
                              </Typography>
                              {district.progressPercentage > 50 ? (
                                <KeyboardArrowUpIcon sx={{ fontSize: '1rem' }} color="success" />
                              ) : (
                                <KeyboardArrowDownIcon sx={{ fontSize: '1rem' }} color="error" />
                              )}
                            </Box>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 