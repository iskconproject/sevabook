export interface Location {
  id: string;
  name: string;
  description?: string;
  address?: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationFormData {
  name: string;
  description?: string;
  address?: string;
  is_active: boolean;
  is_default: boolean;
}
