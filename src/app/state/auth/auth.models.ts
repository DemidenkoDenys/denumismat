export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  verified: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  verified: boolean;
}
