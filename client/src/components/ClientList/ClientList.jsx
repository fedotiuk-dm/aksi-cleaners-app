// /client/src/components/ClientList/ClientList.jsx
import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ClientList = ({ clients, onViewClient }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Прізвище</TableCell>
            <TableCell>Ім'я</TableCell>
            <TableCell>Телефон</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Знижка</TableCell>
            <TableCell align="right">Дії</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client._id || client.id}>
              <TableCell>{client.прізвище}</TableCell>
              <TableCell>{client.імя}</TableCell>
              <TableCell>{client.телефон}</TableCell>
              <TableCell>{client.email || '-'}</TableCell>
              <TableCell>{client.знижка ? `${client.знижка}%` : '-'}</TableCell>
              <TableCell align="right">
                <Tooltip title="Деталі клієнта">
                  <IconButton 
                    color="primary" 
                    onClick={() => onViewClient(client._id || client.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ClientList;