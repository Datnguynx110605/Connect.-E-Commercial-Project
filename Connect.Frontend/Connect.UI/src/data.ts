import { Product, Coupon, Order } from './types';

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max',
    category: 'iPhone',
    originalPrice: 29990000,
    salePrice: 27490000,
    soldAmount: 15400,
    stock: 50,
    isAppleVerified: true,
    images: [
      'https://images.unsplash.com/photo-1696446701796-da61225697cb?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1696446702330-10dd8404a571?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Được rèn từ titan, trang bị chip A17 Pro đột phá, nút Tác Vụ tùy chỉnh, và hệ thống camera mạnh mẽ nhất trên iPhone.',
    ramOptions: ['8GB'],
    romOptions: ['256GB', '512GB', '1TB'],
    colorOptions: ['Titan Tự Nhiên', 'Titan Xanh', 'Titan Trắng', 'Titan Đen'],
    feedbacks: [
      {
        id: 'f1',
        userId: 'u2',
        username: 'Alex Doe',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        rating: 5,
        comment: 'Rất thích lớp phủ titan mới. Cầm rất nhẹ!',
        createdAt: '2023-10-15T10:00:00Z',
      }
    ]
  },
  {
    id: 'p2',
    name: 'MacBook Pro 16-inch (M3 Max)',
    category: 'Mac',
    originalPrice: 87490000,
    salePrice: 84990000,
    soldAmount: 4200,
    stock: 15,
    isAppleVerified: true,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Chiếc Mac tiên tiến nhất. Được trang bị sức mạnh siêu việt của chip M3 Max.',
    ramOptions: ['36GB', '48GB', '64GB', '128GB'],
    romOptions: ['1TB', '2TB', '4TB', '8TB'],
    colorOptions: ['Đen Không Gian', 'Bạc'],
    feedbacks: []
  },
  {
    id: 'p3',
    name: 'Apple Watch Ultra 2',
    category: 'Watch',
    originalPrice: 19990000,
    salePrice: 18990000,
    soldAmount: 8900,
    stock: 0,
    isAppleVerified: true,
    images: [
      'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Chiếc Apple Watch mạnh mẽ và bền bỉ nhất. Thiết kế cho những chuyến thám hiểm ngoài trời.',
    colorOptions: ['Titan', 'Titan Đen'],
    feedbacks: []
  },
  {
    id: 'p4',
    name: 'iPad Pro 13-inch (M4)',
    category: 'iPad',
    originalPrice: 32490000,
    salePrice: 31250000,
    soldAmount: 6500,
    stock: 25,
    isAppleVerified: true,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Không tưởng tượng nổi. iPad Pro hoàn toàn mới với sức mạnh đáng kinh ngạc trong một thiết kế mỏng không tưởng.',
    romOptions: ['256GB', '512GB', '1TB', '2TB'],
    colorOptions: ['Đen Không Gian', 'Bạc'],
    feedbacks: []
  },
  {
    id: 'p5',
    name: 'AirPods Pro (Thế hệ 2)',
    category: 'AirPods',
    originalPrice: 6290000,
    salePrice: 4990000,
    soldAmount: 32000,
    stock: 100,
    isAppleVerified: true,
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Trải nghiệm âm thanh phong phú hơn, tính năng Chống Ồn Chủ Động mạnh gấp 2 lần.',
    feedbacks: []
  }
];

export const mockCoupons: Coupon[] = [
  {
    id: 'c1',
    code: 'APPLE10',
    discountPercentage: 10,
    minTotal: 5000000,
    quantity: 100,
  },
  {
    id: 'c2',
    code: 'CONNECT20',
    discountPercentage: 20,
    minTotal: 20000000,
    quantity: 50,
  }
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    userId: 'u1',
    items: [
      {
        id: 'i1',
        name: 'iPhone 15 Pro Max',
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cb?auto=format&fit=crop&q=80&w=1200',
        price: 27490000,
        quantity: 1,
        selectedColor: 'Titan Tự Nhiên',
        selectedRom: '256GB'
      }
    ],
    totalAmount: 27490000,
    shippingFee: 0,
    shippingMethod: 'Hỏa tốc',
    predictableDayOfArrival: '2026-05-05',
    paymentMethod: 'Apple Pay',
    status: 'completed',
    createdAt: '2026-04-10T10:00:00Z',
  }
];
