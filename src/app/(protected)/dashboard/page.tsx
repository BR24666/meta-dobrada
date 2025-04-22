'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type FinancialGoal = Database['public']['Tables']['financial_goals']['Row'];

export default function DashboardPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/goals/new')}
        >
          Nova Meta
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total de Metas
            </Typography>
            <Typography variant="h4">{goals.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Metas Ativas
            </Typography>
            <Typography variant="h4">
              {goals.filter((goal) => goal.status === 'active').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Metas Concluídas
            </Typography>
            <Typography variant="h4">
              {goals.filter((goal) => goal.status === 'completed').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Total Economizado
            </Typography>
            <Typography variant="h4">
              {formatCurrency(
                goals.reduce((acc, goal) => acc + Number(goal.current_amount), 0)
              )}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Goals List */}
      <Typography variant="h5" sx={{ mb: 3 }}>
        Suas Metas
      </Typography>
      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        ) : goals.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                Você ainda não tem metas cadastradas.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/goals/new')}
                sx={{ mt: 2 }}
              >
                Criar Primeira Meta
              </Button>
            </Paper>
          </Grid>
        ) : (
          goals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                      {goal.title}
                    </Typography>
                    <Chip
                      label={goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      color={getStatusColor(goal.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {goal.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progresso</Typography>
                      <Typography variant="body2">
                        {formatCurrency(Number(goal.current_amount))} /{' '}
                        {formatCurrency(Number(goal.target_amount))}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(
                        Number(goal.current_amount),
                        Number(goal.target_amount)
                      )}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => router.push(`/goals/${goal.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
} 