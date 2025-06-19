import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ReactSelect from 'react-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Truck,
  Search,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Calendar,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { data } from 'react-router-dom';

const Entregas = () => {
  const { user } = useAuth();
  const [entregas, setEntregas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntrega, setEditingEntrega] = useState(null);
  const [formData, setFormData] = useState({
    produto_id: '',
    quantidade: '1',
    descricao: '',
    cliente: '',
    data: new Date().toISOString().slice(0, 10),
    status: 'pendente',
    entregador_id: '',
    empresa_id: user?.empresa_id || ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entregasRes, produtosRes, usuariosRes] = await Promise.all([
        axios.get('http://localhost:3001/api/entregas'),
        axios.get('http://localhost:3001/api/produtos'),
        axios.get('http://localhost:3001/api/usuarios')
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        ...formData,
        quantidade: parseInt(formData.quantidade),
        empresa_id: user?.empresa_id,
        data: formData.data ? new Date(formData.data).toISOString() : null
      };
      console.log(data);

      if (editingEntrega) {
        await axios.put(`http://localhost:3001/api/entregas/${editingEntrega.id}`, data);
      } else {
        await axios.post('http://localhost:3001/api/entregas', data);
      }

      await fetchData();
      handleCloseDialog();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entrega) => {
    setEditingEntrega(entrega);
    setFormData({
      produto_id: entrega.produto_id.toString(),
      quantidade: entrega.quantidade.toString(),
      descricao: entrega.descricao,
      cliente: entrega.cliente || '',
      data: entrega.data.split('T')[0], // Formato YYYY-MM-DD
      status: entrega.status,
      entregador_id: entrega.entregador_id?.toString() || '',
      empresa_id: entrega.empresa_id.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta entrega?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/entregas/${id}`);
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao deletar entrega');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:3001/api/entregas/${id}/status`, {
        status: newStatus
      });
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEntrega(null);
    setFormData({
      produto_id: '',
      quantidade: '1',
      descricao: '',
      cliente: '',
      data: new Date().toISOString().slice(0, 19).replace('T', ' ').replace(/-/g, '-'),
      status: 'pendente',
      entregador_id: '',
      empresa_id: user?.empresa_id || ''
    });
    setError('');
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
    em_transito: entregas.filter(e => e.status === 'em_transito'),
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Entregas</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe todas as entregas
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Entrega
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEntrega ? 'Editar Entrega' : 'Nova Entrega'}
              </DialogTitle>
              <DialogDescription>
                {editingEntrega
                  ? 'Atualize as informações da entrega'
                  : 'Registre uma nova entrega no sistema'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="produto_id" className="text-lg font-semibold">
                    Produto
                  </Label>
                  <ReactSelect
                    inputId="produto_id"
                    options={produtos.map(produto => ({
                      value: produto.id.toString(),
                      label: `${produto.descricao} (Estoque: ${produto.estoque})`
                    }))}
                    value={
                      produtos
                        .map(produto => ({
                          value: produto.id.toString(),
                          label: `${produto.descricao} (Estoque: ${produto.estoque})`
                        }))
                        .find(option => option.value === formData.produto_id) || null
                    }
                    onChange={(selectedOption) =>
                      setFormData({ ...formData, produto_id: selectedOption ? selectedOption.value : '' })
                    }
                    isDisabled={isSubmitting}
                    placeholder="Selecione o produto"
                    isClearable
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    placeholder="0"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição da entrega"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="cliente"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    placeholder="Nome do cliente (opcional)"
                    disabled={isSubmitting}
                  />
                </div>

                

              
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingEntrega ? 'Atualizar' : 'Criar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
            <SelectItem value="em_transito">Em Trânsito</SelectItem>
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
          <TabsTrigger value="em_transito">
            Em Trânsito ({entregasPorStatus.em_transito.length})
          </TabsTrigger>
          <TabsTrigger value="entregue">
            Entregues ({entregasPorStatus.entregue.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <EntregasList
            entregas={filteredEntregas}
            onEdit={handleEdit}
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        </TabsContent>

        <TabsContent value="em_transito">
          <EntregasList
            entregas={entregasPorStatus.em_transito.filter(e =>
              (e.produto_descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (e.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (e.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
            )}
            onEdit={handleEdit}
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        </TabsContent>
      </Tabs>
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
        <Card key={entrega.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{entrega.produto_descricao}</CardTitle>
                  {getStatusBadge(entrega.status)}
                </div>
                <CardDescription>{entrega.descricao}</CardDescription>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(entrega)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Entregador:</span>
                  <span className="ml-2">{entrega.entregador_nome || 'Não atribuído'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Valor total:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(entrega.preco_venda * entrega.quantidade)}
                  </span>
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
                    <SelectItem value="em_transito">Em Trânsito</SelectItem>
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

