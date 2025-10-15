import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { playSound } from "@/utils/sounds";
import { ThemeToggle } from "@/components/ThemeToggle";

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

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
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

        {/* Developer Credit Box */}
        <div className="pt-8">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 max-w-md mx-auto shadow-lg">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-primary">Developed by Jayasri R</p>
              <p className="text-muted-foreground">Reg No: 24MIS0183</p>
              <p className="text-muted-foreground">Vellore Institute of Technology, Vellore</p>
              <p className="text-muted-foreground">SCOPE - Computer Science Engineering and Information Systems</p>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-3">
                All copyright reserved to KishoreRaja P.C, Professor Grade 1
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
