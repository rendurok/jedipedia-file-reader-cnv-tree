//TODO: use actual css file

export const cnvTreeCSS = `
ul{
  display:inline-block; float: left; clear: left;
  margin:1px 0 0 1px;
  padding:0;
}
ul:before{
  content:""; position: absolute; z-index: 1;
  top:.25em; right:auto; bottom:0; left: 1.75em; 
  margin: auto;
  border-right: solid #e9bd54 .1em;
  width: 0; height: auto;
}
ul:after{
  content: "-"; position: absolute; z-index: 3;
  top:0; left:-.5em;
  margin-left:.65em; margin-top:.3em ;padding:0;
  width:.8em; height: .8em; 
  text-align:center; line-height: .6em; font-size: 1em;
  background: rgb(1, 6, 10);
}
ul>li{
  display: block; position: relative; float: left; clear: both;
  right:auto;
  padding-left: 1em;
  width:auto;
}
ul>li>input{
  display:block; position: absolute; float: left; z-index: 4;
  margin:0 0 0 -1em; padding:0;
  width:1em; height: 2em;
  font-size: 1em;
  opacity: 0;
  cursor: pointer;
}
ul>li>input:checked~ul:before{
  display: none;
}
ul>li>input:checked~ul:after{
  content: "+"
}
ul>li>input:checked~ul *{
  display: none;
}
ul>li>span{
  display: block; position: relative; float: left; z-index: 3;
  margin-left:.25em; padding:.25em;
  background: rgb(1, 6, 10);
}
.cnv-childless:after{
  content: ""; display: block; position: absolute;
  left:-1em; top:0; bottom:0;
  margin: auto .25em auto .25em;
  border-top: solid #e9bd54 .1em;
  width: .75em; height: 0;
}

ul>li:last-child:before{
  content: ""; display: block; position: absolute; z-index: 2;
  top:1em; left:0; bottom:-.25em;
  width:.75em; height:auto;
  background: rgb(1, 6, 10)
}

.tree{
  position: relative;
  font-weight: 400;
  background: rgb(1, 6, 10);
  cursor: auto;
}
.tree:before{
  left:.5em;
  display: none
}
.tree:after{
  display: none;
}

.cnv-force-light{
  color: #43c4ef;
}
.cnv-force-dark{
  color: red;
}
.cnv-end{
  color: gray;
}
.cnv-util{
  color: #e9bd54;
}
.cnv-player{
  color: #ff62c1;
}
.cnv-npc{
  color: #00cc00;
}
.cnv-option{
  color: lightgray;
}
.cnv-generic{
  color: #e9bd54
}
.cnv-link{
  color: purple;
  cursor: pointer;
}
.cnv-cnd{
  color: #e173ff;
}

.cnv-node>span{
  padding-right: .25em
}

.cnv-reactions{
  padding-left: 3em;
  color: #c896ff;
}
.cnv-reactions>tbody>tr>td:first-child{
  padding-right: .5em
}

ul>li{
  background: transparent;
}
ul:after{
  border:solid #e9bd54 1px;
  border-radius: .1em;
  color: #e9bd54;
}
ul>li>span{	
  border-radius: .25em;
  border: 1px solid #e9bd54;
  color: white
}
.cnv-id{
  color: #e9bd54;
}

.cnv-highlight{
  background: purple;
}
`;

export const menuCSS = `
#cnv-menu-collapser {
  -webkit-appearance: none;
  appearance: none;

  width: 1.5em;
  border: 2px solid #225c81;
  border-radius: 5px;
  padding: 3px;
  cursor: pointer;
}

#cnv-menu-collapser::before {
  display: grid;
  place-content: center;
  content: "v";
}

#cnv-menu-collapser:checked::before {
  content: ">";
}

#cnv-menu-collapser:checked~#cnv-menu {
  display:none
}

#cnv-menu {
  position: absolute; 
  z-index: 10;
  background: #01060a;
  border: 1px solid #225c81;
  padding: 4px;
}

#cnv-menu>form>fieldset {
  display: flex;
  column-gap: 10px;
}

#cnv-menu>form button {
  width: min-content;
}
`;
