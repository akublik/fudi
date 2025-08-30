import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer } from "lucide-react";

export function EquivalencyTable() {
  const solids = [
    { measure: "1 Taza", flour: 110, sugar: 225, powderedSugar: 110, cocoa: 125, margarine: 225 },
    { measure: "1/2 Taza", flour: 50, sugar: 115, powderedSugar: 50, cocoa: 60, margarine: 115 },
    { measure: "1/4 Taza", flour: 30, sugar: 55, powderedSugar: 30, cocoa: 30, margarine: 55 },
    { measure: "1/8 Taza", flour: 15, sugar: 30, powderedSugar: 15, cocoa: 15, margarine: 30 },
  ];

  const liquids = [
    { cup: "1", ml: 237, oz: 8 },
    { cup: "1/2", ml: 118, oz: 4 },
    { cup: "1/4", ml: 59, oz: 2 },
    { cup: "1/8", ml: 30, oz: 1 },
    { cup: "1/16", ml: 14, oz: 0.47 },
  ];
  
  const spoons = [
    { cup: "1", tbsp: 16, tsp: 48 },
    { cup: "1/2", tbsp: 8, tsp: 24 },
    { cup: "1/4", tbsp: 4, tsp: 12 },
    { cup: "1/8", tbsp: 2, tsp: 6 },
    { cup: "1/16", tbsp: 1, tsp: 3 },
  ];

  const temperatures = [
    { celsius: 120, fahrenheit: 250, level: "Bajo" },
    { celsius: 150, fahrenheit: 300, level: "" },
    { celsius: 180, fahrenheit: 350, level: "Moderado" },
    { celsius: 200, fahrenheit: 400, level: "Caliente" },
    { celsius: 220, fahrenheit: 425, level: "" },
    { celsius: 230, fahrenheit: 450, level: "Muy Caliente" },
  ];

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">
          Tabla de Medidas y Equivalencias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2" defaultValue={'solids'}>
          <AccordionItem value="solids" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <h3 className="font-semibold text-lg">Tazas a Gramos (Sólidos)</h3>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medida</TableHead>
                    <TableHead className="text-right">Harina</TableHead>
                    <TableHead className="text-right">Azúcar</TableHead>
                    <TableHead className="text-right">Azúcar Imp.</TableHead>
                    <TableHead className="text-right">Cocoa</TableHead>
                    <TableHead className="text-right">Margarina</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solids.map((item) => (
                    <TableRow key={item.measure}>
                      <TableCell className="font-medium">{item.measure}</TableCell>
                      <TableCell className="text-right">{item.flour} gr</TableCell>
                      <TableCell className="text-right">{item.sugar} gr</TableCell>
                      <TableCell className="text-right">{item.powderedSugar} gr</TableCell>
                      <TableCell className="text-right">{item.cocoa} gr</TableCell>
                      <TableCell className="text-right">{item.margarine} gr</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="liquids" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <h3 className="font-semibold text-lg">Líquidos</h3>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Taza</TableHead>
                    <TableHead className="text-right">Mililitros</TableHead>
                    <TableHead className="text-right">Onzas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liquids.map((item) => (
                    <TableRow key={item.cup}>
                      <TableCell className="font-medium">{item.cup}</TableCell>
                      <TableCell className="text-right">{item.ml} ml</TableCell>
                      <TableCell className="text-right">{item.oz} oz</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="spoons" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <h3 className="font-semibold text-lg">Tazas a Cucharadas</h3>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Taza</TableHead>
                    <TableHead className="text-right">Cucharadas</TableHead>
                    <TableHead className="text-right">Cucharaditas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spoons.map((item) => (
                    <TableRow key={item.cup}>
                      <TableCell className="font-medium">{item.cup}</TableCell>
                      <TableCell className="text-right">{item.tbsp}</TableCell>
                      <TableCell className="text-right">{item.tsp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="temperature" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Thermometer className="h-5 w-5"/> Temperatura del Horno</h3>
            </AccordionTrigger>
            <AccordionContent className="px-4">
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Celsius (°C)</TableHead>
                    <TableHead>Fahrenheit (°F)</TableHead>
                    <TableHead>Fuego</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {temperatures.map((item) => (
                    <TableRow key={item.celsius}>
                      <TableCell>{item.celsius}°C</TableCell>
                      <TableCell>{item.fahrenheit}°F</TableCell>
                      <TableCell className="font-medium">{item.level}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}
