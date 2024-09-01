import { GetFormById, GetFormWithSubmissions } from "@/actions/form";
import FormBuilder from "@/components/FormBuilder";
import FormLinkShare from "@/components/FormLinkShare";
import VisitBtn from "@/components/VisitBtn";
import React, { ElementType, ReactNode } from "react";
import { StatsCard } from "../../page";
import { LuView } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import { HiCursorClick } from "react-icons/hi";
import { TbArrowBounce } from "react-icons/tb";
import { ElementsType, FormElementInstance } from "@/components/FormElements";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

async function FormDetailsPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { id } = params;
  const form = await GetFormById(Number(id));
  if (!form) throw new Error("form not found");

  const { visits, submissions } = form;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return (
    <>
      <div className="py-10  border-b border-muted">
        <div className="flex justify-between container">
          <h1 className="text-4xl fonr-bold truncate">{form.name}</h1>
          <VisitBtn shareUrl={form.shareUrl} />
        </div>
      </div>
      <div className="py-4 border-b border-muted">
        <div className="container flex gap-2 items-center justify-between">
          <FormLinkShare shareUrl={form.shareUrl} />
        </div>
      </div>
      <div className="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 container">
        <StatsCard
          title="Total visits"
          icon={<LuView className="text-blue-600" />}
          helperText="All time form visits"
          value={visits.toLocaleString() || ""}
          loading={false}
          className="shadow-md shadow-blue-600"
        />
        <StatsCard
          title="Total submissions"
          icon={<FaWpforms className="text-yellow-600" />}
          helperText="All time form submissions"
          value={submissions.toLocaleString() || ""}
          loading={false}
          className="shadow-md shadow-yellow-600"
        />
        <StatsCard
          title="Submission rate"
          icon={<HiCursorClick className="text-green-600" />}
          helperText="Visits that result in form submissions"
          value={submissionRate.toLocaleString() + "%" || ""}
          loading={false}
          className="shadow-md shadow-green-600"
        />
        <StatsCard
          title="Bounce rate"
          icon={<TbArrowBounce className="text-red-600" />}
          helperText="Visits that leave without interacting"
          value={bounceRate.toLocaleString() + "%" || ""}
          loading={false}
          className="shadow-md shadow-red-600"
        />
      </div>
      <div className="container pt-10 ">
        <SubmissionsTable id={form.id} />
      </div>
    </>
  );
}

export default FormDetailsPage;

type Row = { [key: string]: string } & { submittedAt: Date };

async function SubmissionsTable({ id }: { id: number }) {
  const form = await GetFormWithSubmissions(id);
  if (!form) {
    throw new Error("form not found");
  }

  const formElements = form.content as FormElementInstance[];
  const columns: {
    id: string;
    label: string;
    required: boolean;
    type: ElementsType;
  }[] = [];

  formElements.forEach((element) => {
    switch (element.type) {
      case "NumberField":
      case "TextField":
      case "TextAreaField":
      case "DateField":
      case "SelectField":
      case "CheckBoxField":
        columns.push({
          id: element.id,
          label: element.extraAttributes?.label,
          required: element.extraAttributes?.required,
          type: element.type,
        });
        break;

      default:
        break;
    }
  });
  let rows: Row[] = [];

  form.FormSubmissions.forEach((q) => {
    const content = JSON.parse(JSON.stringify(q.content));
    // console.log({content})
    rows.push({
      ...content,
      submittedAt: q.createdAt,
    });
  });

  return (
    <>
      <h1 className="text-2xl font-bold my-4">Submissions</h1>
      <div className="rounded-md border ">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((q) => {
                return (
                  <TableHead key={q.id} className="uppercase">
                    {q.label}
                  </TableHead>
                );
              })}
              <TableHead className="text-muted-foreground text-right uppercase">
                Summited at
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((q, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <RowCell
                    key={column.id}
                    type={column.type}
                    value={q[column.id]}
                  />
                ))}
                <TableCell className="text-muted-foreground text-right">
                  {formatDistance(q.submittedAt, new Date())}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function RowCell({ type, value }: { type: ElementsType; value: string }) {
  let node: ReactNode = value;

  switch (type) {
    case 'DateField':
      if(!value) break;
      const date = new Date(value);
      node = <Badge variant={'outline'}>
        {format(date,'dd/MM/yyyy')}
      </Badge>
      break;
    case 'CheckBoxField':
      const check = value === 'true';
      node = <Checkbox checked={check} disabled />
      break;
    default:
      break;
  }

  return <TableCell>{node}</TableCell>;
}
