
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Calendar, Users, Building2, Banknote, Percent } from "lucide-react";

interface AppAdminSidebarProps {
  onCreateAdmin?: () => void;
  onSelectSection?: (section: "events" | "producers" | "withdraws") => void;
  selectedSection?: "events" | "producers" | "withdraws";
  totalWithdrawValue?: number;
}

export function AppAdminSidebar({
  onCreateAdmin,
  onSelectSection,
  selectedSection = "events",
  totalWithdrawValue = 0,
}: AppAdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Função para formatar currency em BRL
  const formatCurrency = (value: number) => (
    "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
  );

  return (
    <Sidebar className="bg-card border-r border-border min-h-screen shadow-md">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedSection === "events"}
                  onClick={() => onSelectSection?.("events")}
                  className="!bg-transparent"
                >
                  <Calendar className="mr-2" />
                  Eventos
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedSection === "producers"}
                  onClick={() => onSelectSection?.("producers")}
                  className="!bg-transparent"
                >
                  <Building2 className="mr-2" />
                  Gerenciar produtoras
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedSection === "withdraws"}
                  onClick={() => onSelectSection?.("withdraws")}
                  className="flex items-center justify-between !bg-transparent"
                >
                  <span className="flex items-center">
                    <Banknote className="mr-2" />
                    Solicitações de Saque
                  </span>
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-xs text-primary-foreground font-semibold">
                    <Percent className="w-4 h-4 mr-1" />
                    {formatCurrency(totalWithdrawValue)}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    type="button"
                    onClick={onCreateAdmin}
                    className="!bg-transparent"
                  >
                    <Users className="mr-2" />
                    Criar novo admin
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
