export const alarm = () => {
  document.body.classList.add("alarm");

  setTimeout(() => {
    document.body.classList.remove("alarm");
  }, 300);
};
