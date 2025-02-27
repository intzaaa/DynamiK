import Controller from "../components/Controller";
import { Text } from "..";

export default function Help() {
  return (
    <>
      <div class="w-full h-0 grow overflow-y-scroll overflow-x-clip prose p-4 dark:prose-invert">
        <p>Build {__BUILD_TIME__}</p>
        <Text path="helpContent" />
      </div>
      <Controller></Controller>
    </>
  );
}
