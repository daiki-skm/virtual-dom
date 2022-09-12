import type { ElementAttachedNeedAttr, VirtualNodeType } from "./types";
import { createTextVNode, createVNode } from "./h";

const createVNodeFromRealElement = (
  realElement: HTMLElement
): VirtualNodeType => {
  if (realElement.nodeType === Node.TEXT_NODE) {
    return createTextVNode(realElement.nodeName, realElement);
  } else {
    const VNodeChildren: VirtualNodeType[] = [];
    const childrenLength = realElement.childNodes.length;
    for (let i = 0; i < childrenLength; i++) {
      const child = realElement.children.item(i);
      if (child !== null) {
        const childVNode = createVNodeFromRealElement(child as HTMLElement);
        VNodeChildren.push(childVNode);
      }
    }

    const props: VirtualNodeType["props"] = {};
    if (realElement.hasAttributes()) {
      const attributes = realElement.attributes;
      const attrLength = attributes.length;
      for (let i = 0; i < attrLength; i++) {
        const { name, value } = attributes[i];
        props[name] = value;
      }
    }

    const VNode = createVNode(
      realElement.nodeName.toLowerCase(),
      props,
      VNodeChildren,
      realElement,
      null
    );
    return VNode;
  }
};

const renderNode = (
  parentNode: HTMLElement,
  realNode: VirtualNodeType["realNode"],
  oldVNode: VirtualNodeType | null,
  newVNode: VirtualNodeType
) => {};

export const render = (
  realNode: ElementAttachedNeedAttr,
  newVNode: VirtualNodeType
) => {
  if (realNode.parentElement !== null) {
    let oldVNode: VirtualNodeType | null;
    const vNodeFromRealElement = createVNodeFromRealElement(realNode);
    if (realNode.vdom === undefined) {
      oldVNode = { ...vNodeFromRealElement };
    } else {
      oldVNode = realNode.vdom;
    }
    vNodeFromRealElement.children = [newVNode];
    newVNode = vNodeFromRealElement;
    renderNode(realNode.parentElement, realNode, oldVNode, newVNode);
  } else {
    console.error("Error!");
  }
};
