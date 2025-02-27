import Controller from "../components/Controller";
import { Text } from "..";

export default function Help() {
  return (
    <>
      <div class="w-full h-0 grow overflow-y-scroll overflow-x-clip prose lg:prose-xl p-4">
        <Text path="helpContent" />
      </div>
      <Controller></Controller>
    </>
  );
}
