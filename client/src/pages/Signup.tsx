import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useToast } from '../components/ui/use-toast';
import { UserRole } from '../types';

const Signup = async () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>('client');
    const [telephone, setTelephone] = useState('');
    const [document, setDocument] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signup } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        if (!name || !email || !password || !confirmPassword || !telephone || !document) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }
        return;
    }

    if (password !== confirmPassword) {
        toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    try {
        await signup(name, email, password, role, telephone, document);
        toast({
            title: "Success",
            description: "Your account has been created!",
        });
        navigate('/');
    } catch (error) {
        toast({
            title: "Signup failed",
            description: error instanceof Error ? error.message : "An error occurred",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }

    return (
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md">
                <div className="rounded-lg border bg-card p-8 shadow-sm">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold">Create an Account</h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Sign up to start using our platform
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="you@example.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
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
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
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
                                    <Label htmlFor="telephone">Telephone</Label>
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
                                    <Label htmlFor="document">Document</Label>
                                    <Input
                                        id="document"
                                        placeholder="CPF or CNPJ"
                                        value={document}
                                        onChange={(e) => setDocument(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Account Type</Label>
                                <RadioGroup defaultValue="client" value={role} onValueChange={(value) => setRole(value as UserRole)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="client" id="client" />
                                        <Label htmlFor="client">Client (looking for workspaces)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="business" id="business" />
                                        <Label htmlFor="business">Business (listing workspaces)</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <Button
                                className="w-full"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating account..." : "Create Account"}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
