"use client";

import { BiRightArrowAlt } from "react-icons/bi";
import { FaEdit, FaSpinner } from "react-icons/fa";
import { Form } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaWpforms, FaRegTrashAlt } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LuView } from "react-icons/lu";
import { useRouter } from "next/navigation";
import { toast } from "./ui/use-toast";
import { DeleteForm } from "@/actions/form";
import { useTransition } from "react";

export function FormCard({ form }: { form: Form }) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();

  async function deleteForm() {
    try {
      await DeleteForm(form.id);
      toast({
        title: "Success",
        description: "Your form now is available to public.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between ">
          <span className="truncate font-bold">{form.name}</span>
          <div className="flex gap-x-3 items-center justify-center">
            <Button
              variant={"outline"}
              className="flex justify-center h-full border rounded-md"
              onClick={(e) => {
                e.stopPropagation();

                startTransition(deleteForm);
              }}
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin" />
              :<FaRegTrashAlt className="h-4 w-4" />}
            </Button>
            {form.published ? (
              <Badge>Published</Badge>
            ) : (
              <Badge variant={"destructive"}>Draft</Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription className="flex items-center justify-between text-muted-foreground text-sm">
          {formatDistance(form.createdAt, new Date(), {
            addSuffix: true,
          })}
          {form.published && (
            <span className="flex items-center gap-2">
              <LuView className="text-muted-foreground" />
              <span className="">{form.visits.toLocaleString()}</span>
              <FaWpforms className="text-muted-foreground" />
              <span className="">{form.visits.toLocaleString()}</span>
              <LuView className="text-muted-foreground" />
              <span className="">{form.submissions.toLocaleString()}</span>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[20px] truncate text-sm text-muted-foreground">
        {form.description || "No description"}
      </CardContent>
      <CardFooter>
        {form.published && (
          <Button asChild className="w-full mt-2 text-md gap-4">
            <Link href={`/forms/${form.id}`}>
              View submissions <BiRightArrowAlt />
            </Link>
          </Button>
        )}
        {!form.published && (
          <Button
            asChild
            variant={"secondary"}
            className="w-full mt-2 text-md gap-4"
          >
            <Link href={`/builder/${form.id}`}>
              Edit form <FaEdit />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
