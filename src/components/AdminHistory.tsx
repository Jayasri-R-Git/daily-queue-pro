import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LinkedListManager, ReservationNode } from "@/utils/linkedList";
import { Calendar, Clock, User, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export const AdminHistory = () => {
  const [historyByDate, setHistoryByDate] = useState<Record<string, ReservationNode[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('status', 'completed')
          .order('reservation_date', { ascending: false })
          .order('reservation_time', { ascending: false });

        if (error) throw error;

        const grouped = LinkedListManager.getCompletedByDate(data as ReservationNode[]);
        setHistoryByDate(grouped);
      } catch (error) {
        console.error('Failed to load history:', error);
        toast.error("Failed to load history");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('history_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservations',
          filter: 'status=eq.completed'
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
      <Card className="w-full">
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Loading history...</p>
        </CardContent>
      </Card>
    );
  }

  const dates = Object.keys(historyByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (dates.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Reservation History</CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground text-lg">No completed reservations yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/10">
        <CardTitle className="text-3xl text-center flex items-center justify-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-accent" />
          Reservation History
        </CardTitle>
        <p className="text-center text-muted-foreground">Administrator View - Day by Day</p>
      </CardHeader>
      <CardContent className="pt-6">
        <Accordion type="single" collapsible className="space-y-4">
          {dates.map((date) => (
            <AccordionItem 
              key={date} 
              value={date}
              className="border rounded-lg px-4 bg-card hover:shadow-md transition-all"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-xl font-semibold">
                    {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {historyByDate[date].length} completed
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-3">
                {historyByDate[date].map((reservation) => (
                  <Card key={reservation.id} className="bg-muted/50">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-lg">{reservation.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(`2000-01-01T${reservation.reservation_time}`), 'hh:mm a')}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4 mt-1" />
                        <p className="flex-1 text-sm">{reservation.reason}</p>
                      </div>
                      {reservation.completed_at && (
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Completed: {format(new Date(reservation.completed_at), 'MMM dd, yyyy hh:mm a')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
