import type { Recipe, Ingredient } from '@/lib/types';
import { RecipeCard } from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  onSave: (recipe: Recipe) => void;
  onRemove: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  onAddToShoppingList: (ingredients: Ingredient[], recipeName: string) => void;
  isSavedRecipesView?: boolean;
}

export function RecipeList({ recipes, onSave, onRemove, isFavorite, onAddToShoppingList, isSavedRecipesView = false }: RecipeListProps) {
  if (recipes.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onSave={onSave}
          onRemove={onRemove}
          isFavorite={isFavorite(recipe.id)}
          onAddToShoppingList={onAddToShoppingList}
          isSavedRecipesView={isSavedRecipesView}
        />
      ))}
    </div>
  );
}
