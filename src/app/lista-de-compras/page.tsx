
import { Footer } from "@/components/common/Footer";
import { ShoppingListPageClient } from "@/components/shopping-list/ShoppingListPageClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShoppingListPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto px-4 py-8 flex-grow">
        <ShoppingListPageClient />
      </main>
      <Footer />
    </div>
  );
}
