import { menuCSS } from '../cnvTreeStyles';
import { setGenericLines } from '../parse/genericLines';
import { appendRadio, clearChildren } from './utils';

export function addMenu() {
  const navtop = document.querySelector('#navtop');
  if (!navtop) return;

  if (!document.querySelector('#navtop style')) {
    const menuStyle = document.createElement('style');
    menuStyle.textContent = menuCSS;
    navtop.appendChild(menuStyle);
  }

  if (!document.querySelector('#cnv-menu-collapser')) {
    const collapser = document.createElement('input');
    collapser.id = 'cnv-menu-collapser';
    collapser.type = 'checkbox';
    collapser.checked = true;
    navtop.appendChild(collapser);
  }

  let menuContainer = document.querySelector<HTMLElement>('#cnv-menu');
  if (!menuContainer) {
    menuContainer = document.createElement('div');
    menuContainer.id = 'cnv-menu';
    navtop.appendChild(menuContainer);
  }
  clearChildren(menuContainer);

  const genericForm = document.createElement('form');
  const genericFieldset = document.createElement('fieldset');
  genericForm.appendChild(genericFieldset);

  menuContainer.appendChild(genericForm);

  const genericLegend = document.createElement('legend');
  genericLegend.appendChild(
    document.createTextNode(
      'Open cnv.misc.generic_lines to parse the generic lines. ' +
        'They will persist until re-parse or -load.'
    )
  );

  const classContainer = document.createElement('div');
  appendRadio(classContainer, 'class', [
    'knight',
    'consular',
    'trooper',
    'smuggler',
    'warrior',
    'inquisitor',
    'hunter',
    'agent',
  ]);

  const genderContainer = document.createElement('div');
  appendRadio(genderContainer, 'gender', ['male', 'female']);

  const genericButton = document.createElement('button');
  genericButton.appendChild(document.createTextNode('Parse Generics'));

  genericFieldset.appendChild(genericLegend);
  genericFieldset.appendChild(classContainer);
  genericFieldset.appendChild(genderContainer);
  genericFieldset.appendChild(genericButton);

  genericForm.onsubmit = (e) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      class: { value: string };
      gender: { value: string };
    };

    setGenericLines(new Set([target.class.value, target.gender.value]));
  };
}
