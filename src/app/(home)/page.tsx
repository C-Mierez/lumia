import { HydrateClient, trpc } from "@/trpc/server";
import HomeView from "@modules/home/ui/views/home-view";

export const dynamic = "force-dynamic";

interface HomeProps {
    searchParams: Promise<{
        categoryId?: string;
    }>;
}

export default async function Home({ searchParams }: HomeProps) {
    const { categoryId } = await searchParams;

    void trpc.categories.getMany.prefetch();

    return (
        <HydrateClient>
            <HomeView categoryId={categoryId} />
        </HydrateClient>
    );
}
