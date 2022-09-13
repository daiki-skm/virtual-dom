import type {
  DOMAttributeName,
  DOMAttributes,
  ElementAttachedNeedAttr,
  KeyAttribute,
  TextAttachedVDOM,
  VirtualNodeType,
} from "./types";
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

const renderTextNode = (
  realNode: VirtualNodeType["realNode"],
  newVNode: VirtualNodeType
) => {
  if (realNode !== null) {
    if (typeof newVNode.name === "string") {
      realNode.nodeValue = newVNode.name;
      return realNode;
    } else {
      console.error("Error!");
      return realNode;
    }
  } else {
    console.error("Error!");
    return realNode;
  }
};

const renderNode = (
  parentNode: HTMLElement,
  realNode: VirtualNodeType["realNode"],
  oldVNode: VirtualNodeType | null,
  newVNode: VirtualNodeType
) => {
  if (newVNode === oldVNode) {
  } else if (
    oldVNode !== null &&
    newVNode.nodeType === Node.TEXT_NODE &&
    oldVNode.nodeType === Node.TEXT_NODE
  ) {
    realNode = renderTextNode(realNode, newVNode);
  } else if (oldVNode === null || oldVNode.name !== newVNode.name) {
    const newRealNode = createRealNodeFromVNode(newVNode);
    if (newRealNode !== null) {
      parentNode.insertBefore(newRealNode, realNode);
    }
    if (oldVNode !== null && oldVNode.realNode !== null) {
      parentNode.removeChild(oldVNode.realNode);
    }
  } else {
    realNode = updateOnlyThisNode(realNode, oldVNode, newVNode);
    if (realNode !== null) {
      let oldChildNowIndex = 0;
      let newChildNowIndex = 0;
      const oldChildrenLength = oldVNode.children.length;
      const newChildrenLength = newVNode.children.length;

      let hasKeyOldChildren: { [key in KeyAttribute]: VirtualNodeType } = {};
      for (const child of oldVNode.children) {
        const childKey = child.key;
        if (childKey !== null) {
          hasKeyOldChildren[childKey] = child;
        }
      }
      const renderedNewChildren: { [key in KeyAttribute]: "isRendered" } = {};
      while (newChildNowIndex < newChildrenLength) {
        let oldChildVNode: VirtualNodeType | null;
        let oldKey: string | number | null;
        if (oldVNode.children[oldChildNowIndex] === undefined) {
          oldChildVNode = null;
          oldKey = null;
        } else {
          oldChildVNode = oldVNode.children[oldChildNowIndex];
          oldKey = oldChildVNode.key;
        }
        const newChildVNode = newVNode.children[newChildNowIndex];
        const newKey = newChildVNode.key;

        if (oldKey !== null && renderedNewChildren[oldKey] === "isRendered") {
          oldChildNowIndex++;
          continue;
        }

        if (
          newKey !== null &&
          oldChildVNode !== null &&
          oldChildVNode.children[oldChildNowIndex + 1] !== undefined &&
          newKey === oldChildVNode.children[oldChildNowIndex + 1].key
        ) {
          if (oldKey === null) {
            realNode.removeChild(
              oldChildVNode.realNode as ElementAttachedNeedAttr
            );
          }
          oldChildNowIndex++;
          continue;
        }

        if (newKey === null) {
          if (oldKey === null) {
            renderNode(
              realNode as ElementAttachedNeedAttr,
              oldChildVNode === null ? null : oldChildVNode.realNode,
              oldChildVNode,
              newChildVNode
            );
            newChildNowIndex++;
          }
          oldChildNowIndex++;
        } else {
          if (oldChildVNode !== null && oldKey === newKey) {
            const childRealNode = oldChildVNode.realNode;
            renderNode(
              realNode as ElementAttachedNeedAttr,
              childRealNode,
              oldChildVNode,
              newChildVNode
            );
            renderedNewChildren[newKey] = "isRendered";
            oldChildNowIndex++;
          } else {
            const previousRenderValue = hasKeyOldChildren[newKey];
            if (
              previousRenderValue !== null &&
              previousRenderValue !== undefined
            ) {
              renderNode(
                realNode as ElementAttachedNeedAttr,
                previousRenderValue.realNode,
                previousRenderValue,
                newChildVNode
              );
              renderedNewChildren[newKey] = "isRendered";
            } else {
              renderNode(
                realNode as ElementAttachedNeedAttr,
                null,
                null,
                newChildVNode
              );
            }
            renderedNewChildren[newKey] = "isRendered";
          }
          newChildNowIndex++;
        }
      }

      while (oldChildNowIndex < oldChildrenLength) {
        const unReachOldVNode = oldVNode.children[oldChildNowIndex];
        if (unReachOldVNode.key === null || unReachOldVNode.key === undefined) {
          if (unReachOldVNode.realNode !== null) {
            realNode.removeChild(unReachOldVNode.realNode);
          }
        }
        oldChildNowIndex++;
      }

      for (const oldKey in hasKeyOldChildren) {
        if (
          renderedNewChildren[oldKey] === null ||
          renderedNewChildren[oldKey] === undefined
        ) {
          const willRemoveNode = hasKeyOldChildren[oldKey].realNode;
          if (willRemoveNode !== null) {
            realNode.removeChild(willRemoveNode);
          }
        }
      }
    } else {
      console.error("Error!");
    }
  }
  if (realNode !== null) {
    newVNode.realNode = realNode;
    realNode.vdom = newVNode;
  }
  return realNode;
};

const listenerFunc = (event: Event) => {
  const realNode = event.currentTarget as ElementAttachedNeedAttr;
  if (realNode.eventHandlers !== undefined) {
    realNode.eventHandlers[event.type](event);
  }
};

const patchProperty = (
  realNode: ElementAttachedNeedAttr,
  propName: DOMAttributeName,
  oldPropValue: any,
  newPropValue: any
) => {
  if (propName === "key") {
  } else if (propName[0] === "o" && propName[1] === "n") {
    const eventName = propName.slice(2).toLowerCase();
    if (realNode.eventHandlers === undefined) {
      realNode.eventHandlers = {};
    }
    realNode.eventHandlers[eventName] = newPropValue;
    if (
      newPropValue === null ||
      newPropValue === undefined ||
      newPropValue === false
    ) {
      realNode.removeEventListener(eventName, listenerFunc);
    } else if (!oldPropValue) {
      realNode.addEventListener(eventName, listenerFunc);
    }
  } else if (newPropValue === null || newPropValue === undefined) {
    realNode.removeAttribute(propName);
  } else {
    realNode.setAttribute(propName, newPropValue);
  }
};

const createRealNodeFromVNode = (VNode: VirtualNodeType) => {
  let realNode: ElementAttachedNeedAttr | TextAttachedVDOM;
  if (VNode.nodeType === Node.TEXT_NODE) {
    if (typeof VNode.name === "string") {
      realNode = document.createTextNode(VNode.name);
      VNode.realNode = realNode;
      realNode.vdom = VNode;
    } else {
      console.error("Error!");
      return null;
    }
  } else {
    realNode = document.createElement(VNode.name as string);
    for (const propName in VNode.props) {
      patchProperty(realNode, propName, null, VNode.props[propName]);
    }
    VNode.realNode = realNode;
    realNode.vdom = VNode;

    for (const child of VNode.children) {
      const realChildNode = createRealNodeFromVNode(child);
      if (realChildNode !== null) {
        realNode.append(realChildNode);
      }
    }
  }
  return realNode;
};

const mergeProperties = (oldProps: DOMAttributes, newProp: DOMAttributes) => {
  const mergeProperties: DOMAttributes = {};
  for (const propName in oldProps) {
    mergeProperties[propName] = oldProps[propName];
  }
  for (const propName in newProp) {
    mergeProperties[propName] = newProp[propName];
  }
  return mergeProperties;
};

const updateOnlyThisNode = (
  realNode: VirtualNodeType["realNode"],
  oldVNode: VirtualNodeType,
  newVNode: VirtualNodeType
) => {
  if (realNode !== null) {
    for (const propName in mergeProperties(oldVNode.props, newVNode.props)) {
      let compareValue;
      if (propName === "value" || propName === "checked") {
        compareValue = (realNode as HTMLInputElement)[propName];
      } else if (propName === "selected") {
        compareValue = (realNode as HTMLOptionElement)[propName];
      } else {
        compareValue = oldVNode.props[propName];
      }
      if (compareValue !== newVNode.props) {
        patchProperty(
          realNode as ElementAttachedNeedAttr,
          propName,
          oldVNode.props[propName],
          newVNode.props[propName]
        );
      }
    }
  } else {
    console.error("Error!");
  }
  return realNode;
};

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
