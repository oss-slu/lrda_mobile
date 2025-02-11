import React, { createContext, useContext, useState } from "react";

type AddNoteContextType = {
    navigateToAddNote: () => void;
    setNavigateToAddNote: (fn: () => void) => void;
    publishNote: () => void; // No Promise
    setPublishNote: (fn: () => void) => void;
};

const AddNoteContext = createContext<AddNoteContextType | null>(null);

export const useAddNoteContext = () => {
    const context = useContext(AddNoteContext);
    if (!context) {
        throw new Error("useAddNoteContext must be used within AddNoteProvider");
    }
    return context;
};

export const AddNoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [navigateToAddNote, setNavigateToAddNote] = useState<() => void>(() => {});
    const [publishNote, setPublishNote] = useState<() => void>(() => {});

    return (
        <AddNoteContext.Provider
            value={{
                navigateToAddNote,
                setNavigateToAddNote,
                publishNote,
                setPublishNote,
            }}
        >
            {children}
        </AddNoteContext.Provider>
    );
};
