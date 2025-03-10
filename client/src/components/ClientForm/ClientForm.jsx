// /client/src/components/ClientForm/ClientForm.jsx
import React, { useState } from 'react';
import { 
  Paper, Typography, TextField, Button, Grid, Box, 
  FormControl, InputLabel, MenuItem, Select, Snackbar, Alert 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const ClientForm = ({ initialData, onSave, onCancel, isSubmitting }) => {
  const isEditMode = !!initialData?._id;
  
  // Стани для полів форми
  const [formData, setFormData] = useState({
    імя: initialData?.імя || '',
    прізвище: initialData?.прізвище || '',
    по_батькові: initialData?.по_батькові || '',
    телефон: initialData?.телефон || '',
    додатковий_телефон: initialData?.додатковий_телефон || '',
    email: initialData?.email || '',
    адреса: initialData?.адреса || '',
    знижка: initialData?.знижка || 0,
    коментар: initialData?.коментар || '',
    активний: initialData?.активний !== undefined ? initialData.активний : true
  });
  
  // Стани для помилок валідації
  const [errors, setErrors] = useState({});
  
  // Обробка зміни полів форми
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Скидаємо помилку для поля, яке змінили
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Валідація форми
  const validateForm = () => {
    const newErrors = {};
    
    // Перевірка обов'язкових полів
    if (!formData.імя.trim()) {
      newErrors.імя = "Ім'я обов'язкове";
    }
    
    if (!formData.прізвище.trim()) {
      newErrors.прізвище = "Прізвище обов'язкове";
    }
    
    if (!formData.телефон.trim()) {
      newErrors.телефон = "Телефон обов'язковий";
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.телефон)) {
      newErrors.телефон = "Некоректний формат телефону";
    }
    
    // Перевірка email, якщо введений
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Некоректний формат email";
    }
    
    // Перевірка знижки
    if (formData.знижка < 0 || formData.знижка > 100) {
      newErrors.знижка = "Знижка має бути від 0 до 100%";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Обробка відправки форми
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Редагування клієнта' : 'Новий клієнт'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Основні дані */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="прізвище"
              label="Прізвище*"
              value={formData.прізвище}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.прізвище}
              helperText={errors.прізвище}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="імя"
              label="Ім'я*"
              value={formData.імя}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.імя}
              helperText={errors.імя}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="по_батькові"
              label="По батькові"
              value={formData.по_батькові}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={isSubmitting}
            />
          </Grid>
          
          {/* Контактні дані */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="телефон"
              label="Телефон*"
              value={formData.телефон}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.телефон}
              helperText={errors.телефон}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="додатковий_телефон"
              label="Додатковий телефон"
              value={formData.додатковий_телефон}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="адреса"
              label="Адреса"
              value={formData.адреса}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
              disabled={isSubmitting}
            />
          </Grid>
          
          {/* Додаткові налаштування */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="знижка"
              label="Знижка (%)"
              type="number"
              value={formData.знижка}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{ inputProps: { min: 0, max: 100 } }}
              error={!!errors.знижка}
              helperText={errors.знижка}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Статус клієнта</InputLabel>
              <Select
                name="активний"
                value={formData.активний}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <MenuItem value={true}>Активний</MenuItem>
                <MenuItem value={false}>Неактивний</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="коментар"
              label="Коментар"
              value={formData.коментар}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              disabled={isSubmitting}
            />
          </Grid>
        </Grid>
        
        {/* Кнопки */}
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<CancelIcon />}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Скасувати
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Збереження...' : isEditMode ? 'Зберегти зміни' : 'Додати клієнта'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ClientForm;