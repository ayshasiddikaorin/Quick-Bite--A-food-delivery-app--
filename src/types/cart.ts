export interface CartItem {
  id: string;
  name: string;
  restaurant: string;
  image: string;
  rating: number;
  price: number;
  quantity: number;
}

export interface PromoCode {
  code: string;
  discount: number;
}