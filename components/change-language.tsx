"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import React from "react";
import { CheckIcon, ChevronDownIcon, GlobeIcon, XIcon } from "lucide-react";
import { i18n } from "@/translations/i18n";
import useChangeLang from "@/hook/usechangeLang";
import { LANG } from "@/constants/lang";

type Props = {
  type: "drawer" | "dropdown";
};

export default function ChangeLanguage(props: Props) {
  const { changeLanguage } = useChangeLang();
  const getLanguage = () => i18n.language;

  return (
    <>
      {props.type === "dropdown" ? (
        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <GlobeIcon className="h-5 w-5" />
                <span>{getLanguage().toUpperCase()}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => changeLanguage(LANG.en)}
                className="flex items-center justify-between"
              >
                <span>English</span>
                {getLanguage() === LANG.en && <CheckIcon className="h-5 w-5" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage(LANG.pt)}>
                <span>Português</span>
                {getLanguage() === LANG.pt && <CheckIcon className="h-5 w-5" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <GlobeIcon className="h-5 w-5" />
              <span>EN</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="grid gap-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Language</h3>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <XIcon className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
              <div className="grid gap-2">
                <Button variant="ghost" className="justify-start gap-2">
                  <GlobeIcon className="h-5 w-5" />
                  <span>English</span>
                  <CheckIcon className="h-5 w-5 ml-auto" />
                </Button>
                <Button
                  onClick={() => i18n.changeLanguage("pt")}
                  variant="ghost"
                  className="justify-start gap-2"
                >
                  <GlobeIcon className="h-5 w-5" />
                  <span>Portugês</span>
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
