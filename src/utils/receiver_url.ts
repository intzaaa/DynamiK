export const receiver_url = (id: string) => {
  const url = new URL("/receive", window.location.origin);
  url.searchParams.set("id", id);

  return url.toString();
};
