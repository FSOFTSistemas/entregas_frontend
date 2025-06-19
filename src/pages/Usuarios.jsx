import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  Loader2,
  Mail,
  Shield,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UsuariosPage = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo_usuario: '',
    empresa_id: user?.empresa_id || ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    fetchUsuarios();
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/empresas/');
      setEmpresas(response.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários');
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
      };

      // Se estiver editando e não forneceu nova senha, remover do payload
      if (editingUsuario && !formData.senha) {
        delete data.senha;
      }

      if (editingUsuario) {
        await axios.put(`http://localhost:3001/api/usuarios/${editingUsuario.id}`, data);
      } else {
        await axios.post('http://localhost:3001/api/usuarios', data);
      }

      await fetchUsuarios();
      handleCloseDialog();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '', // Não preencher senha ao editar
      tipo_usuario: usuario.tipo_usuario,
      empresa_id: usuario.empresa_id.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/usuarios/${id}`);
      await fetchUsuarios();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao deletar usuário');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUsuario(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      tipo_usuario: '',
      empresa_id: user?.empresa_id || ''
    });
    setError('');
  };

  const getTipoUsuarioBadge = (tipo) => {
    const config = {
      master: { variant: 'destructive', label: 'Master', icon: Shield },
      admin: { variant: 'default', label: 'Admin', icon: User },
      entregador: { variant: 'secondary', label: 'Entregador', icon: User }
    };

    const { variant, label, icon: Icon } = config[tipo] || config.entregador;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUsuario
                  ? 'Atualize as informações do usuário'
                  : 'Adicione um novo usuário ao sistema'
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
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">
                  Senha {editingUsuario && '(deixe em branco para manter a atual)'}
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Senha"
                  required={!editingUsuario}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_usuario">Tipo de Usuário</Label>
                <Select
                  value={formData.tipo_usuario}
                  onValueChange={(value) => setFormData({ ...formData, tipo_usuario: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.tipo_usuario === 'master' && (
                      <SelectItem value="master">Master</SelectItem>
                    )}
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="entregador">Entregador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {user?.tipo_usuario === 'master' && (
                <div className="space-y-2">
                  <Label htmlFor="empresa_id">Empresa</Label>
                  <Select
                    value={formData.empresa_id}
                    onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id.toString()}>
                          {empresa.razao_social}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                    editingUsuario ? 'Atualizar' : 'Criar'
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
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsuarios.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </p>
          </div>
        ) : (
          filteredUsuarios.map((usuario) => (
            <Card key={usuario.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{usuario.nome}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {usuario.email}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(usuario)}
                      disabled={usuario.id === user?.id && usuario.tipo_usuario === 'master'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(usuario.id)}
                      disabled={usuario.id === user?.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tipo:</span>
                    {getTipoUsuarioBadge(usuario.tipo_usuario)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Empresa:</span>
                    <span className="text-sm">{usuario.razao_social}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Criado em:</span>
                    <span className="text-sm">
                      {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                    </span>
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

export default UsuariosPage;

