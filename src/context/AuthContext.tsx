
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { EmailAuthCredentials } from '@/lib/types';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithEmail: (credentials: EmailAuthCredentials) => Promise<boolean>;
  signInWithEmail: (credentials: Omit<EmailAuthCredentials, 'name' | 'confirmPassword'>) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userName = result.user.displayName;
      toast({ title: `¡Bienvenido, ${userName}!`, description: "Has iniciado sesión correctamente." });
    } catch (error) {
      console.error("Error during sign-in:", error);
      toast({ title: "Error", description: "No se pudo iniciar sesión con Google.", variant: "destructive" });
    }
  };

  const signUpWithEmail = async ({ email, password, name }: EmailAuthCredentials) => {
    const auth = getAuth(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // Reload user to get displayName
      await userCredential.user.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser); // Manually update state to trigger re-render with new name

      toast({ title: `¡Bienvenido, ${name}!`, description: "Tu cuenta ha sido creada correctamente." });
      return true;
    } catch (error: any) {
      console.error("Error during sign-up:", error);
      let message = "No se pudo crear la cuenta.";
      if (error.code === 'auth/email-already-in-use') {
        message = 'Este correo electrónico ya está en uso.';
      }
      toast({ title: "Error de Registro", description: message, variant: "destructive" });
      return false;
    }
  };

  const signInWithEmail = async ({ email, password }: Omit<EmailAuthCredentials, 'name' | 'confirmPassword'>) => {
    const auth = getAuth(app);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: `¡Bienvenido de nuevo!`, description: "Has iniciado sesión correctamente." });
      return true;
    } catch (error: any) {
      console.error("Error during sign-in:", error);
      toast({ title: "Error de Inicio de Sesión", description: "Las credenciales son incorrectas.", variant: "destructive" });
      return false;
    }
  };
  
  const sendPasswordReset = async (email: string) => {
    const auth = getAuth(app);
    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: "Correo Enviado",
            description: "Se ha enviado un correo a tu dirección para restablecer la contraseña.",
        });
        return true;
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        toast({
            title: "Error",
            description: "No se pudo enviar el correo de recuperación. Verifica que el correo sea correcto.",
            variant: "destructive",
        });
        return false;
    }
  };


  const signOut = async () => {
    const auth = getAuth(app);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
    } catch (error) {
      console.error("Error during sign-out:", error);
      toast({ title: "Error", description: "No se pudo cerrar la sesión.", variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, signUpWithEmail, signInWithEmail, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

    