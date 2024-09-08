"use client";

import { RxDropdownMenu } from "react-icons/rx";
import {
  ElementsType,
  FormElement,
  FormElementInstance,
  SubmitFunction,
} from "../FormElements";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import useDesigner from "../hooks/useDesigner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { toast } from "../ui/use-toast";

const type: ElementsType = "SelectField";

const extraAttributes = {
  label: "Select Field",
  helperText: "Helper text",
  required: false,
  placeHolder: "Value Here ... ",
  options: [],
  dir:'ltr'
};

const propertiesSchema = z.object({
  label: z.string().min(2).max(50),
  helperText: z.string().max(200),
  required: z.boolean().default(false),
  placeHolder: z.string().max(50),
  options: z.array(z.string()).default([]),
  dir: z.boolean()
});

export const SelectFieldFormElement: FormElement = {
  type,
  construct: (id: string) => ({
    id,
    type,
    extraAttributes,
  }),
  designerBtnElement: {
    icon: RxDropdownMenu,
    label: "Select Field",
  },
  designerComponent: DesignerComponent,
  formComponent: FormComponent,
  propertiesComponent: PropertiesComponent,
  validate: (
    formElement: FormElementInstance,
    currentValue: string
  ): boolean => {
    const element = formElement as CustumInstance;
    if (element.extraAttributes.required) {
      return currentValue.length > 0;
    }
    return true;
  },
};

type CustumInstance = FormElementInstance & {
  extraAttributes: typeof extraAttributes;
};

function FormComponent({
  elementInstance,
  submitValue,
  isInvalid,
  defaultValue,
}: {
  elementInstance: FormElementInstance;
  submitValue?: SubmitFunction;
  isInvalid?: boolean;
  defaultValue?: string;
}) {
  const element = elementInstance as CustumInstance;

  const [value, setValue] = useState(defaultValue || "");
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(isInvalid === true);
  }, [isInvalid]);

  const { helperText, label, placeHolder, required, options,dir } =
    element.extraAttributes;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label dir={dir} className={cn(error && "text-red-500")}>
        {label}
        {required && "*"}
      </Label>
      <Select
        defaultValue={value}
        onValueChange={(value) => {
          setValue(value);
          if (!submitValue) return;
          const valid = SelectFieldFormElement.validate(element, value);
          setError(!valid);
          submitValue(element.id, value);
        }}
      >
        <SelectTrigger dir={dir} className={cn("w-full ", error && "border-red-500")}>
          <SelectValue dir={dir} placeholder={placeHolder} />
        </SelectTrigger>
        <SelectContent dir={dir}>
          {options.map((option) => (
            <SelectItem dir={dir} key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helperText && (
        <p
        dir={dir}
          className={cn(
            "text-muted-foreground text-[0.8rem]",
            error && "text-red-500"
          )}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustumInstance;
  const { updateElement, setSelectedElement } = useDesigner();
  const form = useForm<propertiesFormSchemaType>({
    resolver: zodResolver(propertiesSchema),
    mode: "onSubmit",
    defaultValues: {
      label: element.extraAttributes.label,
      helperText: element.extraAttributes.helperText,
      placeHolder: element.extraAttributes.placeHolder,
      required: element.extraAttributes.required,
      options: element.extraAttributes.options,
      dir: element.extraAttributes.dir === 'rtl',
    },
  });

  useEffect(() => {
    form.reset({...element.extraAttributes,dir: element.extraAttributes.dir === 'rtl'});
  }, [element, form]);

  function applyChanges(values: propertiesFormSchemaType) {
    updateElement(element.id, {
      ...element,
      extraAttributes: {
        label: values.label,
        helperText: values.helperText,
        placeHolder: values.placeHolder,
        required: values.required,
        options: values.options,
        dir:values.dir === true ? 'rtl':'ltr'
      },
    });
    toast({
      title: "Success",
      description: "Properties save successfully",
    });

    setSelectedElement(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(applyChanges)} className="space-y-3">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") e.currentTarget.blur();
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The label of the field. <br /> It will be displayed above the
                  field
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="placeHolder"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>PlaceHolder</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") e.currentTarget.blur();
                    }}
                  />
                </FormControl>
                <FormDescription>The placeholder of the field.</FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="helperText"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Helper Text</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") e.currentTarget.blur();
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The helper text of the field. <br />
                  It will displayed blow the field.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Separator />
        <FormField
          control={form.control}
          name="options"
          render={({ field }) => {
            return (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Options</FormLabel>
                  <Button
                    variant={"outline"}
                    className="gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      form.setValue(
                        "options",
                        (field.value || []).concat("New option")
                      );
                    }}
                  >
                    <AiOutlinePlus />
                    Add
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {form.watch("options").map((option, index) => (
                    <div key={'option' + index} className="flex items-center justify-between gap-1 ">
                      <Input
                        placeholder=""
                        value={option}
                        onChange={(e) => {
                          e.preventDefault();
                          e.target.focus();
                          field.value[index] = e.target.value;
                          field.onChange(field.value);
                        }}
                      />
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={(e) => {
                          e.preventDefault();
                          const newOptions = [...(field.value || [])];
                          newOptions.splice(index, 1);
                          field.onChange(newOptions);
                        }}
                      >
                        <AiOutlineClose />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Separator />
        <FormField
          control={form.control}
          name="required"
          render={({ field }) => {
            return (
              <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Required</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
         <FormField
          control={form.control}
          name="dir"
          render={({ field }) => {
            return (
              <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>RTL</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Separator />
        <Button className="w-full " type="submit">
          Save
        </Button>
      </form>
    </Form>
  );
}

function DesignerComponent({
  elementInstance,
}: {
  elementInstance: FormElementInstance;
}) {
  const element = elementInstance as CustumInstance;

  const { helperText, label, placeHolder, required,dir } = element.extraAttributes;

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label dir={dir}>
        {label}
        {required && "*"}
      </Label>
      <Select  >
        <SelectTrigger dir={dir} className="w-full ">
          <SelectValue placeholder={placeHolder} />
        </SelectTrigger>
      </Select >
      {helperText && (
        <p dir={dir} className="text-muted-foreground text-[0.8rem]">{helperText}</p>
      )}
    </div>
  );
}
