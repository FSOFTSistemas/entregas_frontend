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
import { useNavigate } from 'react-router-dom';

const formatCurrency = (value) => {
  if (isNaN(value)) return '-';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    em_transito: 0,
    entregues: 0,
    canceladas: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entregaParaExcluir, setEntregaParaExcluir] = useState(null);

  useEffect(() => {
    fetchEntregas();
  }, []);

  const fetchEntregas = async () => {
    try {
      const response = await axios.get('https://www.gestao-api.dev.br:4100/api/entregas');
      const entregasData = response.data;
      setEntregas(entregasData);

      // Calcular estatísticas
      const stats = entregasData.reduce((acc, entrega) => {
        acc.total++;
        acc[entrega.status]++;
        return acc;
      }, {
        total: 0,
        pendente: 0,
        em_transito: 0,
        entregue: 0,
        cancelada: 0
      });

      setStats(stats);
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarSelecionarEntrega = async (entregaId) => {
    try {
      const entrega = entregas.find(e => e.id === entregaId);
      if (!entrega) return;

      await axios.put(`https://www.gestao-api.dev.br:4100/api/entregas/${entregaId}`, {
        produto_id: entrega.produto_id,
        quantidade: entrega.quantidade,
        descricao: entrega.descricao,
        cliente: entrega.cliente,
        data: entrega.data,
        status: 'entregue',
        entregador_id: user.id
      });
      fetchEntregas();
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar entrega:', error);
    }
  };

  const handleSelecionarEntrega = (entrega) => {
    setSelectedEntrega(entrega);
    setIsConfirmModalOpen(true);
  };

  const handleExcluirEntrega = (entrega) => {
    setEntregaParaExcluir(entrega);
    setIsDeleteModalOpen(true);
  };

  const confirmarExclusaoEntrega = async () => {
    if (!entregaParaExcluir) return;
    try {
      await axios.delete(`https://www.gestao-api.dev.br:4100/api/entregas/${entregaParaExcluir.id}`);
      fetchEntregas();
      setIsDeleteModalOpen(false);
      setEntregaParaExcluir(null);
    } catch (error) {
      console.error('Erro ao excluir entrega:', error);
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


  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const dateIso = dateString.replace(' ', 'T');
    const date = new Date(dateIso);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const entregasPendentes = entregas.filter(e => e.status === 'pendente');
  const entregasEntregues = entregas.filter(e => {
    if (user?.tipo_usuario === 'entregador') {
      return e.status === 'entregue' && e.entregador_id === user.id;
    }
    return e.status === 'entregue';
  });

  return (
    <>
      {isDeleteModalOpen && entregaParaExcluir && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Confirmar Exclusão</h2>
            <p className="mb-4">
              Tem certeza que deseja excluir a entrega <strong>{entregaParaExcluir.descricao}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={confirmarExclusaoEntrega}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {isConfirmModalOpen && selectedEntrega && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-30 flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Confirmar Entrega</h2>
              <p className="mb-4">
                Tem certeza que deseja marcar a entrega <strong>{selectedEntrega.descricao}</strong> como <strong>entregue</strong>?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded"
                  onClick={() => confirmarSelecionarEntrega(selectedEntrega.id)}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user?.tipo_usuario === 'admin' && (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => navigate('/nova-entrega')}>
                Nova Entrega
              </Button>
            </div>
          )}
          <p className="text-muted-foreground">
            Visão geral das entregas e estatísticas
          </p>
        </div>


        {user?.tipo_usuario !== 'entregador' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-2 sm:p-4" style={{ minHeight: 'auto' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm sm:text-base font-medium leading-none">Total de Entregas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold leading-none">{stats.total}</div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight" style={{ padding: 0 }}>
                  Todas as entregas registradas
                </p>
              </CardContent>
            </Card>
            <Card className="p-2 sm:p-4" style={{ minHeight: 'auto' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm sm:text-base font-medium leading-none">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold leading-none">{stats.pendente}</div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight" style={{ padding: 0 }}>
                  Aguardando processamento
                </p>
              </CardContent>
            </Card>
            <Card className="p-2 sm:p-4" style={{ minHeight: 'auto' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm sm:text-base font-medium leading-none">Entregues</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold leading-none">{stats.entregue}</div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight" style={{ padding: 0 }}>
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
                      <div key={entrega.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(entrega.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Descricao:
                          </p>
                          <CardTitle>{entrega.descricao || 'Não informado'}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Produto: {entrega.produto.descricao || 'Não informado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: {entrega.quantidade}
                          </p>
                          {user?.tipo_usuario !== 'entregador' && (
                            <p className="text-sm text-muted-foreground">
                              Total: {formatCurrency(entrega.quantidade * entrega.produto.preco_venda)}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground w-full">
                            Data: {formatDateTime(entrega.createdAt)}
                          </p>
                        </div>
                        <div className="w-full md:w-auto mt-4 md:mt-0">
                          <button
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded text-lg w-full md:w-auto"
                            onClick={() => handleSelecionarEntrega(entrega)}
                          >
                            Selecionar
                          </button>
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
                      <div key={entrega.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(entrega.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Descricao:
                          </p>
                          <CardTitle>{entrega.descricao || 'Não informado'}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Produto: {entrega.produto.descricao || 'Não informado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: {entrega.quantidade}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Entregador: {entrega.entregador?.nome || 'Não informado'}
                          </p>
                          {user?.tipo_usuario !== 'entregador' && (
                            <p className="text-sm text-muted-foreground">
                              Total: {formatCurrency(entrega.quantidade * entrega.produto.preco_venda)}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground w-full">
                            Data: {formatDateTime(entrega.updatedAt)}
                          </p>
                        </div>
                        {user?.tipo_usuario === 'admin' && (
                          <div className="w-full md:w-auto mt-4 md:mt-0">
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded text-lg w-full md:w-auto"
                              onClick={() => handleExcluirEntrega(entrega)}
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Dashboard;
