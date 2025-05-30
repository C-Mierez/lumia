import { UploadIcon } from "lucide-react";

import { Button } from "@components/ui/button";
import MuxUploader, {
    MuxUploaderDrop,
    MuxUploaderFileSelect,
    MuxUploaderProgress,
    MuxUploaderStatus,
} from "@mux/mux-uploader-react";

interface VideoUploaderProps {
    endpoint: string | (() => Promise<string>) | null;
    onSuccess: () => void;
}

const UPLOADER_ID = "video-uploader";

export default function VideoUploader({ endpoint, onSuccess }: VideoUploaderProps) {
    return (
        <div>
            <MuxUploader id={UPLOADER_ID} onSuccess={onSuccess} endpoint={endpoint} className="group/uploader hidden" />
            <MuxUploaderDrop muxUploader={UPLOADER_ID} className="group/drop" draggable>
                <div slot="heading" className="flex flex-col items-center gap-6 py-4">
                    <div className="bg-accent/25 flex size-32 items-center justify-center gap-2 rounded-full transition-transform group-[&[active]]/drop:scale-110">
                        <UploadIcon className="text-accent size-12 group-[&[active]]/drop:animate-bounce" />
                    </div>
                    <div className="flex flex-col gap-2 text-center">
                        <p className="text-foreground text-sm">Drag and drop video to upload</p>
                        <p className="text-muted-foreground text-xs">
                            Your videos will be private until you publish them
                        </p>
                    </div>
                    <MuxUploaderFileSelect muxUploader={UPLOADER_ID}>
                        <Button variant={"secondary"} type="button">
                            Select files
                        </Button>
                    </MuxUploaderFileSelect>
                </div>
                <span slot="separator" className="hidden" />
                <MuxUploaderStatus muxUploader={UPLOADER_ID} className="text-sm" />
                <MuxUploaderProgress muxUploader={UPLOADER_ID} className="text-sm" type="percentage" />
                <MuxUploaderProgress muxUploader={UPLOADER_ID} className="text-sm" type="bar" />
            </MuxUploaderDrop>
        </div>
    );
}
