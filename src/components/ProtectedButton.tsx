
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ButtonProps } from '@/components/ui/button';

interface ProtectedButtonProps extends ButtonProps {
  requireAuth?: boolean;
}

const ProtectedButton = ({ requireAuth = true, children, onClick, ...props }: ProtectedButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (requireAuth && !user) {
      navigate('/auth');
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};

export default ProtectedButton;
