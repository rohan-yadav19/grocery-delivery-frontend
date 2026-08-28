export interface Product {
  readonly id: string;
  readonly name: string;
  readonly categoryId: string;
  readonly price: number;
  readonly unit: string;
  readonly stock: number;
  readonly image: string;
  readonly description: string;
  readonly brand?: string;
  readonly rating?: ProductRating;
}

export interface ProductRating {
  readonly average: number;
  readonly count: number;
}
