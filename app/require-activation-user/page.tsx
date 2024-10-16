import LogoutButton from "@/components/logout";

export default function RequireActivationUserPage() {
  return (
    <div className="border w-full h-screen flex flex-col items-center justify-center">
      <p>
        Your account has not yet been activated by an admin, please wait or
        contact xxxxx@gmail.com.
      </p>
      <div className="mt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
