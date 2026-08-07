export interface OfferItem {
  id: string;
  title: string;
  description: string;
  discount: number;
  image: string;
  bgColor: string;
  validUntil: string;
  restaurantId: string;
}

export interface BannerItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  bgColor: string;
  restaurantId: string;
}

export interface PromoCode {
  code: string;
  discount: number;
}
