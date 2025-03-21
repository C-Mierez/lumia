interface StatsCardProps {
    children: React.ReactNode;
}

export default function StatsCard({ children }: StatsCardProps) {
    return <div className="bg-background-alt flex h-fit flex-col gap-4 rounded-md p-4 lg:p-6">{children}</div>;
}
