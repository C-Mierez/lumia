import SVG from "@/components/svg/logo";

export default function Home() {
    return (
        <div>
            <div className="flex items-end gap-0.5 m-4">
                <SVG.BrandLogo className="fill-foreground w-7" />
                <h1 className="font-medium text-xl tracking-tighter font-brand leading-4">Lumia</h1>
            </div>
            <p className="">Some more text just for fun</p>
        </div>
    );
}
