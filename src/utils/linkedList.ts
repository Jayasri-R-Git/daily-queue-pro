// Linked List Data Structure Implementation (C-style in TypeScript)
export interface ReservationNode {
  id: string;
  name: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
  next_id: string | null;
  created_at: string;
  completed_at: string | null;
  user_id: string;
}

export class LinkedListManager {
  /**
   * Insert a new reservation in sorted order by date and time
   * Maintains linked list structure
   */
  static insertSorted(
    reservations: ReservationNode[],
    newReservation: ReservationNode
  ): ReservationNode[] {
    const sorted = [...reservations];
    
    // Find insertion point based on date/time
    let insertIndex = sorted.findIndex((r) => {
      const newDateTime = new Date(`${newReservation.reservation_date}T${newReservation.start_time}`);
      const existingDateTime = new Date(`${r.reservation_date}T${r.start_time}`);
      return newDateTime < existingDateTime;
    });

    if (insertIndex === -1) {
      insertIndex = sorted.length;
    }

    // Insert at correct position
    sorted.splice(insertIndex, 0, newReservation);

    // Update linked list pointers
    return this.updateNextPointers(sorted);
  }

  /**
   * Update next_id pointers to maintain linked list structure
   */
  static updateNextPointers(reservations: ReservationNode[]): ReservationNode[] {
    return reservations.map((reservation, index) => ({
      ...reservation,
      next_id: index < reservations.length - 1 ? reservations[index + 1].id : null,
    }));
  }

  /**
   * Sort reservations by date and time (mimics C qsort)
   */
  static sortByDateTime(reservations: ReservationNode[]): ReservationNode[] {
    const sorted = [...reservations].sort((a, b) => {
      const dateA = new Date(`${a.reservation_date}T${a.start_time}`);
      const dateB = new Date(`${b.reservation_date}T${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    });

    return this.updateNextPointers(sorted);
  }

  /**
   * Check if a date/time slot is available with time range overlap detection
   */
  static isSlotAvailable(
    reservations: ReservationNode[],
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): boolean {
    return !reservations.some((r) => {
      if (r.reservation_date !== date || r.id === excludeId) return false;
      
      // Check for time overlap
      const newStart = this.timeToMinutes(startTime);
      const newEnd = this.timeToMinutes(endTime);
      const existingStart = this.timeToMinutes(r.start_time);
      const existingEnd = this.timeToMinutes(r.end_time);
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get pending reservations only
   */
  static getPendingReservations(reservations: ReservationNode[]): ReservationNode[] {
    return reservations.filter((r) => r.status === 'pending');
  }

  /**
   * Get completed and cancelled reservations grouped by date
   */
  static getCompletedByDate(reservations: ReservationNode[]): Record<string, ReservationNode[]> {
    const completed = reservations.filter((r) => r.status === 'completed' || r.status === 'cancelled');
    
    return completed.reduce((acc, reservation) => {
      const date = reservation.reservation_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(reservation);
      return acc;
    }, {} as Record<string, ReservationNode[]>);
  }
}
