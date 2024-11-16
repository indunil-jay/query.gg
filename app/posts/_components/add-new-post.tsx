import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { PostForm } from "./post-form";
import { useState } from "react";

export const AddNewPost = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const closeDialog = () => {
    setDialogOpen(false);
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit">
          Add New Post <PlusCircleIcon className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Your New Post</DialogTitle>
          <DialogDescription>
            Make sure click save button when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className=" py-4">
          <PostForm closeDialog={closeDialog} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
