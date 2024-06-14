export function addNavbarButton(
  id: string,
  text: string,
  fn: (e: Event) => void
) {
  const existingButton = document.querySelector<HTMLButtonElement>(`#${id}`);
  if (existingButton) {
    existingButton.onclick = fn;
    existingButton.textContent = text;
    return;
  }

  const newButton = document.createElement('button');
  newButton.appendChild(document.createTextNode('CNV'));
  newButton.id = id;
  newButton.onclick = fn;
  newButton.textContent = text;

  document.getElementById('navtop')?.appendChild(newButton);
}
