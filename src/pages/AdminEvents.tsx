import React from "react";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DataTableRowActions } from "@/components/data-table-row-actions";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { AppAdminSidebar } from "@/components/AppAdminSidebar";
import { AdminWithdrawRequests } from "@/components/AdminWithdrawRequests";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  sold_tickets: number;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [capacity, setCapacity] = useState<number | null>(null);
  const { toast } = useToast();

  const [adminSidebarSection, setAdminSidebarSection] = React.useState<"events" | "producers" | "withdraws">("events");
  const [totalWithdraw, setTotalWithdraw] = React.useState<number>(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (adminSidebarSection === "withdraws") {
      // Carrega o valor total dos saques pendentes (já com desconto de 10%)
      supabase
        .from("withdrawals")
        .select("net_amount")
        .eq("status", "pending")
        .then(({ data }) => {
          let total = 0;
          if (Array.isArray(data)) {
            total = data.reduce((sum, w) => sum + (Number(w.net_amount) * 0.9), 0);
          }
          setTotalWithdraw(total);
        });
    }
  }, [adminSidebarSection]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*");
      if (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Erro ao carregar eventos",
          description: "Ocorreu um erro ao buscar os eventos.",
          variant: "destructive",
        });
      }
      if (data) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao carregar os eventos.",
        variant: "destructive",
      });
    }
  };

  const createEvent = async () => {
    if (!title || !date || !location || !price || !capacity) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("events").insert({
        title,
        date,
        location,
        price,
        capacity,
      });

      if (error) {
        console.error("Error creating event:", error);
        toast({
          title: "Erro ao criar evento",
          description: "Ocorreu um erro ao criar o evento.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso.",
      });
      fetchEvents();
      closeEventModal();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao criar o evento.",
        variant: "destructive",
      });
    }
  };

  const updateEvent = async () => {
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from("events")
        .update({
          title,
          date,
          location,
          price,
          capacity,
        })
        .eq("id", selectedEvent.id);

      if (error) {
        console.error("Error updating event:", error);
        toast({
          title: "Erro ao atualizar evento",
          description: "Ocorreu um erro ao atualizar o evento.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso.",
      });
      fetchEvents();
      closeEditModal();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao atualizar o evento.",
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) {
        console.error("Error deleting event:", error);
        toast({
          title: "Erro ao excluir evento",
          description: "Ocorreu um erro ao excluir o evento.",
          variant: "destructive",
        });
          return;
      }

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso.",
      });
      fetchEvents();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao excluir o evento.",
        variant: "destructive",
      });
    }
  };

  const openEventModal = () => {
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setTitle("");
    setDate("");
    setLocation("");
    setPrice(null);
    setCapacity(null);
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setDate(event.date);
    setLocation(event.location);
    setPrice(event.price);
    setCapacity(event.capacity);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEvent(null);
    setTitle("");
    setDate("");
    setLocation("");
    setPrice(null);
    setCapacity(null);
  };

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "title",
      header: "Título",
    },
    {
      accessorKey: "date",
      header: "Data",
    },
    {
      accessorKey: "location",
      header: "Localização",
    },
    {
      accessorKey: "price",
      header: "Preço",
    },
    {
      accessorKey: "capacity",
      header: "Capacidade",
    },
    {
      accessorKey: "sold_tickets",
      header: "Ingressos Vendidos",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onEdit={() => openEditModal(row.original)}
          onDelete={() => deleteEvent(row.original.id)}
        />
      ),
    },
  ];

  return (
    <div className="flex min-h-screen">
      <AppAdminSidebar
        onCreateAdmin={openEventModal}
        selectedSection={adminSidebarSection}
        onSelectSection={setAdminSidebarSection}
        totalWithdrawValue={totalWithdraw}
      />
      <main className="flex-1 p-4 md:p-8 bg-background">
        {adminSidebarSection === "withdraws" ? (
          <AdminWithdrawRequests />
        ) : adminSidebarSection === "producers" ? (
          <div>
            <h2>Gerenciar Produtoras (Em breve)</h2>
            <p>Funcionalidade de gerenciamento de produtoras estará disponível em breve.</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={events} />
            </CardContent>
          </Card>
        )}
        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={openEventModal}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
              <DialogDescription>
                Crie um novo evento para ser exibido na plataforma.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data
                </Label>
                <Input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Localização
                </Label>
                <Input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Preço
                </Label>
                <Input
                  type="number"
                  id="price"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacidade
                </Label>
                <Input
                  type="number"
                  id="capacity"
                  value={capacity || ""}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button type="submit" onClick={createEvent}>
              Criar Evento
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Evento</DialogTitle>
              <DialogDescription>
                Edite os detalhes do evento selecionado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data
                </Label>
                <Input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Localização
                </Label>
                <Input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Preço
                </Label>
                <Input
                  type="number"
                  id="price"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacidade
                </Label>
                <Input
                  type="number"
                  id="capacity"
                  value={capacity || ""}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button type="submit" onClick={updateEvent}>
              Atualizar Evento
            </Button>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminEvents;
