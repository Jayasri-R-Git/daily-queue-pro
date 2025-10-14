// Linked List Data Structure Implementation (C-style in TypeScript)
export interface ReservationNode {
  id: string;
  name: string;
  reservation_date: string;
  reservation_time: string;
  reason: string;
  status: 'pending' | 'completed';
  next_id: string | null;
  created_at: string;
  completed_at: string | null;
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
      const newDateTime = new Date(`${newReservation.reservation_date}T${newReservation.reservation_time}`);
      const existingDateTime = new Date(`${r.reservation_date}T${r.reservation_time}`);
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
      const dateA = new Date(`${a.reservation_date}T${a.reservation_time}`);
      const dateB = new Date(`${b.reservation_date}T${b.reservation_time}`);
      return dateA.getTime() - dateB.getTime();
    });

    return this.updateNextPointers(sorted);
  }

  /**
   * Check if a date/time slot is available
   */
  static isSlotAvailable(
    reservations: ReservationNode[],
    date: string,
    time: string,
    excludeId?: string
  ): boolean {
    return !reservations.some(
      (r) => r.reservation_date === date && 
            r.reservation_time === time && 
            r.id !== excludeId
    );
  }

  /**
   * Get pending reservations only
   */
  static getPendingReservations(reservations: ReservationNode[]): ReservationNode[] {
    return reservations.filter((r) => r.status === 'pending');
  }

  /**
   * Get completed reservations grouped by date
   */
  static getCompletedByDate(reservations: ReservationNode[]): Record<string, ReservationNode[]> {
    const completed = reservations.filter((r) => r.status === 'completed');
    
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
