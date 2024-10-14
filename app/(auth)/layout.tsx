import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full min-h-screen mx-auto flex h-full ">
      <div className="w-1/2 flex justify-center items-center">
        <Image src="/assets/mainLogo.svg" alt="Logo" width={350} height={350} />
      </div>

      {children}
    </div>
  );
}
