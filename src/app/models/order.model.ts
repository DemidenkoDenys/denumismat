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
  deno: string;
  year: number;
  title?: string;
  price: number;
  discountPrice?: number;
}
