import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthButton from "./components/AuthButton";

export default function Landscape() {
  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col space-y-8">
      <h1>Equitotal</h1>
      <h2>Automatize your firepump reports</h2>
      <p>
        The following app requires the pre approval from the administration of
        equitotal. etc etc
      </p>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Equitotal</CardTitle>
          <CardDescription>Report you pump here</CardDescription>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter className="flex justify-between">
          <AuthButton />
        </CardFooter>
      </Card>
    </div>
  );
}
