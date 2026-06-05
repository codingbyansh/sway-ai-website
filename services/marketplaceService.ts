import { Product, GiftRelationship, GiftOccasion, GiftPersonality } from '../types';
import { AFFILIATE_PRODUCTS, AffiliateProduct } from '../data/affiliateProducts';

const getAffiliateTag = () => (import.meta.env as any).VITE_AMAZON_AFFILIATE_TAG || 'sync aiassista-21';

/**
 * Generates a direct Amazon India search link with your affiliate tag
 */
export const getAmazonSearchUrl = (keywords: string): string => {
    const tag = getAffiliateTag();
    const encodedQuery = encodeURIComponent(keywords);
    return `https://www.amazon.in/s?k=${encodedQuery}&tag=${tag}`;
};

/**
 * Sync Accurate Database Matching
 */
export const fetchProductsFromMarketplace = async (
    keywords: string,
    budget: [number, number],
    params: {
        relationship: GiftRelationship;
        occasion: GiftOccasion;
        personality: GiftPersonality;
    }
): Promise<Product[]> => {
    const min = budget[0];
    const max = budget[1];
    const tag = getAffiliateTag();

    // Matching logic
    const scoredProducts = AFFILIATE_PRODUCTS.map(product => {
        let score = 0;
        const tagsLower = product.tags.map(t => t.toLowerCase());
        
        if (tagsLower.includes(params.relationship.toLowerCase())) score += 3;
        if (tagsLower.includes(params.occasion.toLowerCase())) score += 2;
        if (tagsLower.includes(params.personality.toLowerCase())) score += 5;

        if (keywords.split(' ').some(k => product.title.toLowerCase().includes(k.toLowerCase()))) {
            score += 4;
        }

        const cleanLink = product.link.split('?')[0];
        const linkWithTag = `${cleanLink}?tag=${tag}`;

        return { ...product, link: linkWithTag, finalScore: score } as AffiliateProduct & { finalScore: number };
    });

    return scoredProducts
        .filter(p => p.price >= min && p.price <= max)
        .sort((a, b) => b.finalScore - a.finalScore || b.rating - a.rating)
        .slice(0, 4)
        .map(({ finalScore, tags, ...p }) => p);
};
