import './App.css'
import React, { } from 'react'
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PedidosCotados } from './components/Graficos/PedidosCotados';
import { PedidosProduzidos } from './components/Graficos/PedidosProduzidos';
import { PedidosExpedidos } from './components/Graficos/PedidosExpedidos';
import { TableStatusCot } from './components/Graficos/TableStatusCotacoes';
import { SkusPorSeparador } from './components/Graficos/SkusPorSeparador';
import { PedidosPorAgentes } from './components/Graficos/PedidosPorAgente';
import { PedidosConfirmados } from './components/Graficos/PedidosConfirmados';
import { PesoPorAgentes } from './components/Graficos/PesoPorAgentes';
function App() {
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [dateIni, setDateIni] = React.useState<string | null>(null)
  const [dateFin, setDateFin] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (date?.from) {
      const fromDate = format(date.from, "dd/MM/yyyy");
      const toDate = date.to ? format(date.to, "dd/MM/yyyy") : null;

      setDateIni(fromDate);
      setDateFin(toDate);

    }
  }, [date]);

  return (
    <>
      <div className='p-5 flex justify-between'> 
        <h1 className='font-bold text-[30px] text-blue-950'>Dashboard Logística</h1>
        <div className={cn("grid gap-2")}>
          <Popover>
            <PopoverTrigger asChild >
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal"
                )}
              >
                <CalendarIcon className='bg-white' />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy")} -{" "}
                      {format(date.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy")
                  )
                ) : (
                  <>Selecionar Período</>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar className='shadow-lg '
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {dateIni && dateFin ? (
        <div className='grid grid-cols-2 p-5 gap-5'>
          <PedidosCotados dateIni={dateIni} dateFin={dateFin} />
          <TableStatusCot dateIni={dateIni} dateFin={dateFin} />
          <PedidosProduzidos dateIni={dateIni} dateFin={dateFin} />
          <SkusPorSeparador dateIni={dateIni} dateFin={dateFin} />
          <PedidosExpedidos dateIni={dateIni} dateFin={dateFin} />
          <PedidosConfirmados dateIni={dateIni} dateFin={dateFin} />
          <PedidosPorAgentes dateIni={dateIni} dateFin={dateFin} />
          <PesoPorAgentes dateIni={dateIni} dateFin={dateFin} />
        </div>
      ) : (
        <div className='text-center text-gray-500'>Selecionar um período</div>
      )}


    </>

  )
}

export default App
