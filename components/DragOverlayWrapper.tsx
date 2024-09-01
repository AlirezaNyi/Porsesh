import { Active, DragOverlay, useDndMonitor } from "@dnd-kit/core";
import React, { useState } from "react";
import { SidebarBtnElementDragOverlay } from "./SidebarBtnElement";
import { ElementsType, FormElements } from "./FormElements";
import useDesigner from "./hooks/useDesigner";

function DragOverlayWrapper() {
  const {elements}=useDesigner();
  const [darggedItem, setDraggedItem] = useState<Active | null>(null);
  useDndMonitor({
    onDragStart: (event) => {
      setDraggedItem(event.active);
    },
    onDragCancel: () => {
      setDraggedItem(null);
    },
    onDragEnd: () => {
      setDraggedItem(null);
    },
  });

  if (!darggedItem) return null;

  let node = <div>No drag overlay</div>;
  const isSidebarBtnElement = darggedItem.data?.current?.isDesignerBtnElement;

  if (isSidebarBtnElement) {
    const type = darggedItem.data?.current?.type as ElementsType;
    node = <SidebarBtnElementDragOverlay formElement={FormElements[type]} />;
  }

  const isDesignerElement= darggedItem.data?.current?.isDesignerElement;

  if(isDesignerElement) {
    const elementId = darggedItem.data?.current?.elementId;
    const element = elements.find(q => q.id === elementId);

    if(!element) node = <div>element not found</div>;
    else {
      const DesignerElementComponent = FormElements[element.type].designerComponent;

      node = <div className="flex bg-accent border rounded-md h-[120px] w-full px-4 py-2 opacity-80 pointer pointer-events-none">
        <DesignerElementComponent elementInstance={element}/>
      </div>
    }
  }

  return <DragOverlay>{node}</DragOverlay>;
}

export default DragOverlayWrapper;
