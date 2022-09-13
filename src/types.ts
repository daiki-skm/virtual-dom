type KeyAttribute = string | number;

type DOMAttributeName = "key" | string;

interface DOMAttributes {
  key?: KeyAttribute;
  [prop: string]: any;
}

interface HandlersType {
  [eventName: string]: (event: Event) => void;
}

interface VirtualNodeType {
  name: HTMLElementTagNameMap | string;
  props: DOMAttributes;
  children: VirtualNodeType[];
  realNode: ExpandElement | null;
  nodeType: Node["TEXT_NODE"] | null;
  key: KeyAttribute | null;
}

type ElementAttachedNeedAttr = HTMLElement & {
  vdom?: VirtualNodeType;
  eventHandlers?: HandlersType;
};

type TextAttachedVDOM = Text & {
  vdom?: VirtualNodeType;
};

type ExpandElement = ElementAttachedNeedAttr | TextAttachedVDOM;

export type {
  KeyAttribute,
  DOMAttributeName,
  DOMAttributes,
  HandlersType,
  VirtualNodeType,
  ElementAttachedNeedAttr,
  TextAttachedVDOM,
  ExpandElement,
};
