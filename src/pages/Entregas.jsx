import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ReactSelect from 'react-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Truck,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const Entregas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // Removido estado do modal e edição
  const [error, setError] = useState('');
  // Removido estado de envio relacionado ao modal

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entregasRes, produtosRes, usuariosRes] = await Promise.all([
        axios.get('https://www.gestao-api.dev.br:4100/api/entregas'),
        axios.get('https://www.gestao-api.dev.br:4100/api/produtos'),
        axios.get('https://www.gestao-api.dev.br:4100/api/usuarios')
      ]);

      setEntregas(entregasRes.data);
      setProdutos(produtosRes.data);
      setUsuarios(usuariosRes.data.filter(u => u.tipo_usuario === 'entregador'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Removido handleSubmit e handleEdit relacionados ao modal

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta entrega?')) return;

    try {
      await axios.delete(`https://www.gestao-api.dev.br:4100/api/entregas/${id}`);
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao deletar entrega');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`https://www.gestao-api.dev.br:4100/api/entregas/${id}/status`, {
        status: newStatus
      });
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  // Removido handleCloseDialog

  const getStatusBadge = (status) => {
    const statusConfig = {
      pendente: { variant: 'secondary', icon: Clock, label: 'Pendente' },
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

  const filteredEntregas = entregas.filter(entrega => {
    const matchesSearch =
      (entrega.produto_descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entrega.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entrega.descricao || '').toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesStatus = statusFilter === 'all' || entrega.status === statusFilter;
  
    return matchesSearch && matchesStatus;
  });

  const entregasPorStatus = {
    pendente: entregas.filter(e => e.status === 'pendente'),
    entregue: entregas.filter(e => e.status === 'entregue'),
    cancelada: entregas.filter(e => e.status === 'cancelada')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <div className="flex-1 overflow-x-hidden">
      <style>{`
        * {
          word-break: break-word;
          overflow-wrap: anywhere;
        }
      `}</style>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Entregas</h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe todas as entregas
            </p>
          </div>

          <Button onClick={() => navigate('/nova-entrega')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Entrega
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar entregas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              Todas ({entregas.length})
            </TabsTrigger>
            <TabsTrigger value="pendente">
              Pendentes ({entregasPorStatus.pendente.length})
            </TabsTrigger>
            <TabsTrigger value="entregue">
              Entregues ({entregasPorStatus.entregue.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <EntregasList
              entregas={filteredEntregas}
              onEdit={() => {}}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </TabsContent>

          <TabsContent value="pendente">
            <EntregasList
              entregas={entregasPorStatus.pendente.filter(e =>
                (e.produto_descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (e.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (e.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
              )}
              onEdit={() => {}}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </TabsContent>

          <TabsContent value="entregue">
            <EntregasList
              entregas={entregasPorStatus.entregue.filter(e =>
                (e.produto_descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (e.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (e.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
              )}
              onEdit={() => {}}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Componente para listar entregas
const EntregasList = ({
  entregas,
  onEdit,
  onDelete,
  onStatusChange,
  getStatusBadge,
  formatDate,
  formatCurrency
}) => {
  if (entregas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma entrega encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entregas.map((entrega) => (
        <Card key={entrega.id} className="w-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusBadge(entrega.status)}
                </div>
                <CardTitle>{entrega.descricao}</CardTitle>
              </div>
              <div className="flex gap-1">
                {/* Removido botão de edição via modal */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(entrega.id)}
                  disabled={entrega.status === 'entregue'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cliente:</span>
                  <span>{entrega.cliente || 'Não informado'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span>{entrega.quantidade}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Data:</span>
                  <span>{formatDate(entrega.data)}</span>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                <div className="w-full">
                  <div className="text-sm w-full">
                    <span className="text-muted-foreground w-full">Entregador:</span>
                    <span className="ml-2 w-full">{entrega.entregador?.nome || 'Não atribuído'}</span>
                  </div>
                </div>
                <div className="w-full">
                  <div className="text-sm w-full">
                    <span className="text-muted-foreground w-full">Valor total:</span>
                    <span className="ml-2 font-medium w-full">
                      {formatCurrency(entrega.produto.preco_venda * entrega.quantidade)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Alterar Status:</Label>
                <Select
                  value={entrega.status}
                  onValueChange={(value) => onStatusChange(entrega.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Entregas;

