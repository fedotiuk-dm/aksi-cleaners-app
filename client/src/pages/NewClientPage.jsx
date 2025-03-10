// /client/src/pages/NewClientPage.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewClientPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Стан для даних клієнта
  const [clientData, setClientData] = useState({
    імя: '',
    прізвище: '',
    телефон: '',
    email: '',
    адреса: '',
    примітка: '',
    знижка: 0
  });
  
  // Стан для помилок валідації
  const [validationErrors, setValidationErrors] = useState({
    імя: '',
    прізвище: '',
    телефон: ''
  });
  
  // Обробка змін у полях форми
  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищення помилок при введенні
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Валідація форми
  const validateForm = () => {
    const errors = {};
    
    if (!clientData.імя.trim()) {
      errors.імя = "Ім'я обов'язкове";
    }
    
    if (!clientData.прізвище.trim()) {
      errors.прізвище = "Прізвище обов'язкове";
    }
    
    if (!clientData.телефон.trim()) {
      errors.телефон = "Телефон обов'язковий";
    } else if (!/^\d{10}$/.test(clientData.телефон.replace(/\D/g, ''))) {
      errors.телефон = "Телефон повинен містити 10 цифр";
    }
    
    if (clientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      errors.email = "Невірний формат електронної пошти";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Обробка відправки форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Відправка даних клієнта:', clientData);
      
      // Підготовка даних для відправки
      const clientToSave = {
        ...clientData,
        знижка: Number(clientData.знижка) || 0
      };
      
      // Відправка на сервер
      const response = await axios.post('/api/clients', clientToSave);
      
      console.log('Відповідь сервера:', response.data);
      setShowSuccess(true);
      
      // Перехід до списку клієнтів після успішного створення
      setTimeout(() => {
        navigate('/clients', { state: { message: 'Клієнт успішно створений!' } });
      }, 1500);
    } catch (error) {
      console.error('Помилка створення клієнта:', error);
      setError(error.response?.data?.message || 'Сталася помилка при створенні клієнта');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Повернення до списку клієнтів
  const handleCancel = () => {
    navigate('/clients');
  };

  return (
    <Container>
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h5" gutterBottom>Створення нового клієнта</Typography>
        
        {error && (
          <Box sx={{ color: 'error.main', mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
            {error}
          </Box>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="імя"
                label="Ім'я"
                fullWidth
                required
                value={clientData.імя}
                onChange={handleChange}
                error={!!validationErrors.імя}
                helperText={validationErrors.імя}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="прізвище"
                label="Прізвище"
                fullWidth
                required
                value={clientData.прізвище}
                onChange={handleChange}
                error={!!validationErrors.прізвище}
                helperText={validationErrors.прізвище}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="телефон"
                label="Телефон"
                fullWidth
                required
                value={clientData.телефон}
                onChange={handleChange}
                error={!!validationErrors.телефон}
                helperText={validationErrors.телефон || "Формат: 0XXXXXXXXX"}
                margin="normal"
                placeholder="0XXXXXXXXX"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                fullWidth
                value={clientData.email}
                onChange={handleChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                margin="normal"
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="адреса"
                label="Адреса"
                fullWidth
                value={clientData.адреса}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="знижка"
                label="Знижка (%)"
                fullWidth
                type="number"
                value={clientData.знижка}
                onChange={handleChange}
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="примітка"
                label="Примітка"
                fullWidth
                multiline
                rows={3}
                value={clientData.примітка}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
          </Grid>
          
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              startIcon={<ArrowBackIcon />}
              disabled={isSubmitting}
            >
              Назад
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      {/* Повідомлення про успіх */}
      <Snackbar 
        open={showSuccess} 
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Клієнт успішно створений!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewClientPage;