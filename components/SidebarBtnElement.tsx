import React from "react";
import { FormElement } from "./FormElements";
import { Button } from "./ui/button";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

function SidebarBtnElement({ formElement }: { formElement: FormElement }) {
  const { icon: Icon, label } = formElement.designerBtnElement;
  const draggable = useDraggable({
    id: `designer-type-${formElement.type}`,
    data: {
      type: formElement.type,
      isDesignerBtnElement: true,
    },
  });

  return (
    <Button
      ref={draggable.setNodeRef}
      variant={"outline"}
      className={cn(
        "flex flex-col gap-2 h-[120px] w-[120px] cursor-grab",
        draggable.isDragging && "ring-2 ring-primary"
      )}
      {...draggable.listeners}
      {...draggable.attributes}
    >
      <Icon className="w-8 h-8 cursor-grab text-primary" />
      <p className="text-xs">{label}</p>
    </Button>
  );
}

export default SidebarBtnElement;



export function SidebarBtnElementDragOverlay({ formElement }: { formElement: FormElement }) {
    const { icon: Icon, label } = formElement.designerBtnElement;
    const draggable = useDraggable({
      id: `designer-type-${formElement.type}`,
      data: {
        type: formElement.type,
        isDesignerBtnElement: true,
      },
    });
  
    return (
      <Button
        variant={"outline"}
        className="flex flex-col gap-2 h-[120px] w-[120px] cursor-grab"
      >
        <Icon className="w-8 h-8 cursor-grab text-primary" />
        <p className="text-xs">{label}</p>
      </Button>
    );
  }