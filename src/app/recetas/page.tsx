import { Footer } from "@/components/common/Footer";
import { FavoritesPageClient } from "@/components/recipe/FavoritesPageClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FavoritesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <FavoritesPageClient />
      </main>
      <Footer />
    </div>
  );
}
