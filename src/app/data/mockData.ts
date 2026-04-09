export type PropertyType = 'apartment' | 'villa' | 'duplex' | 'office' | 'chalet';
export type PropertyStatus = 'for-sale' | 'for-rent' | 'sold' | 'rented';
export type RequestStatus = 'pending' | 'under-review' | 'approved' | 'rejected' | 'completed';

export type PaymentType = 'cash' | 'installment';

export interface PaymentOptions {
  type: PaymentType;
  downPayment?: number;
  installmentMonths?: number;
  monthlyPayment?: number;
}

export interface Property {
  id: string;
  title: string;
  titleAr: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  location: string;
  address: string;
  description: string;
  descriptionAr: string;
  image: string;
  images: string[];
  featured: boolean;
  createdAt: string;
  sellerId?: string;
  adminId?: string;
  adCode?: string;
  paymentOptions?: PaymentOptions[];
  priceHistory?: { date: string; price: number }[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  propertyId?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super-admin' | 'admin' | 'user';
  avatar: string;
  createdAt: string;
  isSuperAdmin?: boolean;
}

export interface Request {
  id: string;
  type: 'buy' | 'sell' | 'inquiry';
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  propertyId?: string;
  propertyTitle?: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export const PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Luxury Apartment - Sidi Gaber',
    titleAr: 'شقة فاخرة - سيدي جابر',
    type: 'apartment',
    status: 'for-sale',
    price: 3500000,
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
    floor: 7,
    location: 'سيدي جابر، الإسكندرية',
    address: 'شارع الجيش، سيدي جابر، الإسكندرية',
    description: 'شقة فاخرة بإطلالة بحرية رائعة في قلب الإسكندرية',
    descriptionAr: 'شقة فاخرة بإطلالة بحرية رائعة في قلب الإسكندرية، تشطيب سوبر لوكس، موقع متميز',
    image: 'https://images.unsplash.com/photo-1762059976893-e73c45e867e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1762059976893-e73c45e867e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      'https://images.unsplash.com/photo-1660611656071-a8bef0578874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: true,
    createdAt: '2024-01-15',
    adminId: 'u1',
    adCode: 'AD-2024-001',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 700000, installmentMonths: 48, monthlyPayment: 58333 }
    ],
    priceHistory: [
      { date: '2023-12-01', price: 3200000 },
      { date: '2024-01-01', price: 3500000 }
    ]
  },
  {
    id: 'p2',
    title: 'Modern Villa - Smouha',
    titleAr: 'فيلا عصرية - سموحة',
    type: 'villa',
    status: 'for-sale',
    price: 8500000,
    area: 450,
    bedrooms: 5,
    bathrooms: 4,
    location: 'سموحة، الإسكندرية',
    address: 'شارع النصر، سموحة، الإسكندرية',
    description: 'فيلا فاخرة بتصميم عصري مع حديقة وبسينة خاصة',
    descriptionAr: 'فيلا فاخرة بتصميم عصري مع حديقة وبسينة خاصة، تشطيب ممتاز، حراسة 24 ساعة',
    image: 'https://images.unsplash.com/photo-1761158494764-bbf2a2e2a70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1761158494764-bbf2a2e2a70d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: true,
    createdAt: '2024-01-20',
    adminId: 'u5',
    adCode: 'AD-2024-002',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 2000000, installmentMonths: 60, monthlyPayment: 108333 }
    ],
    priceHistory: [
      { date: '2023-11-15', price: 8000000 },
      { date: '2024-01-15', price: 8500000 }
    ]
  },
  {
    id: 'p3',
    title: 'Sea View Apartment - Stanly',
    titleAr: 'شقة إطلالة بحر - ستانلي',
    type: 'apartment',
    status: 'for-rent',
    price: 15000,
    area: 120,
    bedrooms: 2,
    bathrooms: 1,
    floor: 5,
    location: 'ستانلي، الإسكندرية',
    address: 'كورنيش ستانلي، الإسكندرية',
    description: 'شقة بإطلالة بحرية مباشرة في منطقة ستانلي',
    descriptionAr: 'شقة بإطلالة بحرية مباشرة في منطقة ستانلي الراقية، مفروشة بالكامل',
    image: 'https://images.unsplash.com/photo-1662749518398-1b429b4fee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1662749518398-1b429b4fee67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: true,
    createdAt: '2024-02-01',
    adminId: 'u6',
    adCode: 'AD-2024-003',
    paymentOptions: [{ type: 'cash' }]
  },
  {
    id: 'p4',
    title: 'Luxury Penthouse - Gleem',
    titleAr: 'بنتهاوس فاخر - جليم',
    type: 'apartment',
    status: 'for-sale',
    price: 12000000,
    area: 300,
    bedrooms: 4,
    bathrooms: 3,
    floor: 12,
    location: 'جليم، الإسكندرية',
    address: 'شارع جليم، الإسكندرية',
    description: 'بنتهاوس فاخر بإطلالة 360 درجة على البحر الأبيض المتوسط',
    descriptionAr: 'بنتهاوس فاخر بإطلالة 360 درجة على البحر الأبيض المتوسط، تراس واسع، جاكوزي',
    image: 'https://images.unsplash.com/photo-1760611656071-a8bef0578874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1760611656071-a8bef0578874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: true,
    createdAt: '2024-02-05',
    adminId: 'u1',
    adCode: 'AD-2024-004',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 3000000, installmentMonths: 60, monthlyPayment: 150000 }
    ],
    priceHistory: [
      { date: '2023-12-01', price: 11000000 },
      { date: '2024-02-01', price: 12000000 }
    ]
  },
  {
    id: 'p5',
    title: 'Commercial Office - Miami',
    titleAr: 'مكتب تجاري - ميامي',
    type: 'office',
    status: 'for-rent',
    price: 25000,
    area: 200,
    bedrooms: 0,
    bathrooms: 2,
    floor: 3,
    location: 'ميامي، الإسكندرية',
    address: 'شارع المينا، ميامي، الإسكندرية',
    description: 'مكتب تجاري راقي في منطقة ميامي الحيوية',
    descriptionAr: 'مكتب تجاري راقي في منطقة ميامي الحيوية، تشطيب فندقي، مواقف سيارات',
    image: 'https://images.unsplash.com/photo-1656646424531-cc9041d3e5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1656646424531-cc9041d3e5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: false,
    createdAt: '2024-02-10',
    adminId: 'u5',
    adCode: 'AD-2024-005',
    paymentOptions: [{ type: 'cash' }]
  },
  {
    id: 'p6',
    title: 'Duplex - Mandara',
    titleAr: 'دوبلكس - المندرة',
    type: 'duplex',
    status: 'for-sale',
    price: 5200000,
    area: 280,
    bedrooms: 4,
    bathrooms: 3,
    floor: 8,
    location: 'المندرة، الإسكندرية',
    address: 'شارع الجيش، المندرة، الإسكندرية',
    description: 'دوبلكس فاخر بتصميم عصري في المندرة البحرية',
    descriptionAr: 'دوبلكس فاخر بتصميم عصري في المندرة البحرية، مع تراس وإطلالة رائعة',
    image: 'https://images.unsplash.com/photo-1688469625388-e6f8d43df357?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1688469625388-e6f8d43df357?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: false,
    createdAt: '2024-02-15',
    adminId: 'u6',
    adCode: 'AD-2024-006',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 1000000, installmentMonths: 36, monthlyPayment: 116666 }
    ]
  },
  {
    id: 'p7',
    title: 'Modern Building - Cleopatra',
    titleAr: 'عقار عصري - كليوباترا',
    type: 'apartment',
    status: 'for-sale',
    price: 4100000,
    area: 160,
    bedrooms: 3,
    bathrooms: 2,
    floor: 4,
    location: 'كليوباترا، الإسكندرية',
    address: 'شارع كليوباترا، الإسكندرية',
    description: 'شقة عصرية في موقع استراتيجي بكليوباترا',
    descriptionAr: 'شقة عصرية في موقع استراتيجي بكليوباترا، قريبة من الخدمات والمواصلات',
    image: 'https://images.unsplash.com/photo-1761688145251-3745c842d766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1761688145251-3745c842d766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: false,
    createdAt: '2024-03-01',
    adminId: 'u1',
    adCode: 'AD-2024-007',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 800000, installmentMonths: 36, monthlyPayment: 91666 }
    ]
  },
  {
    id: 'p8',
    title: 'Chalet - Agami',
    titleAr: 'شاليه - العجمي',
    type: 'chalet',
    status: 'for-sale',
    price: 2800000,
    area: 130,
    bedrooms: 3,
    bathrooms: 2,
    location: 'العجمي، الإسكندرية',
    address: 'شاطئ العجمي، الإسكندرية',
    description: 'شاليه ساحلي رائع في منطقة العجمي الهادئة',
    descriptionAr: 'شاليه ساحلي رائع في منطقة العجمي الهادئة، مع إطلالة مباشرة على الشاطئ',
    image: 'https://images.unsplash.com/photo-1762059976893-e73c45e867e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    images: [
      'https://images.unsplash.com/photo-1762059976893-e73c45e867e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    ],
    featured: false,
    createdAt: '2024-03-05',
    adminId: 'u5',
    adCode: 'AD-2024-008',
    paymentOptions: [
      { type: 'cash' },
      { type: 'installment', downPayment: 500000, installmentMonths: 24, monthlyPayment: 95833 }
    ]
  },
];

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'عمرو أحمد',
    email: 'admin@estate.com',
    phone: '+20 1281378331',
    role: 'super-admin',
    avatar: 'EA',
    createdAt: '2024-01-01',
    isSuperAdmin: true,
  },
  {
    id: 'u5',
    name: 'خالد محمود',
    email: 'khaled@estate.com',
    phone: '+20 1234567890',
    role: 'admin',
    avatar: 'KM',
    createdAt: '2024-01-05',
  },
  {
    id: 'u6',
    name: 'فاطمة حسن',
    email: 'fatma@estate.com',
    phone: '+20 1098765432',
    role: 'admin',
    avatar: 'FH',
    createdAt: '2024-01-08',
  },
  {
    id: 'u2',
    name: 'أحمد محمد',
    email: 'user@example.com',
    phone: '+20 1001234567',
    role: 'user',
    avatar: 'AM',
    createdAt: '2024-01-10',
  },
  {
    id: 'u3',
    name: 'سارة علي',
    email: 'sara@example.com',
    phone: '+20 1112345678',
    role: 'user',
    avatar: 'SA',
    createdAt: '2024-01-15',
  },
  {
    id: 'u4',
    name: 'محمد حسين',
    email: 'mhossein@example.com',
    phone: '+20 1223456789',
    role: 'user',
    avatar: 'MH',
    createdAt: '2024-02-01',
  },
];

export const REQUESTS: Request[] = [
  {
    id: 'r1',
    type: 'buy',
    userId: 'u2',
    userName: 'أحمد محمد',
    userEmail: 'user@example.com',
    userPhone: '+20 1001234567',
    propertyId: 'p1',
    propertyTitle: 'شقة فاخرة - سيدي جابر',
    message: 'أرغب في شراء هذه الشقة، أرجو التواصل معي',
    status: 'under-review',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-02',
  },
  {
    id: 'r2',
    type: 'inquiry',
    userId: 'u3',
    userName: 'سارة علي',
    userEmail: 'sara@example.com',
    userPhone: '+20 1112345678',
    propertyId: 'p3',
    propertyTitle: 'شقة إطلالة بحر - ستانلي',
    message: 'هل الشقة متاحة للإيجار الصيفي؟ وما هي الشروط؟',
    status: 'pending',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05',
  },
  {
    id: 'r3',
    type: 'sell',
    userId: 'u4',
    userName: 'محمد حسين',
    userEmail: 'mhossein@example.com',
    userPhone: '+20 1223456789',
    message: 'لدي شقة 150 متر في الإبراهيمية للبيع، 3 غرف، الطابق الثاني، تشطيب ممتاز',
    status: 'approved',
    createdAt: '2024-02-20',
    updatedAt: '2024-02-25',
  },
  {
    id: 'r4',
    type: 'buy',
    userId: 'u2',
    userName: 'أحمد محمد',
    userEmail: 'user@example.com',
    userPhone: '+20 1001234567',
    propertyId: 'p4',
    propertyTitle: 'بنتهاوس فاخر - جليم',
    message: 'مهتم بالبنتهاوس، هل يمكن تقسيط الثمن؟',
    status: 'pending',
    createdAt: '2024-03-08',
    updatedAt: '2024-03-08',
  },
];

export const CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'c1',
    name: 'كريم عبدالله',
    email: 'karim@example.com',
    phone: '+20 1001111111',
    subject: 'استفسار عن عقارات في الإبراهيمية',
    message: 'أريد معرفة المزيد عن الشقق المتاحة في منطقة الإبراهيمية',
    createdAt: '2024-03-10',
    read: false,
  },
  {
    id: 'c2',
    name: 'منى سليم',
    email: 'mona@example.com',
    phone: '+20 1122222222',
    subject: 'طلب تقييم عقار',
    message: 'أحتاج تقييم لشقتي قبل البيع، كيف يمكنني الحصول على ذلك؟',
    createdAt: '2024-03-09',
    read: true,
  },
];

export const STATS = {
  totalProperties: 127,
  soldProperties: 43,
  activeClients: 289,
  yearsExperience: 12,
};

export const formatPrice = (price: number, status: PropertyStatus): string => {
  if (status === 'for-rent') {
    return `${price.toLocaleString('ar-EG')} جنيه/شهر`;
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون جنيه`;
  }
  return `${price.toLocaleString('ar-EG')} جنيه`;
};

export const getStatusLabel = (status: PropertyStatus): string => {
  const labels = {
    'for-sale': 'للبيع',
    'for-rent': 'للإيجار',
    'sold': 'تم البيع',
    'rented': 'تم التأجير',
  };
  return labels[status];
};

export const getTypeLabel = (type: PropertyType): string => {
  const labels = {
    'apartment': 'شقة',
    'villa': 'فيلا',
    'duplex': 'دوبلكس',
    'office': 'مكتب',
    'chalet': 'شاليه',
  };
  return labels[type];
};

export const getRequestStatusLabel = (status: RequestStatus): string => {
  const labels = {
    'pending': 'قيد الانتظار',
    'under-review': 'تحت المراجعة',
    'approved': 'تمت الموافقة',
    'rejected': 'مرفوض',
    'completed': 'مكتمل',
  };
  return labels[status];
};

export const getRequestTypeLabel = (type: 'buy' | 'sell' | 'inquiry'): string => {
  const labels = {
    'buy': 'طلب شراء',
    'sell': 'طلب بيع',
    'inquiry': 'استعلام',
  };
  return labels[type];
};

export const TASKS: Task[] = [
  {
    id: 't1',
    title: 'مراجعة عقار في سيدي جابر',
    description: 'القيام بمراجعة شاملة للعقار AD-2024-001 والتأكد من جميع الأوراق',
    assignedTo: 'u5',
    assignedBy: 'u1',
    propertyId: 'p1',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-16',
    dueDate: '2024-03-20'
  },
  {
    id: 't2',
    title: 'تصوير فوتوغرافي للفيلا',
    description: 'ترتيب جلسة تصوير احترافية للفيلا في سموحة',
    assignedTo: 'u6',
    assignedBy: 'u1',
    propertyId: 'p2',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-03-16',
    updatedAt: '2024-03-16',
    dueDate: '2024-03-22'
  },
  {
    id: 't3',
    title: 'متابعة عملية البيع',
    description: 'التواصل مع العميل لإتمام إجراءات البيع للبنتهاوس',
    assignedTo: 'u5',
    assignedBy: 'u1',
    propertyId: 'p4',
    status: 'completed',
    priority: 'high',
    createdAt: '2024-03-10',
    updatedAt: '2024-03-14',
    dueDate: '2024-03-15'
  }
];

export function generateAdCode(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `AD-${year}-${randomNum}`;
}

export function getSimilarProperties(currentProperty: Property, allProperties: Property[]): Property[] {
  return allProperties
    .filter(p =>
      p.id !== currentProperty.id &&
      (p.type === currentProperty.type ||
       Math.abs(p.price - currentProperty.price) / currentProperty.price < 0.3 ||
       p.location === currentProperty.location)
    )
    .slice(0, 4);
}
