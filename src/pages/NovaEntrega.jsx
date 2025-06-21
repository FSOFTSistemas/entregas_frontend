import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactSelect from 'react-select';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../components/ui/dialog'; // ajuste o caminho conforme seu projeto

export default function NovaEntrega() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState([]);
  const [formData, setFormData] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
  const [cliente, setCliente] = useState('');
  const [descricao, setDescricao] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const response = await axios.get('http://localhost:4100/api/produtos');
        setProdutos(response.data);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      }
    }
    fetchProdutos();
  }, []);

  const addProduto = () => {
    if (!produtoSelecionado) return;
    setFormData([...formData, { produto_id: produtoSelecionado.value, quantidade: quantidadeSelecionada }]);
    setProdutoSelecionado(null);
    setQuantidadeSelecionada(1);
  };

  const removeProduto = (index) => {
    const newForm = [...formData];
    newForm.splice(index, 1);
    setFormData(newForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = {
        produtos: formData.map(p => ({
          produto_id: p.produto_id,
          quantidade: parseInt(p.quantidade)
        })),
        cliente,
        descricao,
        data: new Date().toISOString(),
        status: 'pendente',
      };

      if (formData.length === 1) {
        data.produto_id = formData[0].produto_id;
        data.quantidade = parseInt(formData[0].quantidade);
      }

      await axios.post('http://localhost:4100/api/entregas', data);

      // Mostrar modal de sucesso
      setShowSuccessModal(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar entrega');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Button variant="outline" className="mb-4" onClick={() => navigate('/inicio')}>
        Voltar para Início
      </Button>
      <h1 className="text-2xl font-bold mb-4">Nova Entrega</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="descricao">Descrição da entrega</Label>
          <Input
            id="descricao"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Descrição geral da entrega"
            disabled={isSubmitting}
          />
        </div>

        <div className="w-full flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="produto_selecionado">Produto</Label>
            <ReactSelect
              inputId="produto_selecionado"
              options={produtos.map(produto => ({
                value: produto.id.toString(),
                label: produto.descricao
              }))}
              value={produtoSelecionado}
              onChange={setProdutoSelecionado}
              isDisabled={isSubmitting}
              placeholder="Selecione o produto"
              isClearable
            />
            <div className="mt-2">
              <Label htmlFor="quantidade_selecionada">Quantidade</Label>
              <Input
                id="quantidade_selecionada"
                type="number"
                min="1"
                value={quantidadeSelecionada}
                onChange={e => setQuantidadeSelecionada(Number(e.target.value))}
                disabled={isSubmitting}
                className="text-center"
              />
              {/* Botões + e - só em mobile */}
              <div className="flex gap-2 mt-2 md:hidden">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-1/2"
                  onClick={() => setQuantidadeSelecionada(Math.max(1, quantidadeSelecionada - 1))}
                  disabled={isSubmitting}
                >
                  -
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-1/2"
                  onClick={() => setQuantidadeSelecionada(quantidadeSelecionada + 1)}
                  disabled={isSubmitting}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <Button
                className="w-full md:w-auto"
                type="button"
                onClick={addProduto}
                disabled={isSubmitting || !produtoSelecionado || quantidadeSelecionada < 1}
              >
                + Adicionar Produto
              </Button>
            </div>
          </div>
        </div>

        {formData.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full table-auto border text-sm">
              <thead>
                <tr>
                  <th className="border px-1 py-1 text-left">Produto</th>
                  <th className="border px-1 py-1 text-left">Quantidade</th>
                  <th className="border px-1 py-1">Ações</th>
                </tr>
              </thead>
              <tbody>
                {formData.map((item, index) => {
                  const produtoSelecionado = produtos.find(p => p.id.toString() === item.produto_id);
                  return (
                    <tr key={index}>
                      <td className="border px-1 py-1">{produtoSelecionado ? produtoSelecionado.descricao : 'Não selecionado'}</td>
                      <td className="border px-1 py-1">{item.quantidade}</td>
                      <td className="border px-1 py-1 text-center">
                        <Button variant="destructive" size="sm" onClick={() => removeProduto(index)}>Remover</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <Label htmlFor="cliente">Cliente</Label>
          <Input
            id="cliente"
            value={cliente}
            onChange={e => setCliente(e.target.value)}
            placeholder="Nome do cliente (opcional)"
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={isSubmitting || formData.length === 0}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Entrega'}
          </Button>
        </div>
      </form>

      <Dialog open={showSuccessModal} onOpenChange={(open) => {
        setShowSuccessModal(open);
        if (!open) {
          setFormData([]);
          setCliente('');
          setDescricao('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sucesso</DialogTitle>
            <DialogDescription>Entrega criada com sucesso!</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => setShowSuccessModal(false)}>Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}