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
    <div className="w-screen h-screen flex justify-center items-center">
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
