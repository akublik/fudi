
"use client";

import { useShoppingList } from "@/hooks/use-shopping-list";
import { useUserInfo } from "@/hooks/use-user-info";
import { ShoppingList } from "@/components/recipe/ShoppingList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ShoppingListPageClient() {
  const {
    shoppingList,
    toggleItem,
    removeItem,
    updateItem,
    clearList,
    addItem,
  } = useShoppingList();
  
  const { userInfo, setUserInfo } = useUserInfo();

  return (
    <>
        <Button asChild variant="outline" className="mb-4">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
            </Link>
        </Button>

        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-4xl">Mi Lista de Compras</CardTitle>
                <CardDescription className="text-lg">Aquí puedes ver, editar y compartir todos los ingredientes de tus recetas.</CardDescription>
            </CardHeader>
            <CardContent>
                <ShoppingList
                    items={shoppingList}
                    userInfo={userInfo}
                    onToggle={toggleItem}
                    onRemove={removeItem}
                    onUpdate={updateItem}
                    onClear={clearList}
                    onAddItem={addItem}
                    onSaveUserInfo={setUserInfo}
                />
            </CardContent>
        </Card>
    </>
  );
}
