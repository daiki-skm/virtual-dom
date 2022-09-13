import "./style.css";
import typescriptLogo from "./typescript.svg";
import { setupCounter } from "./counter";
import { h } from "./h";
import { render } from "./render";

interface HTMLElementEvent<T extends HTMLElement> extends Event {
  target: T;
}

const setState = (state: string) => {
  const node = document.querySelector<HTMLDivElement>("#app");
  const createKeyList = () => {
    return state.split(" ").map((value: string) => {
      return h("div", { key: value }, [`key: ${value}`]);
    });
  };

  if (node !== null) {
    render(
      node,
      h("div", {}, [
        h("h1", {}, [state]),
        h(
          "input",
          {
            type: "text",
            value: state,
            oninput: (e: HTMLElementEvent<HTMLInputElement>) =>
              setState(e.target.value),
            autofocus: true,
          },
          []
        ),
        h("div", { id: "container" }, createKeyList()),
      ])
    );
  }
};

setState("Hey");
