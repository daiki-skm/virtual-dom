import type { VirtualNodeType, KeyAttribute } from "./types";

export const createVNode = (
  name: VirtualNodeType["name"],
  props: VirtualNodeType["props"],
  children: VirtualNodeType["children"],
  realNode?: VirtualNodeType["realNode"],
  nodeType?: VirtualNodeType["nodeType"],
  key?: KeyAttribute
): VirtualNodeType => {
  return {
    name,
    props,
    children,
    realNode: realNode === undefined ? null : realNode,
    nodeType: nodeType === undefined ? null : nodeType,
    key: key === undefined ? null : key,
  };
};

export const createTextVNode = (
  name: string,
  realNode?: VirtualNodeType["realNode"]
) => {
  return createVNode(name, {}, [], realNode, Node.TEXT_NODE);
};

export const h = (
  name: VirtualNodeType["name"],
  props: VirtualNodeType["props"],
  children: (VirtualNodeType | string)[],
  realNode?: VirtualNodeType["realNode"]
) => {
  const VNodeChildren: VirtualNodeType[] = [];
  for (const child of children) {
    if (typeof child === "string") {
      const textVNode = createTextVNode(child);
      VNodeChildren.push(textVNode);
    } else {
      VNodeChildren.push(child);
    }
  }
  const thisVNode = createVNode(
    name,
    props,
    VNodeChildren,
    realNode,
    null,
    props.key
  );
  return thisVNode;
};
