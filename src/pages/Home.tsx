import { useLocation } from "preact-iso";

import { Text } from "..";

export default function Home() {
  const location = useLocation();

  return (
    <div class="w-full h-full flex flex-col gap-4">
      {[
        {
          label: <Text path="send" />,
          path: "/send",
        },
        {
          label: <Text path="help" />,
          path: "/help",
        },
        {
          label: <Text path="receive" />,
          path: "/receive",
        },
      ].map(({ label, path }) => (
        <div
          class="w-full h-0 flex justify-center items-center grow text-4xl cursor-pointer"
          onClick={() => location.route(path)}>
          {label}
        </div>
      ))}
    </div>
  );
}
