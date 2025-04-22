'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { useAuth } from '@/hooks/useAuth';

type FinancialGoal = Database['public']['Tables']['financial_goals']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

export default function GoalDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [goal, setGoal] = useState<FinancialGoal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [transactionData, setTransactionData] = useState({
    amount: '',
    type: 'deposit',
    description: '',
  });

  useEffect(() => {
    fetchGoalAndTransactions();
  }, [params.id]);

  const fetchGoalAndTransactions = async () => {
    try {
      // Fetch goal details
      const { data: goalData, error: goalError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('id', params.id)
        .single();

      if (goalError) throw goalError;
      setGoal(goalData);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('goal_id', params.id)
        .order('transaction_date', { ascending: false });

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async () => {
    if (!goal || !user) return;

    try {
      const amount = Number(transactionData.amount);
      if (amount <= 0) {
        setError('O valor deve ser maior que zero');
        return;
      }

      const newAmount = transactionData.type === 'deposit' 
        ? goal.current_amount + amount
        : goal.current_amount - amount;

      // Start transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            goal_id: goal.id,
            user_id: user.id,
            amount,
            type: transactionData.type,
            description: transactionData.description,
          },
        ]);

      if (transactionError) throw transactionError;

      // Update goal amount
      const { error: updateError } = await supabase
        .from('financial_goals')
        .update({ current_amount: newAmount })
        .eq('id', goal.id);

      if (updateError) throw updateError;

      // Check if goal is completed
      if (newAmount >= goal.target_amount) {
        await supabase
          .from('financial_goals')
          .update({ status: 'completed' })
          .eq('id', goal.id);

        // Create completion notification
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: user.id,
              title: 'Meta Alcançada! 🎉',
              message: `Parabéns! Você atingiu sua meta "${goal.title}"!`,
              type: 'achievement',
            },
          ]);
      }

      setOpenTransactionDialog(false);
      setTransactionData({ amount: '', type: 'deposit', description: '' });
      fetchGoalAndTransactions();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) return <LinearProgress />;
  if (!goal) return <Typography>Meta não encontrada</Typography>;

  const progress = (goal.current_amount / goal.target_amount) * 100;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {goal.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => router.push(`/goals/${goal.id}/edit`)}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenTransactionDialog(true)}
          >
            Nova Transação
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Descrição
                </Typography>
                <Typography variant="body1" paragraph>
                  {goal.description || 'Sem descrição'}
                </Typography>

                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Categoria
                </Typography>
                <Chip label={goal.category} sx={{ mb: 2 }} />

                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  color={
                    goal.status === 'completed'
                      ? 'success'
                      : goal.status === 'active'
                      ? 'primary'
                      : 'error'
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Progresso
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
                    </Typography>
                    <Typography variant="body2">{Math.round(progress)}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Período
                </Typography>
                <Typography variant="body1">
                  {formatDate(goal.start_date)} até {formatDate(goal.target_date)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Transações
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Descrição</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Nenhuma transação registrada
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type === 'deposit' ? 'Depósito' : 'Retirada'}
                          color={transaction.type === 'deposit' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* New Transaction Dialog */}
      <Dialog open={openTransactionDialog} onClose={() => setOpenTransactionDialog(false)}>
        <DialogTitle>Nova Transação</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Valor"
            type="number"
            value={transactionData.amount}
            onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Tipo"
            value={transactionData.type}
            onChange={(e) => setTransactionData({ ...transactionData, type: e.target.value as 'deposit' | 'withdrawal' })}
            sx={{ mt: 2 }}
          >
            <MenuItem value="deposit">Depósito</MenuItem>
            <MenuItem value="withdrawal">Retirada</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Descrição"
            value={transactionData.description}
            onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransactionDialog(false)}>Cancelar</Button>
          <Button onClick={handleTransactionSubmit} variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 