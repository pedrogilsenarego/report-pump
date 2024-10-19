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
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
          <div className="w-full">teste</div>
          <div className="mx-5">{children}</div>
        </div>
      </div>
    </WithUserActive>
  );
}
