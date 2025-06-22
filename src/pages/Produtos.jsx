import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  Search,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Produtos = () => {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [formData, setFormData] = useState({
    descricao: '',
    preco_custo: '',
    preco_venda: '',
    estoque: '',
    empresa_id: user?.empresa_id || ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await api.get('/produtos');
      console.log(response.data);
      
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos');
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
        preco_custo: parseFloat(formData.preco_custo),
        preco_venda: parseFloat(formData.preco_venda),
        estoque: parseInt(formData.estoque),
        empresa_id: user?.empresa_id
      };

      if (editingProduto) {
        await api.put(`/produtos/${editingProduto.id}`, data);
      } else {
        await api.post('/produtos', data);
      }

      await fetchProdutos();
      handleCloseDialog();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setFormData({
      descricao: produto.descricao,
      preco_custo: produto.preco_custo.toString(),
      preco_venda: produto.preco_venda.toString(),
      estoque: produto.estoque.toString(),
      empresa_id: produto.empresa_id.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await api.delete(`/produtos/${id}`);
      await fetchProdutos();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao deletar produto');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduto(null);
    setFormData({
      descricao: '',
      preco_custo: '',
      preco_venda: '',
      estoque: '',
      empresa_id: user?.empresa_id || ''
    });
    setError('');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos da empresa
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduto ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
              <DialogDescription>
                {editingProduto 
                  ? 'Atualize as informações do produto'
                  : 'Adicione um novo produto ao catálogo'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição do produto"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preco_custo">Preço de Custo</Label>
                <Input
                  id="preco_custo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco_custo}
                  onChange={(e) => setFormData({...formData, preco_custo: e.target.value})}
                  placeholder="0,00"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preco_venda">Preço de Venda</Label>
                <Input
                  id="preco_venda"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco_venda}
                  onChange={(e) => setFormData({...formData, preco_venda: e.target.value})}
                  placeholder="0,00"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="markup">Markup (%)</Label>
                <Input
                  id="markup"
                  type="number"
                  step="0.01"
                  value={
                    formData.preco_custo && formData.preco_venda
                      ? (((parseFloat(formData.preco_venda) - parseFloat(formData.preco_custo)) / parseFloat(formData.preco_custo)) * 100).toFixed(2)
                      : ''
                  }
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estoque">Estoque</Label>
                <Input
                  id="estoque"
                  type="number"
                  min="0"
                  value={formData.estoque}
                  onChange={(e) => setFormData({...formData, estoque: e.target.value})}
                  placeholder="0"
                  required
                  disabled={isSubmitting}
                />
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
                    editingProduto ? 'Atualizar' : 'Criar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProdutos.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </p>
          </div>
        ) : (
          filteredProdutos.map((produto) => (
            <Card key={produto.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{produto.descricao}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(produto)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(produto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Custo:</span>
                    <span className="text-sm">{formatCurrency(produto.preco_custo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Venda:</span>
                    <span className="text-sm font-medium">{formatCurrency(produto.preco_venda)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estoque:</span>
                    <Badge variant={produto.estoque > 10 ? 'success' : produto.estoque > 0 ? 'secondary' : 'destructive'}>
                      {produto.estoque} unidades
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total (Custo):</span>
                    <span className="text-sm">{formatCurrency(produto.preco_custo * produto.estoque)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total (Venda):</span>
                    <span className="text-sm">{formatCurrency(produto.preco_venda * produto.estoque)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Produtos;
