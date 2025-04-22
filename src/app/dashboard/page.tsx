'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Tab,
  Tabs,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TimelineIcon from '@mui/icons-material/Timeline';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const metrics = [
    {
      title: 'Saldo Total',
      value: 'R$ 10.000,00',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      trend: '+5.2%',
    },
    {
      title: 'Lucro/Prejuízo',
      value: 'R$ 2.500,00',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      trend: '+12.3%',
    },
    {
      title: 'Taxa de Acerto',
      value: '68%',
      icon: <ShowChartIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      trend: '+2.1%',
    },
    {
      title: 'Total de Operações',
      value: '156',
      icon: <TimelineIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      trend: '+24',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Métricas */}
      <Grid container spacing={3} mb={4}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  {metric.icon}
                  <Typography variant="caption" color="success.main">
                    {metric.trend}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                  {metric.value}
                </Typography>
                <Typography color="text.secondary">
                  {metric.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs e Conteúdo */}
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Visão Geral" />
          <Tab label="Operações" />
          <Tab label="Análises" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 400,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Evolução do Saldo
                </Typography>
                {/* TODO: Adicionar gráfico de linha */}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 400,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Distribuição por Estratégia
                </Typography>
                {/* TODO: Adicionar gráfico de pizza */}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Últimas Operações
          </Typography>
          {/* TODO: Adicionar tabela de operações */}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Análise de Performance
          </Typography>
          {/* TODO: Adicionar métricas avançadas e gráficos */}
        </TabPanel>
      </Paper>
    </Container>
  );
} 