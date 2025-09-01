
import type { Recipe } from '@/lib/types';
import { RecipeCard } from './RecipeCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart } from 'lucide-react';

interface FavoritesListProps {
  favorites: Recipe[];
  onRemove: (recipeId: string) => void;
  title: string;
  description: string;
  isSavedRecipesView?: boolean;
}

export function FavoritesList({ favorites, onRemove, title, description, isSavedRecipesView = false }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 min-h-[200px]">
        <Heart className="h-16 w-16 mb-4" />
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2">{description}</p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="max-h-[70vh]">
      <div className="p-4 grid grid-cols-1 gap-4">
        {favorites.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onSave={() => {}}
            onRemove={onRemove}
            isFavorite={true}
            isSavedRecipesView={isSavedRecipesView}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
