import { addNavbarButton } from './render/buttons';
import { renderCurrentConversations } from './render/cnvTree';

addNavbarButton('cnv-parse-button', 'CNV', () => renderCurrentConversations());
