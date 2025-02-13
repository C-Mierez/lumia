import { UploadIcon } from "lucide-react";

import { Button } from "@components/ui/button";
import MuxUploader, {
    MuxUploaderDrop,
    MuxUploaderFileSelect,
    MuxUploaderProgress,
    MuxUploaderStatus,
} from "@mux/mux-uploader-react";

interface VideoUploaderProps {
    endpoint?: string | null;
}

const UPLOADER_ID = "video-uploader";

export default function VideoUploader({ endpoint }: VideoUploaderProps) {
    return (
        <div>
            <MuxUploader id={UPLOADER_ID} endpoint={endpoint} className="group/uploader hidden" />
            <MuxUploaderDrop muxUploader={UPLOADER_ID} className="group/drop" draggable>
                <div slot="heading" className="flex flex-col items-center gap-6">
                    <div className="bg-accent/25 flex size-32 items-center justify-center gap-2 rounded-full">
                        <UploadIcon className="text-accent size-12" />
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
