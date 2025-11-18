import api from "@/services/api";
import { CreateBookingPayload } from "@/types";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface BookingsContextType {
    getWorkspaceSchedulesStatus: (workspaceId: string) => void
    createBooking: (bookingPayload: CreateBookingPayload) => void
    fetchOwnerBookings: () => void
    approveBooking: (bookingId: string) => void
    denyBooking: (bookingId: string) => void
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export function BookingsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [ownerBookings, setOwnerBookings] = useState();

    useEffect(() => {
        if (user && user.tipo === 'locador') {
            fetchOwnerBookings();
        } else {
            setOwnerBookings(null);
            setIsLoading(false);
        }
    }, [user]);

    // ----------------------------------------------------------------------------------
    // ----------------------------------- LOCATÁRIO ------------------------------------
    // ----------------------------------------------------------------------------------

    const createBooking = async (bookingPayload: CreateBookingPayload) => {
        try {
            const response = await api.post(`/locatario/create`, bookingPayload);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const getWorkspaceSchedulesStatus = async (workspaceId: string) => {
        try {
            const bookings = await api.get(`/horarios/${workspaceId}`);
            return bookings;
        } catch (err) {
            throw err;
        }
    };

    // ----------------------------------------------------------------------------------
    // ------------------------------------ LOCADOR -------------------------------------
    // ----------------------------------------------------------------------------------

    const fetchOwnerBookings = async () => {
        try {
            const bookings = await api.get(`/locador/all`);
            // setOwnerBookings(bookings);
            console.log(bookings);
        } catch (err) {
            throw err;
        }
    }

    const approveBooking = async (bookingId: string) => {
        try {
            await api.patch(`/locador/${bookingId}/aceitar`);
            fetchOwnerBookings();
        } catch (err) {
            throw err;
        }
    }
    
    const denyBooking = async (bookingId: string) => {
        try {
            await api.patch(`/locador/${bookingId}/recusar`);
            fetchOwnerBookings();
        } catch (err) {
            throw err;
        }
    }

    const contextValue = {
        getWorkspaceSchedulesStatus,
        createBooking,
        fetchOwnerBookings,
        approveBooking,
        denyBooking
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