import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playSound } from "@/utils/sounds";
import { format, isAfter, isBefore, parse } from "date-fns";
import { Loader2, X, ChevronRight } from "lucide-react";
import type { ReservationNode } from "@/utils/linkedList";

interface PendingReservationsProps {
  refreshTrigger: number;
}

export const PendingReservations = ({ refreshTrigger }: PendingReservationsProps) => {
  const [reservations, setReservations] = useState<ReservationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReservations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('status', 'pending')
        .eq('user_id', user.id)
        .order('reservation_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      setReservations(data as ReservationNode[]);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();

    const channel = supabase
      .channel('reservations-changes')
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

  // Separate effect for auto-completion check
  useEffect(() => {
    const checkCompletedReservations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all pending reservations directly from database
        const { data: pendingReservations, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('status', 'pending')
          .eq('user_id', user.id);

        if (error || !pendingReservations) return;

        const now = new Date();
        
        for (const reservation of pendingReservations) {
          // Use end_date if available, otherwise use reservation_date
          const finalDate = reservation.end_date || reservation.reservation_date;
          const endDate = new Date(finalDate);
          const endDateTime = parse(reservation.end_time, 'HH:mm:ss', endDate);
          
          // If current time is past end time, mark as completed
          if (isAfter(now, endDateTime)) {
            const { error: updateError } = await supabase
              .from('reservations')
              .update({ 
                status: 'completed',
                completed_at: new Date().toISOString()
              })
              .eq('id', reservation.id)
              .eq('status', 'pending');

            if (!updateError) {
              toast.success(`Reservation for ${reservation.name} completed!`);
              playSound('success');
            }
          }
        }
      } catch (error) {
        console.error('Error checking completed reservations:', error);
      }
    };

    // Check immediately on mount
    checkCompletedReservations();

    // Then check every 10 seconds
    const interval = setInterval(checkCompletedReservations, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleCancel = async (id: string) => {
    playSound('click');

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Reservation cancelled successfully!");
      playSound('success');
      loadReservations();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error("Failed to cancel reservation");
      playSound('error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <p className="text-xl text-muted-foreground">No pending reservations</p>
        </CardContent>
      </Card>
    );
  }

  const getReservationStatus = (reservation: ReservationNode, index: number) => {
    const now = new Date();
    const startDate = new Date(reservation.reservation_date);
    const startDateTime = parse(reservation.start_time, 'HH:mm:ss', startDate);
    
    const finalDate = reservation.end_date || reservation.reservation_date;
    const endDate = new Date(finalDate);
    const endDateTime = parse(reservation.end_time, 'HH:mm:ss', endDate);
    
    // Check if reservation is currently ongoing
    if (isAfter(now, startDateTime) && isBefore(now, endDateTime)) {
      return { text: "Ongoing", className: "bg-green-500 text-white animate-pulse" };
    }
    
    // Check if any reservation is ongoing
    const hasOngoing = reservations.some((res, idx) => {
      const resStartDate = new Date(res.reservation_date);
      const resStartTime = parse(res.start_time, 'HH:mm:ss', resStartDate);
      const resFinalDate = res.end_date || res.reservation_date;
      const resEndDate = new Date(resFinalDate);
      const resEndTime = parse(res.end_time, 'HH:mm:ss', resEndDate);
      return isAfter(now, resStartTime) && isBefore(now, resEndTime);
    });
    
    // If there's an ongoing reservation, show "Next in list" for the first non-ongoing one
    // If no ongoing, show "Next in list" for the first reservation
    if (hasOngoing) {
      // Find the first non-ongoing reservation
      const firstNonOngoing = reservations.findIndex((res) => {
        const resStartDate = new Date(res.reservation_date);
        const resStartTime = parse(res.start_time, 'HH:mm:ss', resStartDate);
        const resFinalDate = res.end_date || res.reservation_date;
        const resEndDate = new Date(resFinalDate);
        const resEndTime = parse(res.end_time, 'HH:mm:ss', resEndDate);
        return !(isAfter(now, resStartTime) && isBefore(now, resEndTime));
      });
      
      if (index === firstNonOngoing) {
        return { text: "Next in list", className: "bg-primary text-primary-foreground" };
      }
    } else if (index === 0) {
      return { text: "Next in list", className: "bg-primary text-primary-foreground" };
    }
    
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Pending Reservations ({reservations.length})
      </h2>
      
      {reservations.map((reservation, index) => {
        const status = getReservationStatus(reservation, index);
        
        return (
          <Card key={reservation.id} className="shadow-lg hover:shadow-xl transition-all animate-fade-in">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  {reservation.name}
                  {status && (
                    <span className={`text-xs px-2 py-1 rounded-full ${status.className}`}>
                      {status.text}
                    </span>
                  )}
                </CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancel(reservation.id)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="text-lg font-semibold">
                  {format(new Date(reservation.reservation_date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-lg font-semibold">
                  {format(new Date(`2000-01-01T${reservation.start_time}`), 'h:mm a')} - {format(new Date(`2000-01-01T${reservation.end_time}`), 'h:mm a')}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reason</p>
              <p className="text-base">{reservation.reason}</p>
            </div>
            {reservation.next_id && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <ChevronRight className="h-4 w-4" />
                <span>Has next reservation</span>
              </div>
            )}
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
};
