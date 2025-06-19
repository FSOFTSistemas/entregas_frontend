import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Truck, Loader2 } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-orange-300 via-orange-400 to-orange-500">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen">
      {/* Lado esquerdo - Imagem */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-left"
        style={{ backgroundImage: "url('/fundo.png')" }}
      ></div>

      {/* Lado direito - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center py-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
              <Truck className="h-10 w-10 text-orange-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-gray-900 tracking-tight">Sistema de Entregas</CardTitle>
            <CardDescription className="text-gray-700 mt-2">
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="rounded-lg">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-1">
                <Label htmlFor="email" className="font-semibold text-gray-800">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="password" className="font-semibold text-gray-800">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-300 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
