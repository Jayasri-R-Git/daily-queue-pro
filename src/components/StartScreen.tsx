import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { playSound } from "@/utils/sounds";

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen = ({ onStart }: StartScreenProps) => {
  const handleStart = () => {
    playSound('pop');
    onStart();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center space-y-8 p-8 animate-fade-in">
        <div className="space-y-4">
          <div className="flex justify-center gap-4 mb-6">
            <Calendar className="w-16 h-16 text-primary animate-pulse-glow" />
            <Clock className="w-16 h-16 text-secondary animate-pulse-glow" />
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Reservation System
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Advanced linked list-based scheduling with intelligent time management
          </p>
        </div>

        <Button
          onClick={handleStart}
          size="lg"
          className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-pulse-glow"
        >
          Start Reservation
        </Button>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>Powered by C-style linked list implementation</p>
        </div>
      </div>
    </div>
  );
};
