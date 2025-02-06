import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
    return (
        <div>
            <div className="flex items-end gap-0.5 m-4">
                <Image src={"/logo.svg"} height={28} width={28} alt="Logo" />
                <h1 className="font-bold text-xl tracking-tighter font-brand leading-4">Lumia</h1>
            </div>
        </div>
    );
}
