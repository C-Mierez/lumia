"use client";
import { Toaster as Sonner, ToasterProps } from "sonner";

import css from "./sonner.module.css";

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className={css.customSonner}
            toastOptions={{
                classNames: {
                    toast: css.customToast,
                    description: css.customDescription,
                    actionButton: css.customActionButton,
                    cancelButton: css.customCancelButton,
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
