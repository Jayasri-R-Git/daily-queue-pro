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
            <Calendar className="w-16 h-16 text-primary animate-slow-pulse" />
            <Clock className="w-16 h-16 text-secondary animate-slow-pulse" />
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
          className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-secondary shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.6)] hover:scale-105 transition-all duration-300"
        >
          Start Reservation
        </Button>

        {/* Developer Info */}
        <div className="pt-8 space-y-4 max-w-2xl mx-auto">
          {/* Developer Box */}
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold text-primary mb-3 font-serif">Developed by</h3>
            <div className="space-y-1 text-sm">
              <p className="text-foreground"><span className="font-semibold">Name:</span> Jayasri R</p>
              <p className="text-foreground">
                <span className="font-semibold">Email:</span>{" "}
                <a 
                  href="mailto:shreee2212@gmail.com" 
                  className="text-primary hover:underline transition-all"
                >
                  shreee2212@gmail.com
                </a>
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Contact:</span>{" "}
                <a 
                  href="tel:8148836156" 
                  className="text-primary hover:underline transition-all"
                >
                  8148836156
                </a>
              </p>
            </div>
          </div>

          {/* Copyright Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
