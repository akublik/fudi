export interface Ingredient {
  name: string;
  quantity: number;
  unit?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  servings: number;
  imageUrl: string;
}
