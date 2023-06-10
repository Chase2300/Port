import { createContext, useState } from "react";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [showToast, setShowToast] = useState(false);

    const handleToastClose = () => {
        setShowToast(false);
    };

    const alertContext = {
        showToast,
        setShowToast,
        handleToastClose,
    };

    return (
        <ToastContext.Provider value={alertContext}>
            {children}
        </ToastContext.Provider>
    );
};