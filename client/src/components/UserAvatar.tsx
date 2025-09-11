import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Função auxiliar para gerar as iniciais a partir do nome
const getInitials = (name: string = '') => {
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Definimos as propriedades que nosso novo componente aceitará
interface UserAvatarProps {
  src?: string;      // A URL da imagem do avatar
  name?: string;     // O nome do usuário para gerar as iniciais
  className?: string; // Para permitir customização de tamanho, etc.
}

export const UserAvatar = ({ src, name, className }: UserAvatarProps) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
};