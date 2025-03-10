// /client/src/pages/ClientDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const ClientDetailsPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Завантаження даних клієнта
  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/clients/${clientId}`);
        setClient(response.data);
      } catch (error) {
        console.error('Помилка отримання деталей клієнта:', error);
        setError('Не вдалося завантажити дані клієнта');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientDetails();
  }, [clientId]);
  
  // Повернення до списку клієнтів
  const handleGoBack = () => {
    navigate('/clients');
  };
  
  // Перехід до редагування клієнта
  const handleEditClient = () => {
    navigate(`/clients/${clientId}/edit`);
  };
  
  // Створення нового замовлення для цього клієнта
  const handleCreateOrder = () => {
    navigate('/orders/new', { state: { selectedClient: client } });
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
            sx={{ mt: 2 }}
          >
            Повернутися до списку клієнтів
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Інформація про клієнта</Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCreateOrder}
              sx={{ mr: 1 }}
            >
              Нове замовлення
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={handleEditClient}
            >
              Редагувати
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {client && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Прізвище" 
                    secondary={client.прізвище} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Ім'я" 
                    secondary={client.імя} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Телефон" 
                    secondary={client.телефон} 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Email" 
                    secondary={client.email || '-'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Адреса" 
                    secondary={client.адреса || '-'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Знижка" 
                    secondary={client.знижка ? `${client.знижка}%` : '-'} 
                  />
                </ListItem>
              </List>
            </Grid>
            
            {client.примітка && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">Примітка:</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography>{client.примітка}</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
        
        <Box mt={3}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleGoBack}
          >
            Назад до списку клієнтів
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ClientDetailsPage;