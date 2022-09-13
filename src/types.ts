type KeyAttribute = string | number;

interface DOMAttributes {
  key?: KeyAttribute;
  [prop: string]: any;
}

interface HandlersType {
  [eventName: string]: (event: Event) => void;
}

type ElementAttachedNeedAttr = HTMLElement & {
  vdom?: VirtualNodeType;
  eventHandlers?: HandlersType;
};

type TextAttachedVDOM = Text & {
  vdom?: VirtualNodeType;
};

type ExpandElement = ElementAttachedNeedAttr | TextAttachedVDOM;

interface VirtualNodeType {
  name: HTMLElementTagNameMap | string;
  props: DOMAttributes;
  children: VirtualNodeType[];
  realNode: ExpandElement | null;
  nodeType: Node["TEXT_NODE"] | null;
  key: KeyAttribute | null;
}

type DOMAttributeName = "key" | string;

export type {
  KeyAttribute,
  DOMAttributes,
  HandlersType,
  ElementAttachedNeedAttr,
  TextAttachedVDOM,
  ExpandElement,
  VirtualNodeType,
  DOMAttributeName,
};
