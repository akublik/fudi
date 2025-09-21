"use client";

import { useState, useEffect, useRef } from 'react';
import type { Recipe, Ingredient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, List, X, Mic, MicOff } from 'lucide-react';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

interface CookingModeViewProps {
  recipe: Recipe;
  servings: number;
}

export function CookingModeView({ recipe, servings }: CookingModeViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Improved step parsing logic
  const instructions = recipe.instructions
    .split(/\s*(?=\d+\.\s|-)\s*/) // Split by "1. ", "2. ", "- " etc.
    .map(step => step.trim())
    .filter(step => step && !/^\d+\.$/.test(step)); // Filter out empty steps and just numbers like "1."

  const totalSteps = instructions.length;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition no es soportado en este navegador.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.trim().toLowerCase();
      console.log('Comando de voz recibido:', command);
      
      if (command.includes('siguiente')) {
        handleNext();
      } else if (command.includes('anterior') || command.includes('atrás')) {
        handlePrev();
      } else if (command.includes('ingredientes')) {
        setIsIngredientsOpen(prev => !prev);
      }
    };
    
    recognition.onend = () => {
        if(isListening){
            recognition.start();
        }
    }

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isListening]);
  
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };


  const getAdjustedIngredients = (baseIngredients: Ingredient[], baseServings: number, targetServings: number): Ingredient[] => {
    if (!targetServings || targetServings === baseServings) {
      return baseIngredients;
    }
    const factor = targetServings / baseServings;
    return baseIngredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity * factor,
    }));
  };
  
  const formatQuantity = (quantity: number) => {
    if (quantity === 0) return '';
    if (quantity % 1 === 0) return quantity.toString();
    return parseFloat(quantity.toFixed(2)).toString();
  };

  const adjustedIngredients = getAdjustedIngredients(recipe.ingredients, recipe.servings, servings);

  return (
    <div className="bg-background text-foreground h-full flex flex-col">
      <DialogHeader className="p-4 border-b flex-row items-center justify-between">
        <div className="flex flex-col">
          <DialogTitle className="text-2xl font-headline">{recipe.name}</DialogTitle>
          <DialogDescription>Modo Cocina: Sigue la receta paso a paso.</DialogDescription>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon">
            <X className="h-6 w-6" />
          </Button>
        </DialogClose>
      </DialogHeader>

      <div className="flex-grow flex flex-col justify-center items-center p-4 sm:p-8 text-center relative">
        {isListening && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-muted p-2 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Escuchando...</span>
            </div>
        )}
        <ScrollArea className="w-full h-[50vh] sm:h-auto">
            <p className="text-2xl md:text-4xl lg:text-5xl leading-relaxed max-w-4xl mx-auto">
            {totalSteps > 0 ? instructions[currentStep] : recipe.instructions}
            </p>
        </ScrollArea>
      </div>

      <div className="p-4 border-t space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Progress value={totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 100} className="w-full max-w-xs" />
          <span className="text-sm font-medium text-muted-foreground">
            Paso {currentStep + 1} de {totalSteps > 0 ? totalSteps : 1}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="p-6">
            <ChevronLeft className="h-6 w-6 mr-2" />
            Anterior
          </Button>

            <div className="flex items-center gap-4">
                {recognitionRef.current && (
                    <Button 
                        variant={isListening ? "destructive" : "outline"} 
                        size="icon" 
                        className="rounded-full w-16 h-16"
                        onClick={toggleListening}
                    >
                        {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </Button>
                )}
                 <Popover open={isIngredientsOpen} onOpenChange={setIsIngredientsOpen}>
                    <PopoverTrigger asChild>
                    <Button variant="secondary" className="p-6">
                        <List className="h-6 w-6 mr-2" />
                        Ingredientes
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" side="top" align="center">
                    <div className="space-y-4">
                        <h4 className="font-medium leading-none">Ingredientes ({servings} porciones)</h4>
                        <ScrollArea className="h-64">
                            <ul className="space-y-2 text-sm">
                            {adjustedIngredients.map((ingredient, index) => (
                                <li key={index}>
                                {formatQuantity(ingredient.quantity)} {ingredient.unit || ''} {ingredient.name}
                                </li>
                            ))}
                            </ul>
                        </ScrollArea>
                    </div>
                    </PopoverContent>
                </Popover>
            </div>

          <Button onClick={handleNext} disabled={totalSteps === 0 || currentStep === totalSteps - 1} className="p-6">
            Siguiente
            <ChevronRight className="h-6 w-6 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
