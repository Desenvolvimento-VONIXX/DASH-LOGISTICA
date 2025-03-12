import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export function DatePicker() {



  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          locale={ptBR}
          className="custom-calendar"
        />
      </SidebarGroupContent>
    </SidebarGroup>

  );
}
