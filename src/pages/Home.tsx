import { useLocation } from "preact-iso";

import { Text } from "..";

export default function Home() {
  const location = useLocation();

  return (
    <div class="w-full h-full flex flex-col gap-4">
      {[
        {
          text: <Text path="send"></Text>,
          route: "/send",
        },
        {
          text: <Text path="receive"></Text>,
          route: "/receive",
        },
      ].map(({ text, route }) => (
        <div
          class="w-full h-0 flex justify-center items-center grow text-4xl"
          onClick={() => location.route(route)}>
          {text}
        </div>
      ))}
    </div>
  );
}
