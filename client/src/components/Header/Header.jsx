// /client/src/components/Header/Header.jsx
import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Перевірка активного маршруту для виділення кнопки навігації
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          AKSI Cleaners
        </Typography>
        
        <Box>
          <Button 
            color="inherit" 
            onClick={() => navigate('/orders')}
            sx={{ 
              fontWeight: isActive('/orders') ? 'bold' : 'normal',
              textDecoration: isActive('/orders') ? 'underline' : 'none'
            }}
          >
            Замовлення
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/clients')}
            sx={{ 
              fontWeight: isActive('/clients') ? 'bold' : 'normal',
              textDecoration: isActive('/clients') ? 'underline' : 'none'
            }}
          >
            Клієнти
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/price-list')}
            sx={{ 
              fontWeight: isActive('/price-list') ? 'bold' : 'normal',
              textDecoration: isActive('/price-list') ? 'underline' : 'none'
            }}
          >
            Прайс-лист
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/reports')}
            sx={{ 
              fontWeight: isActive('/reports') ? 'bold' : 'normal',
              textDecoration: isActive('/reports') ? 'underline' : 'none'
            }}
          >
            Звіти
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;