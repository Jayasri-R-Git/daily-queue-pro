import { useState } from "react";
import { StartScreen } from "@/components/StartScreen";
import { ReservationForm } from "@/components/ReservationForm";
import { PendingReservations } from "@/components/PendingReservations";
import { AdminHistory } from "@/components/AdminHistory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LayoutDashboard, History } from "lucide-react";
import { playSound } from "@/utils/sounds";

const Index = () => {
  const [showStart, setShowStart] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStart = () => {
    setShowStart(false);
  };

  const handleBack = () => {
    playSound('click');
    setShowStart(true);
  };

  const handleReservationSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (showStart) {
    return <StartScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            className="shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Start
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Reservation Management
          </h1>
          <div className="w-32" /> {/* Spacer for balance */}
        </div>

        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 h-14">
            <TabsTrigger value="manage" className="text-lg" onClick={() => playSound('click')}>
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="history" className="text-lg" onClick={() => playSound('click')}>
              <History className="mr-2 h-5 w-5" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-8">
            <ReservationForm onSuccess={handleReservationSuccess} />
            <PendingReservations refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="history">
            <AdminHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
