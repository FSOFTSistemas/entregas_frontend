import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users,
  Building2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';



const Dashboard = () => {
  const { user } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    em_transito: 0,
    entregues: 0,
    canceladas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntregas();
  }, []);

  const fetchEntregas = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/entregas');
      const entregasData = response.data;
      setEntregas(entregasData);
      
      // Calcular estatísticas
      const stats = entregasData.reduce((acc, entrega) => {
        acc.total++;
        acc[entrega.status]++;
        return acc;
      }, {
        total: 0,
        pendentes: 0,
        em_transito: 0,
        entregues: 0,
        canceladas: 0
      });
      
      setStats(stats);
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendente: { variant: 'secondary', icon: Clock, label: 'Pendente' },
      em_transito: { variant: 'default', icon: Truck, label: 'Em Trânsito' },
      entregue: { variant: 'success', icon: CheckCircle, label: 'Entregue' },
      cancelada: { variant: 'destructive', icon: AlertCircle, label: 'Cancelada' }
    };

    const config = statusConfig[status] || statusConfig.pendente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const entregasPendentes = entregas.filter(e => e.status === 'pendente');
  const entregasEntregues = entregas.filter(e => e.status === 'entregue');
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das entregas e estatísticas
        </p>
      </div>


      {user?.tipo_usuario !== 'entregador' && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entregas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todas as entregas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando processamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.em_transito}</div>
            <p className="text-xs text-muted-foreground">
              A caminho do destino
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.entregues}</div>
            <p className="text-xs text-muted-foreground">
              Concluídas com sucesso
            </p>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Entregas Tabs */}
      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes">
            Pendentes ({entregasPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="entregues">
            Entregues ({entregasEntregues.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entregas Pendentes</CardTitle>
              <CardDescription>
                Entregas que precisam ser processadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entregasPendentes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma entrega pendente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entregasPendentes.map((entrega) => (
                    <div key={entrega.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{entrega.produto_descricao}</h4>
                          {getStatusBadge(entrega.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {entrega.cliente || 'Não informado'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {entrega.quantidade} • Data: {formatDate(entrega.data)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(entrega.preco_venda * entrega.quantidade)}</p>
                        <p className="text-sm text-muted-foreground">
                          {entrega.entregador_nome || 'Sem entregador'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entregues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entregas Concluídas</CardTitle>
              <CardDescription>
                Entregas que foram finalizadas com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entregasEntregues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma entrega concluída</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entregasEntregues.slice(0, 10).map((entrega) => (
                    <div key={entrega.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{entrega.produto_descricao}</h4>
                          {getStatusBadge(entrega.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {entrega.cliente || 'Não informado'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {entrega.quantidade} • Data: {formatDate(entrega.data)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(entrega.preco_venda * entrega.quantidade)}</p>
                        <p className="text-sm text-muted-foreground">
                          {entrega.entregador_nome || 'Sem entregador'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
