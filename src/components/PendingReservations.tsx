import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playSound } from "@/utils/sounds";
import { LinkedListManager, ReservationNode } from "@/utils/linkedList";
import { CheckCircle, Clock, Calendar, User, FileText } from "lucide-react";
import { format } from "date-fns";

interface PendingReservationsProps {
  refreshTrigger: number;
}

export const PendingReservations = ({ refreshTrigger }: PendingReservationsProps) => {
  const [reservations, setReservations] = useState<ReservationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('status', 'pending')
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true });

      if (error) throw error;

      const sorted = LinkedListManager.sortByDateTime(data as ReservationNode[]);
      setReservations(sorted);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      toast.error("Failed to load reservations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        () => {
          loadReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTrigger]);

  const handleMarkAsDone = async (id: string) => {
    playSound('click');

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Reservation marked as completed!");
      playSound('success');
    } catch (error) {
      console.error('Failed to update reservation:', error);
      toast.error("Failed to update reservation");
      playSound('error');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Loading reservations...</p>
        </CardContent>
      </Card>
    );
  }

  if (reservations.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground text-lg">No pending reservations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-3xl font-bold text-center mb-6">Pending Reservations</h2>
      
      {reservations.map((reservation, index) => (
        <Card 
          key={reservation.id} 
          className="animate-slide-up hover:shadow-lg transition-all duration-300"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  {reservation.name}
                </CardTitle>
                <Badge variant="secondary" className="text-sm">
                  Linked Node #{index + 1}
                </Badge>
              </div>
              <Button
                onClick={() => handleMarkAsDone(reservation.id)}
                className="bg-accent hover:bg-accent/90"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Done
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {format(new Date(reservation.reservation_date), 'MMMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-secondary" />
                <span className="font-medium">
                  {format(new Date(`2000-01-01T${reservation.reservation_time}`), 'hh:mm a')}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground pt-2">
              <FileText className="w-5 h-5 text-accent mt-1" />
              <p className="flex-1">{reservation.reason}</p>
            </div>
            {reservation.next_id && (
              <div className="pt-2 text-xs text-muted-foreground border-t">
                Next in list: {reservation.next_id.substring(0, 8)}...
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
