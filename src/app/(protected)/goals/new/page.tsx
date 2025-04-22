'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const categories = [
  'Investimento',
  'Viagem',
  'Educação',
  'Casa',
  'Carro',
  'Emergência',
  'Aposentadoria',
  'Outro',
];

export default function NewGoalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    category: '',
    start_date: new Date(),
    target_date: new Date(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field: 'start_date' | 'target_date') => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [field]: date,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return false;
    }
    if (!formData.target_amount || Number(formData.target_amount) <= 0) {
      setError('Valor da meta deve ser maior que zero');
      return false;
    }
    if (!formData.category) {
      setError('Categoria é obrigatória');
      return false;
    }
    if (formData.target_date < formData.start_date) {
      setError('Data final deve ser posterior à data inicial');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data: goal, error: insertError } = await supabase
        .from('financial_goals')
        .insert({
          user_id: user?.id,
          title: formData.title,
          description: formData.description,
          target_amount: Number(formData.target_amount),
          current_amount: 0,
          category: formData.category,
          start_date: formData.start_date.toISOString(),
          target_date: formData.target_date.toISOString(),
          status: 'active',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/goals/${goal.id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar meta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Nova Meta Financeira
        </Typography>

        <Paper sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Título da Meta"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Viagem para Europa"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Descrição"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva os detalhes da sua meta..."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Valor da Meta"
                  name="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: 'R$',
                  }}
                  placeholder="0,00"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Categoria"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data Inicial"
                  value={formData.start_date}
                  onChange={handleDateChange('start_date')}
                  sx={{ width: '100%' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data Final"
                  value={formData.target_date}
                  onChange={handleDateChange('target_date')}
                  sx={{ width: '100%' }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Criando...' : 'Criar Meta'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
} 