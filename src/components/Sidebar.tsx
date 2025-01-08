import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Pets as PetsIcon,
  Map as MapIcon,
  ListAlt as ListAltIcon,
  AddTask as AddTaskIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Statistics', icon: <AssessmentIcon />, path: '/statistics' },
    { text: 'Dogs', icon: <PetsIcon />, path: '/dogs' },
    { text: 'Map', icon: <MapIcon />, path: '/map' },
    { text: 'Targets', icon: <ListAltIcon />, path: '/targets' },
    { text: 'Achieved Without App', icon: <AddTaskIcon />, path: '/achieved-without-app' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={isSmUp ? "permanent" : "temporary"}
      open={open}
      onClose={onClose}
      sx={{
        width: { xs: '60px', sm: '240px' },
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: { xs: '60px', sm: '240px' },
          boxSizing: 'border-box',
          backgroundColor: 'white',
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: 'width 0.3s ease, transform 0.3s ease',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        },
      }}
    >
      <Toolbar sx={{ 
        minHeight: '100px !important', 
        display: 'flex', 
        alignItems: 'flex-end',
        justifyContent: 'center',
        pb: 2 
      }} />
      <List sx={{ pt: 0 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                minHeight: 48,
                px: 2.5,
                color: 'black',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 106, 0, 0.1)',
                  color: '#FF6A00',
                  '& .MuiListItemIcon-root': {
                    color: '#FF6A00',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 106, 0, 0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isSmUp ? 3 : 'auto',
                  justifyContent: 'center',
                  color: location.pathname === item.path 
                    ? '#FF6A00'
                    : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {isSmUp && open && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 