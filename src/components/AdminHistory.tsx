import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { ReservationNode } from "@/utils/linkedList";

export const AdminHistory = () => {
  const [historyByDate, setHistoryByDate] = useState<Record<string, ReservationNode[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['completed', 'cancelled'])
        .order('reservation_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;

      const grouped = (data as ReservationNode[]).reduce((acc, reservation) => {
        const date = reservation.reservation_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(reservation);
        return acc;
      }, {} as Record<string, ReservationNode[]>);

      setHistoryByDate(grouped);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    const channel = supabase
      .channel('history-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservations'
        },
        () => {
          loadHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dates = Object.keys(historyByDate);

  if (dates.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <p className="text-xl text-muted-foreground">No completed or cancelled reservations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="text-3xl text-center">Reservation History</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {dates.map((date) => {
            const reservations = historyByDate[date];
            const completed = reservations.filter(r => r.status === 'completed').length;
            const cancelled = reservations.filter(r => r.status === 'cancelled').length;
            
            return (
              <AccordionItem key={date} value={date} className="border rounded-lg px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="text-lg font-semibold">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {completed} Completed
                      </span>
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {cancelled} Cancelled
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    {reservations.map((reservation) => (
                      <Card key={reservation.id} className="bg-muted/30">
                        <CardContent className="pt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-lg">{reservation.name}</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                              reservation.status === 'completed' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}>
                              {reservation.status === 'completed' ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4" />
                                  Cancelled
                                </>
                              )}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Time:</span>
                              <p className="font-medium">
                                {format(new Date(`2000-01-01T${reservation.start_time}`), 'h:mm a')} - {format(new Date(`2000-01-01T${reservation.end_time}`), 'h:mm a')}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {reservation.status === 'completed' ? 'Completed at:' : 'Cancelled at:'}
                              </span>
                              <p className="font-medium">
                                {reservation.completed_at 
                                  ? format(new Date(reservation.completed_at), 'h:mm a, MMM d')
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Reason:</span>
                            <p className="text-sm">{reservation.reason}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};
