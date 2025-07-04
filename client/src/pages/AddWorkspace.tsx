import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';
import { useLocations } from '../contexts/LocationsContext';

const AddWorkspace = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { locationId } = useParams();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        capacity: '',
        pricePerHour: '',
        locationId: locationId || '',
    });

    const { locations: businessLocations } = useLocations();

    // Redirect if not authenticated or not a business
    if (!isAuthenticated || (user && user.tipo !== 'locador')) {
        navigate('/login');
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would make an API call
        console.log('Workspace data:', formData);
        navigate('/business/workspaces');
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <BusinessSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/business/workspaces')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">Adicionar Espaço</h1>
                                <p className="text-gray-600 text-sm">Crie um novo espaço de trabalho</p>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6">
                        <div className="max-w-2xl mx-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações do Espaço</CardTitle>
                                    <CardDescription>
                                        Preencha os detalhes do seu novo espaço de trabalho
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome do Espaço</Label>
                                            <Input
                                                id="name"
                                                placeholder="Ex: Sala de Reunião A"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Descrição</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Descreva as características do espaço..."
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="capacity">Capacidade</Label>
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    placeholder="Ex: 8"
                                                    value={formData.capacity}
                                                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="price">Preço por Hora (R$)</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Ex: 50.00"
                                                    value={formData.pricePerHour}
                                                    onChange={(e) => handleInputChange('pricePerHour', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location">Local</Label>
                                            <Select
                                                value={formData.locationId}
                                                onValueChange={(value) => handleInputChange('locationId', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um local" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {businessLocations.map(location => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.nomePredio}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => navigate('/business/workspaces')}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button type="submit" className="flex-1">
                                                <Save className="h-4 w-4 mr-2" />
                                                Salvar Espaço
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default AddWorkspace;
