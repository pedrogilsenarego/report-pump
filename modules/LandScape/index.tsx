import AuthButton from "./components/AuthButton";

export default function Landscape() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <main>
        <div className="border px-3 w-full flex flex-col space-y-2 rounded-md">
          <p>Equitotal</p>
          <AuthButton />
        </div>
      </main>
    </div>
  );
}
