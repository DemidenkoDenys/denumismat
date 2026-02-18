import { Coin } from "../components/coins/coin-card";

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
