import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddPost } from "@/hooks/custom/use-add-post";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const postSchema = z.object({
  title: z
    .string()
    .min(1, { message: "The title can not be empty." })
    .max(64, { message: "The title is too long." }),
  body: z.string().min(1, { message: "The description can not be empty." }),
  tags: z.array(z.string()).max(3).optional(),
});

export const PostForm = ({ closeDialog }: { closeDialog: () => void }) => {
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  const { mutate, status } = useAddPost();
  const onSubmit = (values: z.infer<typeof postSchema>) => {
    mutate(values, {
      onSuccess: () => {
        toast("Post added successfully");
      },
      onError: (error) => {
        toast(`Failed to add post ${String(error)}`);
      },
      onSettled: () => {
        form.reset();
        closeDialog?.();
      },
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tell us a little bit about yourself"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                  rows={4}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
