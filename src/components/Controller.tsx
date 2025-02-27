import { JSX } from "preact";

export default function Controller({ children }: { children?: JSX.Element }) {
  return (
    <div class="w-full h-[150px] flex flex-row justify-between items-center overflow-hidden">
      <a
        class="text-[100px] aspect-square h-full w-auto text-center"
        href="/">
        {"<"}
      </a>
      {children}
    </div>
  );
}
