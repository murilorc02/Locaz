import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '../types';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('locatario');
    const [telephone, setTelephone] = useState('');
    const [document, setDocument] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signup } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword || !telephone || !document) {
            toast({
                title: "Erro",
                description: "Preencha todos os campos",
                variant: "destructive",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Erro",
                description: "Senhas não coincidem",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await signup(name, email, password, role, telephone, document);
            navigate('/');
            toast({
                title: "Sucesso",
                description: "Sua conta foi criada!",
            });
        } catch (error) {
            toast({
                title: "Falha no cadastro",
                description: error instanceof Error ? error.message : "Ocorreu um erro, tente novamente mais tarde",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md">
                <div className="rounded-lg border bg-card p-8 shadow-sm">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold">Crie uma Conta</h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Cadastre-se para começar a usar nossa plataforma
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    placeholder="Nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="seuemail@exemplo.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input
                                        id="password"
                                        placeholder="••••••••"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Repita a senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        placeholder="••••••••"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="telephone">Telefone</Label>
                                    <Input
                                        id="telephone"
                                        placeholder="(99) 99999-9999"
                                        type="tel"
                                        value={telephone}
                                        onChange={(e) => setTelephone(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="document">Documento</Label>
                                    <Input
                                        id="document"
                                        placeholder="CPF/CNPJ"
                                        value={document}
                                        onChange={(e) => setDocument(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo da Conta</Label>
                                <RadioGroup defaultValue="locatario" value={role} onValueChange={(value) => setRole(value as UserRole)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="locatario" id="locatario" />
                                        <Label htmlFor="locatario">Cliente (buscando espaços)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="locador" id="locador" />
                                        <Label htmlFor="locador">Negócio (vendendo espaços)</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <Button
                                className="w-full"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Criando Conta..." : "Criar Conta"}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        Já tem uma conta?{" "}
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            Faça login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
