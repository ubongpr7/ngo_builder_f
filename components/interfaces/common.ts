
export interface Address {
    country: number | null; // Assuming country is referenced by ID
    region: number | null; // Assuming region is referenced by ID
    subregion: number | null; // Assuming subregion is referenced by ID
    city: number | null; // Assuming city is referenced by ID
    apt_number: number | null;
    street_number: number | null;
    street: string | null;
    postal_code: string | null;
    company: string | null;
    full_address: string | null;
  }
 