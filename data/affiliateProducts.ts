export interface AffiliateProduct {
    id: string;
    title: string;
    price: number;
    rating: number;
    image: string;
    link: string;
    store: 'Amazon' | 'Flipkart';
    tags: string[]; // ['Male', 'Female', 'Unisex', 'Romantic', 'Luxury', etc.]
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
    {
        id: 'user-01',
        title: 'Customized Photo & Message Gift | Wooden Base LED Plaque',
        price: 599,
        rating: 4.0,
        image: 'https://m.media-amazon.com/images/I/719hCq086SL._SX679_.jpg',
        link: 'https://amzn.to/4sX1fBo',
        store: 'Amazon',
        tags: ['Unisex', 'Romantic', 'Sentimental', 'Personalized']
    },
    // ── FOR HIM ──
    {
        id: 'h1',
        title: 'Fossil Gen 6 Smartwatch with Alexa Built-in',
        price: 18495,
        rating: 4.2,
        image: 'https://m.media-amazon.com/images/I/71Xm6zB8f0L._SX679_.jpg',
        link: 'https://www.amazon.in/Fossil-Stainless-Steel-Touchscreen-Smartwatch-FTW4061/dp/B09B2T2XG1',
        store: 'Amazon',
        tags: ['Male', 'Luxury', 'Tech', 'Birthday']
    },
    {
        id: 'h2',
        title: 'Philips Multi Grooming Kit Series 7000',
        price: 4295,
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/6182-1p2O0L._SX679_.jpg',
        link: 'https://www.amazon.in/Philips-Grooming-Groomer-Trimmer-MG7715/dp/B076S8W8MT',
        store: 'Amazon',
        tags: ['Male', 'Grooming', 'Practical']
    },
    {
        id: 'h3',
        title: 'Wild Stone Edge Premium Perfume for Men',
        price: 599,
        rating: 4.3,
        image: 'https://m.media-amazon.com/images/I/51pSizA1ZSL._SX679_.jpg',
        link: 'https://www.amazon.in/Wild-Stone-Edge-Perfume-100ml/dp/B07G9Z3Y51',
        store: 'Amazon',
        tags: ['Male', 'Fragrance', 'Romantic']
    },
    {
        id: 'h4',
        title: 'Tommy Hilfiger Men\'s Leather Wallet',
        price: 2499,
        rating: 4.4,
        image: 'https://m.media-amazon.com/images/I/81L6tGqXzIL._SX679_.jpg',
        link: 'https://www.amazon.in/Tommy-Hilfiger-Mens-Leather-Wallet/dp/B00422MCW6',
        store: 'Amazon',
        tags: ['Male', 'Luxury', 'Accessory']
    },
    {
        id: 'h5',
        title: 'Bose QuietComfort 45 Bluetooth Wireless Noise Cancelling Headphones',
        price: 29900,
        rating: 4.6,
        image: 'https://m.media-amazon.com/images/I/51JbsHSktkL._SX679_.jpg',
        link: 'https://www.amazon.in/Bose-QuietComfort-45-Bluetooth-Headphones/dp/B098FH5P3C',
        store: 'Amazon',
        tags: ['Male', 'Luxury', 'Tech']
    },
    {
        id: 'h6',
        title: 'Adidas Men\'s Ultraboost 22 Running Shoe',
        price: 11999,
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/71uKzT0pM5L._SX679_.jpg',
        link: 'https://www.amazon.in/Adidas-Mens-Ultraboost-Running-Shoes/dp/B09M8R9X6S',
        store: 'Amazon',
        tags: ['Male', 'Fitness', 'Luxury']
    },
    {
        id: 'h7',
        title: 'Parker Frontier Matte Black Gold Trim Roller Ball Pen',
        price: 649,
        rating: 4.4,
        image: 'https://m.media-amazon.com/images/I/51mXvUvHn+L._SX679_.jpg',
        link: 'https://www.amazon.in/Parker-Frontier-Matte-Black-Roller/dp/B00M0EVFMC',
        store: 'Amazon',
        tags: ['Male', 'Professional', 'Gift']
    },

    // ── FOR HER ──
    {
        id: 'f1',
        title: 'Swarovski Bella V Drop Printed Earrings',
        price: 7450,
        rating: 4.7,
        image: 'https://m.media-amazon.com/images/I/51p1ZzX2QDL._UX695_.jpg',
        link: 'https://www.amazon.in/Swarovski-Womens-Bella-V-Earrings/dp/B01MT2H6K8',
        store: 'Amazon',
        tags: ['Female', 'Luxury', 'Jewelry', 'Romantic']
    },
    {
        id: 'f2',
        title: 'SUGAR Cosmetics - Every Day Makeup Kit',
        price: 1499,
        rating: 4.3,
        image: 'https://m.media-amazon.com/images/I/61K7XfUf8uL._SX679_.jpg',
        link: 'https://www.amazon.in/SUGAR-Cosmetics-Smudge-Eyeliner-Lipstick/dp/B07MZKHLRW',
        store: 'Amazon',
        tags: ['Female', 'Makeup', 'Birthday']
    },
    {
        id: 'f3',
        title: 'Lavie Women\'s Satchel Handbag',
        price: 1899,
        rating: 4.2,
        image: 'https://m.media-amazon.com/images/I/71f-C+o0H+L._SX679_.jpg',
        link: 'https://www.amazon.in/Lavie-Womens-Brogue-Satchel-Handbag/dp/B01LW8L9VZ',
        store: 'Amazon',
        tags: ['Female', 'Accessory', 'Luxury']
    },
    {
        id: 'f4',
        title: 'Forest Essentials Facial Care Selection Box',
        price: 2450,
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/71Y8R5Ff5FL._SX679_.jpg',
        link: 'https://www.amazon.in/Forest-Essentials-Facial-Care-Selection/dp/B00V4J2XF4',
        store: 'Amazon',
        tags: ['Female', 'Skincare', 'Self-care']
    },
    {
        id: 'f5',
        title: 'Titan Raga Viva Analog Mother of Pearl Dial Women\'s Watch',
        price: 5495,
        rating: 4.4,
        image: 'https://m.media-amazon.com/images/I/71X8k7z6k3L._SX679_.jpg',
        link: 'https://www.amazon.in/Titan-Viva-Analog-Pearl-Watch-2598WM01/dp/B07GVXW5G9',
        store: 'Amazon',
        tags: ['Female', 'Luxury', 'Watch']
    },
    {
        id: 'f6',
        title: 'Bath & Body Works Japanese Cherry Blossom Gift Set',
        price: 3499,
        rating: 4.6,
        image: 'https://m.media-amazon.com/images/I/71f+0X8IoaL._SX679_.jpg',
        link: 'https://www.amazon.in/Bath-Body-Works-Japanese-Blossom/dp/B000P9E7L2',
        store: 'Amazon',
        tags: ['Female', 'Fragrance', 'Romantic']
    },
    {
        id: 'f7',
        title: 'Giva 925 Sterling Silver Zircon Heart Pendant with Link Chain',
        price: 1299,
        rating: 4.3,
        image: 'https://m.media-amazon.com/images/I/51H45fP0L+L._UX695_.jpg',
        link: 'https://www.amazon.in/GIVA-Sterling-Silver-Pendant-Necklace/dp/B08KH6S9RT',
        store: 'Amazon',
        tags: ['Female', 'Jewelry', 'Romantic']
    },

    // ── UNISEX & COUPLES ──
    {
        id: 'u1',
        title: 'Fujifilm Instax Mini 11 Instant Camera Gift Box',
        price: 5999,
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/71p0W9qOq3L._SX679_.jpg',
        link: 'https://www.amazon.in/Fujifilm-Instax-Mini-11-Camera/dp/B08527Y382',
        store: 'Amazon',
        tags: ['Unisex', 'Memories', 'Creative']
    },
    {
        id: 'u2',
        title: 'Ferrero Rocher Premium Chocolates, 24 Pieces',
        price: 895,
        rating: 4.7,
        image: 'https://m.media-amazon.com/images/I/71oDQX9f9BL._SX679_.jpg',
        link: 'https://www.amazon.in/Ferrero-Rocher-Premium-Chocolates-Count/dp/B00BUI5MNS',
        store: 'Amazon',
        tags: ['Unisex', 'Food', 'Romantic']
    },
    {
        id: 'u3',
        title: 'Echo Dot (4th Gen) Smart speaker with Alexa',
        price: 3999,
        rating: 4.4,
        image: 'https://m.media-amazon.com/images/I/61KIy6gXhFL._SX679_.jpg',
        link: 'https://www.amazon.in/Echo-Dot-4th-Gen-Blue/dp/B084KSR6S4',
        store: 'Amazon',
        tags: ['Unisex', 'Tech', 'Practical']
    },
    {
        id: 'u4',
        title: 'Zoffany Lavender Scented Glass Candle for Relaxation',
        price: 499,
        rating: 4.1,
        image: 'https://m.media-amazon.com/images/I/71Y7y6O2l2L._SX679_.jpg',
        link: 'https://www.amazon.in/Zoffany-Lavender-Scented-Candle-Decorative/dp/B08P5TGL3H',
        store: 'Amazon',
        tags: ['Unisex', 'Home', 'Romantic']
    },
    {
        id: 'u5',
        title: 'Nescafé É Connected Mug - Personal Coffee Maker',
        price: 6499,
        rating: 4.2,
        image: 'https://m.media-amazon.com/images/I/71oK8G+7eQL._SX679_.jpg',
        link: 'https://www.amazon.in/Nescafe-Coffee-Maker-Smart-Mug/dp/B07H96KML8',
        store: 'Amazon',
        tags: ['Unisex', 'Tech', 'Luxury']
    },
    {
        id: 'u6',
        title: 'Open When Envelopes - 12 Romantic Notes for Couples',
        price: 349,
        rating: 4.8,
        image: 'https://m.media-amazon.com/images/I/71pE7U19EPL._SX679_.jpg',
        link: 'https://www.amazon.in/Open-When-Envelopes-Romantic-Messages/dp/B08RDY6SJH',
        store: 'Amazon',
        tags: ['Unisex', 'Sentimental', 'Romantic']
    },
    {
        id: 'u7',
        title: 'Marshall Emberton Portable Bluetooth Speaker',
        price: 14999,
        rating: 4.8,
        image: 'https://m.media-amazon.com/images/I/713vScYp03L._SX679_.jpg',
        link: 'https://www.amazon.in/Marshall-Emberton-Portable-Bluetooth-Speaker/dp/B08CDVNYKV',
        store: 'Amazon',
        tags: ['Unisex', 'Luxury', 'Tech']
    },
    {
        id: 'u8',
        title: 'Couple Hands Casting Kit - Forever Memories',
        price: 1299,
        rating: 4.5,
        image: 'https://m.media-amazon.com/images/I/71lC7Wf6cFL._SX679_.jpg',
        link: 'https://www.amazon.in/Hand-Casting-Kit-Couples-Adults/dp/B08LD2J9W4',
        store: 'Amazon',
        tags: ['Unisex', 'Sentimental', 'Romantic']
    },
    {
        id: 'u9',
        title: 'The Psychology of Money by Morgan Housel - Best Seller',
        price: 399,
        rating: 4.6,
        image: 'https://m.media-amazon.com/images/I/71g2ednj0JL.jpg',
        link: 'https://www.amazon.in/Psychology-Money-Morgan-Housel/dp/0857197681',
        store: 'Amazon',
        tags: ['Unisex', 'Book', 'Gift']
    },
    {
        id: 'u10',
        title: 'Aeropress Coffee and Espresso Maker',
        price: 3899,
        rating: 4.7,
        image: 'https://m.media-amazon.com/images/I/61K-A7YpW+L._SX679_.jpg',
        link: 'https://www.amazon.in/AeroPress-80R11-Coffee-Maker/dp/B0047BIWSK',
        store: 'Amazon',
        tags: ['Unisex', 'Coffee', 'Practical']
    },
    {
        id: 'u11',
        title: 'Kindle Paperwhite (16 GB) - 6.8" Screen',
        price: 13999,
        rating: 4.7,
        image: 'https://m.media-amazon.com/images/I/51f9VqP1vSL._SX679_.jpg',
        link: 'https://www.amazon.in/Kindle-Paperwhite-8GB-Now-with-adjustable-warm-light/dp/B08N36XNTT',
        store: 'Amazon',
        tags: ['Unisex', 'Tech', 'Luxury']
    }
];
