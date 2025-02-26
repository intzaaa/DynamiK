export const alarm = () => {
  navigator.vibrate([8, 5, 2]);

  document.body.classList.add("alarm");

  setTimeout(() => {
    document.body.classList.remove("alarm");
  }, 300);
};
