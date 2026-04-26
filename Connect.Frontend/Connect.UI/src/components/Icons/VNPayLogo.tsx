import React from 'react';
import vnpayLogo from '../../assets/vnpay-logo.png';

export const VNPayLogo = ({ size = '1em', ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { size?: number | string }) => (
  <img 
    src={vnpayLogo} 
    alt="VNPAY" 
    style={{ width: size, height: size, objectFit: 'contain' }}
    {...props}
  />
);
