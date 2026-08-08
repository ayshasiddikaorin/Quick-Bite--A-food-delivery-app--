/**
 * Cart domain model.
 * id is a composite key: `${restaurantId}_${menuItemId}`
 * Both restaurantId and menuItemId are required to build PlaceOrderPayload.
 */
export interface CartItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  image: string;
  rating: number;
  price: number;
  quantity: number;
}
