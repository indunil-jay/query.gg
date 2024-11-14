"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { CopyCheck, Share } from "lucide-react";
import { toast } from "sonner";

export const CopyToClipboardBtn = ({ postId }: { postId: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(`http://localhost:3000/posts/${postId}`)
      .then(() => {
        setIsCopied(true);
        toast("URL text has been copied", {
          description: "use to direct navigation to a post.",

          action: {
            label: "Undo",
            onClick: () => {},
          },
        });
      })
      .catch((err) => {
        toast("something went wrong", {
          description: "URL is not copied to clipboard.",
          action: {
            label: "Undo",
            onClick: () => {},
          },
        });
      });
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);

      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <Button variant={"ghost"} size={"sm"} onClick={copyToClipboard}>
      {isCopied ? (
        <>
          <CopyCheck className="size-4 text-emerald-500" />{" "}
          <span className="mr-2 text-emerald-500">copied</span>
        </>
      ) : (
        <>
          <Share className="size-4" />
          share
        </>
      )}
    </Button>
  );
};
