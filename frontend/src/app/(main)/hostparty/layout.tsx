import Sidebar from "@/components/sidebar";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar overlays content on the left */}
            <Sidebar />
            {/* Main Content; add left padding equal to collapsed width to avoid content underlap */}
            <main className="relative flex-1 pl-16 pr-16">
                <div className="h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
