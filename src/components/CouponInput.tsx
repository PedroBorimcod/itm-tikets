import { useState } from 'react';
import { Tag, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useCoupons } from '@/hooks/useCoupons';

interface CouponInputProps {
  purchaseAmount: number;
  onCouponApply: (coupon: any, discount: number) => void;
  onCouponRemove: () => void;
  appliedCoupon?: any;
}

export function CouponInput({ 
  purchaseAmount, 
  onCouponApply, 
  onCouponRemove, 
  appliedCoupon 
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('');
  const [showInput, setShowInput] = useState(false);
  const { loading, validateCoupon, calculateDiscount } = useCoupons();

  const handleApplyCoupon = async () => {
    const coupon = await validateCoupon(couponCode, purchaseAmount);
    if (coupon) {
      const discount = calculateDiscount(coupon, purchaseAmount);
      onCouponApply(coupon, discount);
      setCouponCode('');
      setShowInput(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemove();
    setCouponCode('');
    setShowInput(false);
  };

  if (appliedCoupon) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{appliedCoupon.name}</p>
                <p className="text-sm text-green-600">
                  Código: {appliedCoupon.code}
                </p>
                {appliedCoupon.description && (
                  <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoupon}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showInput) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowInput(true)}
        className="w-full flex items-center space-x-2"
      >
        <Tag className="h-4 w-4" />
        <span>Tenho um cupom de desconto</span>
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4" />
          <span className="font-medium">Cupom de desconto</span>
        </div>
        <div className="flex space-x-2">
          <Input
            placeholder="Digite o código do cupom"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
          />
          <Button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || loading}
            size="sm"
          >
            {loading ? 'Validando...' : 'Aplicar'}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInput(false)}
          className="w-full"
        >
          Cancelar
        </Button>
      </CardContent>
    </Card>
  );
}