import { useLocation } from "preact-iso";

export default function NotFound() {
  useLocation().route("/");

  return <></>;
}
