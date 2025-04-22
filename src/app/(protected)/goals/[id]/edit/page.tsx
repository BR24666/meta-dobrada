'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/types/database.types';

type FinancialGoal = Database['public']['Tables']['financial_goals']['Row'];

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

export default function EditGoalPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    category: '',
    start_date: new Date(),
    target_date: new Date(),
    status: 'active',
  });

  useEffect(() => {
    fetchGoal();
  }, [params.id]);

  const fetchGoal = async () => {
    try {
      const { data: goal, error: goalError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('id', params.id)
        .single();

      if (goalError) throw goalError;
      if (!goal) throw new Error('Meta não encontrada');

      setFormData({
        title: goal.title,
        description: goal.description || '',
        target_amount: goal.target_amount.toString(),
        category: goal.category,
        start_date: new Date(goal.start_date),
        target_date: new Date(goal.target_date),
        status: goal.status,
      });
    } catch (error: any) {
      console.error('Error fetching goal:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
      const { error: updateError } = await supabase
        .from('financial_goals')
        .update({
          title: formData.title,
          description: formData.description,
          target_amount: Number(formData.target_amount),
          category: formData.category,
          start_date: formData.start_date.toISOString(),
          target_date: formData.target_date.toISOString(),
          status: formData.status,
        })
        .eq('id', params.id);

      if (updateError) throw updateError;

      router.push(`/goals/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar meta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Delete all transactions first
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .eq('goal_id', params.id);

      if (transactionsError) throw transactionsError;

      // Then delete the goal
      const { error: goalError } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', params.id);

      if (goalError) throw goalError;

      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir meta');
    }
  };

  if (loading) return <Typography>Carregando...</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Editar Meta
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="active">Ativa</MenuItem>
                  <MenuItem value="completed">Concluída</MenuItem>
                  <MenuItem value="cancelled">Cancelada</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => setOpenDeleteDialog(true)}
                  >
                    Excluir Meta
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
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
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita e todas as transações associadas serão excluídas.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
} 