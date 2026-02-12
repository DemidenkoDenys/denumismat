export interface Order {
  id?: string;
  name: string;
  email: string;
  coins: Coin[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Coin {
  id: string;
  country_name: string;
  deno: string;
  year: number;
  price: number;
  discountPrice?: number;
}
