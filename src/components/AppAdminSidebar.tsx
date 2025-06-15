
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
import { Calendar, Users, Building2 } from "lucide-react";

interface AppAdminSidebarProps {
  onCreateAdmin?: () => void;
}

export function AppAdminSidebar({ onCreateAdmin }: AppAdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/events"}
                >
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      navigate("/admin/events");
                    }}
                  >
                    <Calendar className="mr-2" />
                    Eventos
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/producers"}
                >
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      navigate("/admin/producers");
                    }}
                  >
                    <Building2 className="mr-2" />
                    Gerenciar produtoras
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    type="button"
                    onClick={onCreateAdmin}
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
