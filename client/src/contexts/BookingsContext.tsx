import api from "@/services/api";
import { CreateBookingPayload } from "@/types";
import { createContext, ReactNode, useContext } from "react";

interface BookingsContextType {
    getWorkspaceSchedulesStatus: (workspaceId: string) => void
    createBooking: (bookingPayload: CreateBookingPayload) => void
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export function BookingsProvider({ children }: {children: ReactNode}) {
    const createBooking = async (bookingPayload: CreateBookingPayload) => {
        try {
            const response = await api.post(`/locatario/create`, bookingPayload);
            return response.data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const getWorkspaceSchedulesStatus = async (workspaceId: string) => {
        try {
            const bookings = await api.get(`/horarios/${workspaceId}`)
            return bookings
        } catch (err) {
            console.error(err)
            throw Error
        }
    };

    const contextValue = {
        getWorkspaceSchedulesStatus,
        createBooking
    };

    return (
        <BookingsContext.Provider value={contextValue}>
            {children}
        </BookingsContext.Provider>
    );
};

export const useBookings = () => {
    const context = useContext(BookingsContext);
    if (context === undefined) {
        throw new Error('useBookings must be used within a BookingsProvider');
    }
    return context;
};