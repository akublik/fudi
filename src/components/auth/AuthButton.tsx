
"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogIn, LogOut, User, QrCode, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode.react";
import Link from "next/link";


function AffiliateCodeDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  if (!user) return null;

  const affiliateCode = `FUDI-${user.uid.substring(0, 7).toUpperCase()}`;
  const affiliateUrl = `https://www.fudichef.com/register?ref=${affiliateCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: '¡Copiado!',
      description: 'El código de afiliado ha sido copiado a tu portapapeles.',
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Tu Código de Afiliado</DialogTitle>
        <DialogDescription>
          Comparte este código QR o tu enlace único. ¡Pronto ganarás puntos y recompensas!
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <QRCode value={affiliateUrl} size={192} />
        </div>
        <div className="w-full text-center">
          <p className="text-lg font-semibold">Tu código único:</p>
          <Button variant="secondary" className="text-xl font-mono p-4 h-auto w-full mt-2" onClick={() => copyToClipboard(affiliateCode)}>
            {affiliateCode}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export function AuthButton() {
  const { user, signOut, loading, isAdmin } = useAuth();

  if (loading) {
    return <Button variant="outline" disabled>Cargando...</Button>;
  }

  if (!user) {
    return (
      <Button asChild variant="outline">
        <Link href="/registro">
          <LogIn className="mr-2 h-4 w-4"/>
          Iniciar Sesión / Registrarse
        </Link>
      </Button>
    );
  }

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "Usuario"} />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
              <Link href="/perfil">
                <User className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </Link>
            </DropdownMenuItem>
          <DialogTrigger asChild>
            <DropdownMenuItem>
                <QrCode className="mr-2 h-4 w-4" />
                <span>Mi Código de Afiliado</span>
            </DropdownMenuItem>
          </DialogTrigger>
          {isAdmin && (
             <DropdownMenuItem asChild>
              <Link href="/admin">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AffiliateCodeDialog />
    </Dialog>
  );
}
