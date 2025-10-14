import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playSound } from "@/utils/sounds";
import { Loader2 } from "lucide-react";

interface ReservationFormProps {
  onSuccess: () => void;
}

export const ReservationForm = ({ onSuccess }: ReservationFormProps) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click');

    if (!name || !date || !time || !reason) {
      toast.error("All fields are required");
      playSound('error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if slot is available
      const { data: existing, error: checkError } = await supabase
        .from('reservations')
        .select('id')
        .eq('reservation_date', date)
        .eq('reservation_time', time)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        toast.error("This date and time slot is already reserved!");
        playSound('error');
        setIsSubmitting(false);
        return;
      }

      // Insert new reservation
      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          name: name.trim(),
          reservation_date: date,
          reservation_time: time,
          reason: reason.trim(),
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast.success("Reservation created successfully!");
      playSound('success');
      
      // Reset form
      setName("");
      setDate("");
      setTime("");
      setReason("");
      
      onSuccess();
    } catch (error) {
      console.error('Reservation error:', error);
      toast.error("Failed to create reservation");
      playSound('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl animate-scale-in">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="text-3xl text-center">New Reservation</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="text-lg py-6"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-lg">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-lg py-6"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-lg">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="text-lg py-6"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-lg">Reason for Reservation</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for your reservation"
              className="text-lg min-h-32"
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Reserve Now'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
