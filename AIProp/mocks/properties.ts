export interface Property {
    id: string;
    title: string;
    price: number;
    purpose: 'Rent' | 'Sale';
    category: 'House' | 'Plot' | 'Shop' | 'Land';
    images: string[];
    location: {
        latitude: number;
        longitude: number;
        areaName: string;
        city: string;
        landmark?: string;
    };
    width: number;
    length: number;
    description: string;
    ownerName: string;
    whatsappNumber: string;
    bedrooms?: number;
    kitchen?: number;
    hall?: number;
    views: number;
    leads: number;
    createdAt: string;
}

export const mockProperties: Property[] = [
    {
        id: '1',
        title: '3 BHK Luxury Villa with Garden',
        price: 8500000,
        purpose: 'Sale',
        category: 'House',
        images: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        ],
        location: {
            latitude: 28.7041,
            longitude: 77.1025,
            areaName: 'Connaught Place',
            city: 'New Delhi',
            landmark: 'Near Central Park',
        },
        width: 40,
        length: 60,
        description: 'Spacious villa with modern amenities, perfect for families. Features include modular kitchen, marble flooring, and parking space.',
        ownerName: 'Rajesh Kumar',
        whatsappNumber: '+919876543210',
        bedrooms: 3,
        kitchen: 1,
        hall: 2,
        views: 234,
        leads: 12,
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        title: 'Commercial Shop on Main Road',
        price: 15000,
        purpose: 'Rent',
        category: 'Shop',
        images: [
            'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
            'https://images.unsplash.com/photo-1582561424760-0b51e2b4d135?w=800',
        ],
        location: {
            latitude: 28.7095,
            longitude: 77.1025,
            areaName: 'Karol Bagh',
            city: 'New Delhi',
            landmark: 'Main Market',
        },
        width: 15,
        length: 20,
        description: 'Prime location shop with high footfall. Ideal for retail business, showroom, or office space.',
        ownerName: 'Priya Sharma',
        whatsappNumber: '+919876543211',
        views: 456,
        leads: 23,
        createdAt: '2024-01-14',
    },
    {
        id: '3',
        title: 'Residential Plot in Gated Community',
        price: 5200000,
        purpose: 'Sale',
        category: 'Plot',
        images: [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
            'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
        ],
        location: {
            latitude: 28.6139,
            longitude: 77.2090,
            areaName: 'Greater Kailash',
            city: 'New Delhi',
            landmark: 'Near M Block Market',
        },
        width: 30,
        length: 40,
        description: 'Corner plot in premium gated community with 24/7 security, power backup, and water supply.',
        ownerName: 'Amit Patel',
        whatsappNumber: '+919876543212',
        views: 189,
        leads: 8,
        createdAt: '2024-01-13',
    },
    {
        id: '4',
        title: '2 BHK Apartment Near Metro',
        price: 25000,
        purpose: 'Rent',
        category: 'House',
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1502672260066-6bc35f0a1bf5?w=800',
        ],
        location: {
            latitude: 28.5355,
            longitude: 77.3910,
            areaName: 'Noida Sector 18',
            city: 'Noida',
            landmark: 'Near Noida Metro Station',
        },
        width: 25,
        length: 30,
        description: 'Well-maintained apartment with modern amenities, gym, and swimming pool access.',
        ownerName: 'Sneha Verma',
        whatsappNumber: '+919876543213',
        bedrooms: 2,
        kitchen: 1,
        hall: 1,
        views: 567,
        leads: 34,
        createdAt: '2024-01-12',
    },
    {
        id: '5',
        title: 'Agricultural Land Near Highway',
        price: 3500000,
        purpose: 'Sale',
        category: 'Land',
        images: [
            'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
        ],
        location: {
            latitude: 28.4595,
            longitude: 77.0266,
            areaName: 'Gurgaon Sector 89',
            city: 'Gurgaon',
            landmark: 'NH-8 Highway',
        },
        width: 50,
        length: 100,
        description: 'Fertile agricultural land suitable for farming or investment. Good road connectivity.',
        ownerName: 'Vikram Singh',
        whatsappNumber: '+919876543214',
        views: 123,
        leads: 5,
        createdAt: '2024-01-11',
    },
    {
        id: '6',
        title: '4 BHK Duplex with Terrace',
        price: 12500000,
        purpose: 'Sale',
        category: 'House',
        images: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        ],
        location: {
            latitude: 28.6692,
            longitude: 77.4538,
            areaName: 'Indirapuram',
            city: 'Ghaziabad',
            landmark: 'Near Shipra Mall',
        },
        width: 45,
        length: 60,
        description: 'Spacious duplex with private terrace, modular kitchen, and premium fittings. Ready to move.',
        ownerName: 'Neha Gupta',
        whatsappNumber: '+919876543215',
        bedrooms: 4,
        kitchen: 1,
        hall: 2,
        views: 345,
        leads: 18,
        createdAt: '2024-01-10',
    },
];
