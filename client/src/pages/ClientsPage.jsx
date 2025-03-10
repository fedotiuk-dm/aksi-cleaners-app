// /client/src/pages/ClientsPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, TextField, Button, Box, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import ClientList from '../components/ClientList/ClientList';
import ClientForm from '../components/ClientForm/ClientForm';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    clientId: null,
    clientName: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1
  });

  // Завантаження клієнтів
  const fetchClients = async (page = 1, searchTerm = search) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/clients?search=${searchTerm}&page=${page}&limit=10`);
      
      setClients(response.data.clients);
      setPagination({
        page: response.data.pagination.page,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      });
      setError(null);
    } catch (err) {
      console.error('Помилка завантаження клієнтів:', err);
      setError('Не вдалося завантажити список клієнтів. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  // Завантаження клієнтів при першому рендері
  useEffect(() => {
    fetchClients();
  }, []);

  // Обробка пошуку
  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(1, search);
  };

  // Обробка зміни сторінки
  const handlePageChange = (page) => {
    fetchClients(page);
  };

  // Відкриття форми для додавання нового клієнта
  const handleAddClient = () => {
    setCurrentClient(null);
    setOpenForm(true);
  };

  // Відкриття форми для редагування клієнта
  const handleEditClient = (client) => {
    setCurrentClient(client);
    setOpenForm(true);
  };

  // Закриття форми
  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentClient(null);
  };

  // Збереження клієнта
  const handleSaveClient = async (clientData) => {
    try {
      let response;
      
      if (currentClient) {
        // Оновлення існуючого клієнта
        response = await axios.put(`/api/clients/${currentClient._id}`, clientData);
        setSnackbar({
          open: true,
          message: 'Клієнта успішно оновлено!',
          severity: 'success'
        });
      } else {
        // Створення нового клієнта
        response = await axios.post('/api/clients', clientData);
        setSnackbar({
          open: true,
          message: 'Клієнта успішно додано!',
          severity: 'success'
        });
      }
      
      // Оновлюємо список після змін
      fetchClients();
      handleCloseForm();
    } catch (err) {
      console.error('Помилка збереження клієнта:', err);
      setSnackbar({
        open: true,
        message: `Помилка: ${err.response?.data?.message || 'Не вдалося зберегти клієнта'}`,
        severity: 'error'
      });
    }
  };

  // Відкриття діалогу підтвердження видалення
  const handleDeleteConfirmation = (client) => {
    setConfirmDialog({
      open: true,
      clientId: client._id,
      clientName: `${client.прізвище} ${client.імя}`
    });
  };

  // Закриття діалогу підтвердження
  const handleCloseConfirm = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false
    });
  };

  // Видалення клієнта
  const handleDeleteClient = async () => {
    try {
      await axios.delete(`/api/clients/${confirmDialog.clientId}`);
      
      setSnackbar({
        open: true,
        message: 'Клієнта успішно видалено!',
        severity: 'success'
      });
      
      // Оновлюємо список після видалення
      fetchClients();
    } catch (err) {
      console.error('Помилка видалення клієнта:', err);
      setSnackbar({
        open: true,
        message: 'Не вдалося видалити клієнта. Спробуйте пізніше.',
        severity: 'error'
      });
    } finally {
      handleCloseConfirm();
    }
  };

  // Закриття повідомлення Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Управління клієнтами
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <Box display="flex" alignItems="center">
                <TextField
                  fullWidth
                  label="Пошук клієнтів"
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ім'я, прізвище, телефон..."
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ ml: 1 }}
                  startIcon={<SearchIcon />}
                >
                  Пошук
                </Button>
              </Box>
            </form>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClient}
            >
              Додати клієнта
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : (
        <ClientList
          clients={clients}
          onEdit={handleEditClient}
          onDelete={handleDeleteConfirmation}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
      
      {/* Форма додавання/редагування клієнта */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentClient ? 'Редагувати клієнта' : 'Додати нового клієнта'}
        </DialogTitle>
        <DialogContent>
          <ClientForm
            client={currentClient}
            onSave={handleSaveClient}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
      
      {/* Діалог підтвердження видалення */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirm}>
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ви дійсно хочете видалити клієнта {confirmDialog.clientName}?
            Цю дію неможливо скасувати.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            Скасувати
          </Button>
          <Button onClick={handleDeleteClient} color="error" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Повідомлення про результат дії */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClientsPage;