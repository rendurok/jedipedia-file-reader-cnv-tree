import { addNavbarButton } from './render/buttons';
import { renderCurrentConversations } from './render/cnvTree';
import { addMenu } from './render/menu';

addNavbarButton('cnv-parse-button', 'CNV', (e) =>
  renderCurrentConversations(e)
);
addMenu();
