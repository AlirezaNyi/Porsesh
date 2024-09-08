"use server";

import prisma from "@/lib/prisma";
import { formSchema, formSchematype } from "@/schemas/form";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

class UserNotFoundErr extends Error {}
// const router = useRouter();

export async function GetFormStats() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in')
    throw new UserNotFoundErr();
    
  }

  const stats = prisma.form.aggregate({
    where: {
      userId: user.id,
      status:1
    },
    _sum: {
      visits: true,
      submissions: true,
    },
  });

  const visits = (await stats)._sum.visits || 0;
  const submissions = (await stats)._sum.submissions || 0;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return {
    visits,
    submissions,
    submissionRate,
    bounceRate,
  };
}

export async function CreateForm(data: formSchematype) {
  const validation = formSchema.safeParse(data);

  if (!validation.success) {
    throw new Error("form not valid");
  }
  const user = await currentUser();

    
  if (!user) redirect('/sign-in');//throw new UserNotFoundErr();

  const { name, description } = data;

  const form = await prisma.form.create({
    data: {
      userId: user.id,
      name,
      description,
    },
  });

  if (!form) throw new Error("something went wrong");

  return form.id;
}

export async function GetForms() {
  const user = await currentUser();

  if (!user) redirect('/sign-in');
  //throw new UserNotFoundErr();

  return await prisma.form.findMany({
    where: {
      userId: user.id,
      status:1
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function GetFormById(id: number) {
  const user = await currentUser();

  if (!user) redirect('/sign-in');//throw new UserNotFoundErr();

  return await prisma.form.findUnique({
    where: {
      userId: user.id,
      id,
      status:1

    },
  });
}

export async function UpdateFormContent(id: number, jsonContent: string) {
  const user = await currentUser();

  if (!user) redirect('/sign-in');//throw new UserNotFoundErr();

  return await prisma.form.update({
    where: {
      userId: user.id,
      id,
    },
    data: {
      content: JSON.parse(jsonContent),
    },
  });
}

export async function PublishForm(id: number) {
  const user = await currentUser();

  if (!user) redirect('/sign-in');//throw new UserNotFoundErr();

  return await prisma.form.update({
    where: {
      userId: user.id,
      id,
    },
    data: {
      published: true,
    },
  });
}

export async function GetFormContentByUrl(formUrl: string) {
  return await prisma.form.update({
    select: {
      content: true,
    },
    data: {
      visits: {
        increment: 1,
      },
    },
    where: {
      shareUrl: formUrl,
    },
  });
}

export async function SubmitForm(formUrl: string, jsonContent: string) {
  return await prisma.form.update({
    data: {
      submissions: {
        increment: 1,
      },
      FormSubmissions: {
        create: {
          content: JSON.parse(jsonContent),
        },
      },
    },
    where: {
      shareUrl: formUrl,
      published: true,
    },
  });
}

export async function GetFormWithSubmissions(id: number) {
  const user = await currentUser();

  if (!user) redirect('/sign-in');//throw new UserNotFoundErr();

  return await prisma.form.findUnique({
    where:{
        id,
        userId:user.id,
      status:1
    },
    include:{
        FormSubmissions:true
    }
  })
}

export async function DeleteForm(id:number) {
  const user = await currentUser();

  if (!user) redirect('/sign-in');

  return await prisma.form.update({
    data: {
      status:3
    },
    where: {
      id
    },
  });
}