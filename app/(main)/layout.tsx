import NavBar from "@/modules/Main/components/Navbar";
import WithUserActive from "@/hoc/WithUserActive";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WithUserActive>
      <div className="w-full min-h-screen mx-auto flex h-full bg-muted/40">
        <NavBar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
            {children}
          </main>
        </div>
      </div>
    </WithUserActive>
  );
}
