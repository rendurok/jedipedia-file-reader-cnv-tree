# Jedipedia SWTOR File Reader Conversation Tree Improvement Userscript

Userscript that improves the conversation tree display in [Jedipedia's File Reader](https://swtor.jedipedia.net/reader).

Features include:

- Collapsible file tree -like display
- Dark-/light-side gain
- Companion (and other) reactions
- Click a link to jump to the corresponding node in the tree

Made with [pboymt's userscript-typescript-template](https://github.com/pboymt/userscript-typescript-template).

## Installation

TODO

## Usage

0. Use the [file reader's](https://swtor.jedipedia.net/reader) instructions to load all files from the game's Assets folder.
1. Switch to the "Nodes" tab from the top left, and wait for the loading spinner next to the search bar to go away.
2. In the "Nodes" tab, use the tree explorer on the left to open any conversation (found under the `cnv` node).
3. With a conversation page open, press the "CNV" button on the top left navbar to improve the display.

## Limitations

- Generic lines (e.g. "I suppose I can lower myself to do this.") are not parsed, though this could be possible in the future.
- NPC and companion names aren't fully parsed, and are usually just displayed as snake_case, though sometimes different. These names could possibly be parsed, but it's not a priority.
- Sometimes the DS/LS point gain is displayed incorrectly or only partially due to me not completely understanding how it's calculated, or old leftover code. Any gains displayed that are just numbers should be accurate. It is unlikely this will ever be fixed.
- Conversation reaction types are based on a manual LUT, so sometimes they might just be a big number. I haven't found a way to automatically parse them, as the ids in the conversation data do not match with any that are in `global/resources/en-us/str/gui/conversationreactions.stb`. Luckily there does seem to only be a handful of different types, though.
  - If you find a broken reaction, and the corresponding correct reaction text, please make an issue about it or just a PR that adds it to the LUT. 
- The algorithm for determining whether a line is spoken or a choosable text option is not very sophisticated, and can sometimes represent the situation incorrectly if they are defined in different nodes. Possibility of a fix is unknown, but it's not a priority. 

## Tips

- Use the file explorer's search bar to look for NPCs by name.
- KOTFE and KOTET chapters are in `cnv.cnv.exp.seasons.01` and `cnv.exp.seasons.02`, respectively.
- (At least some of) Post-knights companion conversations are in `cnv.alliance`
- Most, if not all, basegame conversations are in `cnv.location`.
  - Basegame companion (and companion quest) conversations are in `cnv.location.companion_characters`.
  - Basegame class story conversations that are not attached to a planet are in `cnv.location.open_worlds.class`.
  - Flashpoints The Black Talon and The Esseless are in `cnv.location.imperial_transition` and `cnv.location.republic_transition`, respectively.
  - Quesh is called `war_world`.
