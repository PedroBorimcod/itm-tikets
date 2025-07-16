import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateQRRequest {
  qrCode: string;
  eventId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { qrCode, eventId }: ValidateQRRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar order_item que contém esse QR code
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select(`
        *,
        orders (status, user_id),
        events (id, title, date, time),
        ticket_types (name)
      `)
      .contains('qr_code', [qrCode]);

    if (orderError) {
      console.error('Error searching QR code:', orderError);
      return new Response(JSON.stringify({ error: 'Erro ao buscar QR code' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!orderItems || orderItems.length === 0) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'QR Code não encontrado ou inválido' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const orderItem = orderItems[0];

    // Verificar se o pedido foi pago
    if (orderItem.orders.status !== 'completed') {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'Pedido não foi pago ou está cancelado' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se o QR code já foi usado
    const qrIndex = orderItem.qr_code.indexOf(qrCode);
    if (qrIndex === -1) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'QR Code não encontrado neste ingresso' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se é para o evento correto
    if (orderItem.events.id !== eventId) {
      return new Response(JSON.stringify({ 
        valid: false, 
        message: 'QR Code não é válido para este evento' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Criar uma cópia do array de QR codes para marcar como usado
    const updatedQrCodes = [...orderItem.qr_code];
    updatedQrCodes[qrIndex] = `USED_${qrCode}_${Date.now()}`;

    // Atualizar o QR code como usado
    const { error: updateError } = await supabase
      .from('order_items')
      .update({ qr_code: updatedQrCodes })
      .eq('id', orderItem.id);

    if (updateError) {
      console.error('Error updating QR code:', updateError);
      return new Response(JSON.stringify({ error: 'Erro ao atualizar QR code' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Buscar dados do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', orderItem.orders.user_id)
      .single();

    return new Response(JSON.stringify({ 
      valid: true, 
      message: 'QR Code válido e usado com sucesso!',
      ticketInfo: {
        eventTitle: orderItem.events.title,
        eventDate: orderItem.events.date,
        eventTime: orderItem.events.time,
        ticketType: orderItem.ticket_types.name,
        customerName: profile?.full_name || 'Nome não encontrado',
        usedAt: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Error in validate-qr-code function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);