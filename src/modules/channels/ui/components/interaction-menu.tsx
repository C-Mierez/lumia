"use client";

import { Button } from "@components/ui/button";
import "./interaction-menu.css";

interface Props {
    onEdit: () => void;
    onDiscard: () => void;
    isEditing: boolean;
    isPending: boolean;
    isDirty: boolean;
}

export default function InteractionMenu({ onEdit, onDiscard, isEditing, isPending, isDirty }: Props) {
    return (
        <div className="bg-muted menu fixed bottom-16 mx-auto flex flex-col gap-3 rounded-md p-4 md:right-[4vw] md:bottom-[4vw] xl:right-[3vw] xl:bottom-[3vw]">
            <p className="text-muted-foreground text-sm">
                {isEditing ? (isDirty ? "You have unsaved changes." : "No changes to save.") : "Preview mode."}
            </p>
            <div className="flex gap-2">
                <Button size="sm" type="button" onClick={onEdit}>
                    {isEditing ? "Preview" : "Edit"}
                </Button>
                <Button size="sm" type="submit" disabled={!isEditing || isPending || !isDirty}>
                    Save
                </Button>
                <Button
                    variant={"ghost"}
                    size="sm"
                    type="button"
                    disabled={!isEditing || isPending || !isDirty}
                    onClick={onDiscard}
                >
                    Discard
                </Button>
            </div>
        </div>
    );
}
