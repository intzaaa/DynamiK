import { useLocation } from "preact-iso";

export default function PageNotFound() {
  useLocation().route("/");

  return <></>;
}
