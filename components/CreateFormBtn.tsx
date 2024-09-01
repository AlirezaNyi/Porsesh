"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

import { ImSpinner2 } from "react-icons/im";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

import { formSchema, formSchematype } from "@/schemas/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";
import { CreateForm } from "@/actions/form";
import {BsFileEarmarkPlus} from 'react-icons/bs'
import { useRouter } from "next/navigation";

function CreateFormBtn() {
  const router = useRouter();
  const form = useForm<formSchematype>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: formSchematype) {
    try {
      const formId = await CreateForm(values);
      router.push(`/builder/${formId}`);
      toast({
        title: "Success",
        description: "Form created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong please try again later",
        variant: "destructive",
      });
    }
  }
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={'outline'} className="group w-full boder border-primary/20 h-[190px]
          items-center justify-center flex flex-col hover:praimary hover:cursor-pointer
           gap-4 bg-background">
            <BsFileEarmarkPlus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
            <p className="font-bold text-xl text-muted-foreground">Create new form</p>
            </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create form</DialogTitle>
            <DialogDescription>
              Create a new form to start collecting responses
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting}
              className="w-full mt-4"
            >
              {!form.formState.isSubmitting ? (
                <span>Save</span>
              ) : (
                <ImSpinner2 className="animate-spin" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateFormBtn;
