"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onOpenChange: (signal: boolean) => void;
};

export default function Terms(props: Props) {
  useEffect(() => {
    if (!props.open) return;

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      const { scrollTop, scrollHeight, clientHeight } = target;

      if (scrollTop + clientHeight >= scrollHeight) {
        console.log("finished");
      }
    };

    // Delay to ensure the dialog mounts fully, then find the scrollable div
    const timer = setTimeout(() => {
      const descriptionEl = document.querySelector(".terms-description");
      if (descriptionEl) {
        descriptionEl.addEventListener("scroll", handleScroll);
      }
    }, 100);

    // Cleanup on unmount or close
    return () => {
      clearTimeout(timer);
      const descriptionEl = document.querySelector(".terms-description");
      if (descriptionEl) {
        descriptionEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, [props.open]);
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Read our terms and conditions</DialogTitle>
          <DialogDescription>
            <div className=" terms-description max-h-[550px] overflow-y-auto ">
              <p>
                {" "}
                What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the
                printing and typesetting industry. Lorem Ipsum has been the
                standard dummy text ever since the 1500s, when an unknown
                printer took a galley of type and scrambled it to make a type
                specimen book. It has survived not only five centuries, but also
                the leap into electronic typesetting, remaining essentially
                unchanged. It was popularised in the 1960s with the release of
                Letraset sheets containing Lorem Ipsum passages, and more
                recently with desktop publishing software like Aldus PageMaker
                including versions of Lorem Ipsum. Why do we use it? It is a
                long established fact that a reader will be distracted by the
                readable content of a page when looking at its layout. The point
                of using Lorem Ipsum is that it has a more-or-less normal
                distribution of letters, as opposed to using ntent here, content
                making it look like readable English. Many desktop publishing
                packages and web page editors now use Lorem Ipsum as their
                default model text, and a search fororem will uncover many web
                sites still in their infancy. Various versions have evolved over
                the years, sometimes by accident, sometimes on purpose (injected
                humour and the like). Where does it come from? Contrary to
                popular belief, Lorem Ipsum is not simply random text. It has
                roots in a piece of classical Latin literature from 45 BC,
                making it over 2000 years old. Richard McClintock, a Latin
                professor at Hampden-Sydney College in Virginia, looked up one
                of the more obscure Latin words, consectetur, from a Lorem Ipsum
                passage, and going through the cites of the word in classical
                literature, discovered the undoubtable source. Lorem Ipsum comes
                from sections 1.10.32 and 1.10.33 ofde Finibus Bonorum et (The
                Extremes of Good and Evil) by Cicero, written in 45 BC. This
                book is a treatise on the theory of ethics, very popular during
                the Renaissance. The first line of Lorem Ipsum, ipsum dolor sit
                amet.., comes from a line in section 1.10.32. The standard chunk
                of Lorem Ipsum used since the 1500s is reproduced below for
                those interested. Sections 1.10.32 and 1.10.33 from inibus
                Bonorum et by Cicero are also reproduced in their exact original
                form, accompanied by English versions from the 1914 translation
                by H. Rackham. Where can I get some? There are many variations
                of passages of Lorem Ipsum available, but the majority have
                suffered alteration in some form, by injected humour, or
                randomised words which look even slightly believable. If you are
                going to use a passage of Lorem Ipsum, you need to be sure there
                t anything embarrassing hidden in the middle of text. All the
                Lorem Ipsum generators on the Internet tend to repeat predefined
                chunks as necessary, making this the first true generator on the
                Internet. It uses a dictionary of over 200 Latin words, combined
                with a handful of model sentence structures, to generate Lorem
                Ipsum which looks reasonable. The generated Lorem Ipsum is
                therefore always free from repetition, injected humour, or
                non-characteristic words etc.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
