import api from "@/services/api";
import { CreateBookingPayload } from "@/types";
import { createContext, ReactNode, useContext } from "react";

interface BookingsContextType {
    getBookingsByWorkspaceId: (workspaceId: string) => void
    createBooking: (bookingPayload: CreateBookingPayload) => void
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export function BookingsProvider({ children }: {children: ReactNode}) {
    const createBooking = async (bookingPayload: CreateBookingPayload) => {
        try {
            await api.post(`/locatario/create`, bookingPayload);
        } catch (err) {
            console.error(err);
            throw Error;
        }
    };

    const getBookingsByWorkspaceId = async (workspaceId: string) => {
        try {
            const bookings = await api.get(`/locatario/sala/${workspaceId}`)
            return bookings
        } catch (err) {
            console.error(err)
            throw Error
        }
    };

    const contextValue = {
        getBookingsByWorkspaceId,
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