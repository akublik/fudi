
export interface Ingredient {
  name: string;
  quantity: number;
  unit?: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  shoppingIngredients: Ingredient[];
  instructions: string;
  servings: number;
  imageUrl?: string;
  nutritionalInfo?: NutritionalInfo;
  author?: string;
}

export interface ShoppingListItem extends Ingredient {
  id: string;
  recipeName?: string;
  checked: boolean;
  notes?: string;
}

export interface UserInfo {
  name: string;
  address: string;
  whatsapp: string;
}

    