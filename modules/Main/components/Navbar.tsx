"use client";
import Link from "next/link";
import { Factory, Home, LineChart, Settings, Users2 } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RouterKeys } from "@/constants/router";
import WithRole from "@/hoc/WithRole";
import { KeyRoles } from "@/constants/roles";

export default function NavBar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  return (
    <>
      <div className="fixed inset-y-0 left-0 z-10   flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={RouterKeys.MAIN}
                style={{
                  color: isActive(RouterKeys.MAIN) ? "white" : undefined,
                }}
                className={`flex h-9 w-9 items-center justify-center transition-all md:h-8 md:w-8 ${
                  isActive(RouterKeys.MAIN)
                    ? "text-background bg-primary rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Home className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={RouterKeys.USERS}
                style={{
                  color: isActive(RouterKeys.USERS) ? "white" : undefined,
                }}
                className={`flex h-9 w-9 items-center justify-center transition-all md:h-8 md:w-8 ${
                  isActive(RouterKeys.USERS)
                    ? "text-background bg-primary rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users2 className="h-5 w-5" />
                <span className="sr-only">Users</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Users</TooltipContent>
          </Tooltip>
          <WithRole roleKey={[KeyRoles.CUSTOMER]}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={RouterKeys.INSTALLATIONS}
                  style={{
                    color: isActive(RouterKeys.INSTALLATIONS)
                      ? "white"
                      : undefined,
                  }}
                  className={`flex h-9 w-9 items-center justify-center transition-all md:h-8 md:w-8 ${
                    isActive(RouterKeys.INSTALLATIONS)
                      ? "text-background bg-primary rounded-full"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Factory className="h-5 w-5" />
                  <span className="sr-only">Installations</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Installations</TooltipContent>
            </Tooltip>
          </WithRole>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                style={{
                  color: isActive(RouterKeys.ANALYTICS) ? "white" : undefined,
                }}
                className={`flex h-9 w-9 items-center justify-center transition-all md:h-8 md:w-8 ${
                  isActive(RouterKeys.ANALYTICS)
                    ? "text-background bg-primary rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LineChart className="h-5 w-5" />
                <span className="sr-only">Analytics</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Analytics</TooltipContent>
          </Tooltip>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                style={{
                  color: isActive(RouterKeys.SETTINGS) ? "white" : undefined,
                }}
                className={`flex h-9 w-9 items-center justify-center transition-all md:h-8 md:w-8 ${
                  isActive(RouterKeys.SETTINGS)
                    ? "text-background bg-primary rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </div>
    </>
  );
}
