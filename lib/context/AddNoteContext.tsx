import React, {createContext, useContext, useState} from "react";

type addNoteContextType = {
    navigateToAddNote: () => void,
    setNavigateToAddNote: (fn: () => void) => void
}

const addNoteContext = createContext<addNoteContextType | null>(null);

export const useAddNoteContext = () => {
    const context = useContext(addNoteContext);
    if(!context){
        throw new Error('useAddNoteContext must be used within AddNoteProvider');
    }

    return context;
}

export const AddNoteProvider: React.FC<{children: React.ReactNode}> = ({children}) => {

   const [navigateToAddNote, setNavigateToAddNote] = useState<()=> void>(() => {});

   return (
    <addNoteContext.Provider value={{navigateToAddNote, setNavigateToAddNote}}>
        {children}
    </addNoteContext.Provider>
   );
}