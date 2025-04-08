import React, { createContext, useContext, useState } from "react";

type EditNoteContextType = {
    navigateToEditNote: () => void;
    setNavigateToEditNote: (fn: () => void) => void;
    publishEditNote: () => void; // No Promise
    setPublishEditNote: (fn: () => void) => void;
};

const EditNoteContext = createContext<EditNoteContextType | null>(null);

export const useEditNoteContext = () => {
    const context = useContext(EditNoteContext);
    if (!context) {
        throw new Error("useEditNoteContext must be used within EditNoteProvider");
    }
    return context;
};

export const EditNoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [navigateToEditNote, setNavigateToEditNote] = useState<() => void>(() => {});
    const [publishEditNote, setPublishEditNote] = useState<() => void>(() => {});

    return (
        <EditNoteContext.Provider
            value={{
                navigateToEditNote,
                setNavigateToEditNote,
                publishEditNote,
                setPublishEditNote,
            }}
        >
            {children}
        </EditNoteContext.Provider>
    );
};
