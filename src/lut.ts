//manual LUTs for force rewards, companion (etc) reactions, and possibly more later

export const miscLUT = new Map<string, string>([
  ['large📌︎', '150'],
  ['medium📌︎', '100'],
  ['small📌︎', '50'],
  ['very large📌︎', '200'],
  ['cnvForceRewardTypeDarkSide#', '-1'],
  ['cnvForceRewardTypeLightSide#', '1'],
]);

export const cnvConditions = new Map([
  ['qst.utility.class.is_jedi_knight🔗︎', 'knight'],
  ['qst.utility.class.is_jedi_wizard🔗︎', 'consular'],
  ['qst.utility.class.is_trooper🔗︎', 'trooper'],
  ['qst.utility.class.is_smuggler🔗︎', 'smuggler'],
  ['qst.utility.class.is_sith_warrior🔗︎', 'warrior'],
  ['qst.utility.class.is_sith_sorcerer🔗︎', 'inquisitor'],
  ['qst.utility.class.is_bounty_hunter🔗︎', 'hunter'],
  ['qst.utility.class.is_spy🔗︎', 'agent'],
  ['qst.utility.misc.is_male🔗︎', 'male'],
  ['qst.utility.misc.is_female🔗︎', 'female'],
]);

export const cnvReactionTypes = new Map([
  ['2529429825125611235', '<<1>> approves.'],
  ['4428691168655495967', '<<1>> approves.'],
  ['14821228092229219504', '<<1>> approves.'],
  ['6952303592491973947', '<<1>> approves.'],
  ['4024473132780195635', '<<1>> greatly approves.'],
  ['5206985715216554263', '<<1>> greatly approves.'],
  ['8469785202589780933', '<<1>> disapproves.'],
  ['299284575647572754', '<<1>> disapproves.'],
  ['5187367556094903237', '<<1>> disapproves.'],
  ['62151514369084861', '<<1>> disapproves.'],
  ['16117376427995824505', '<<1>> greatly disapproves.'],
  ['276188171376482809', '<<1>> greatly disapproves.'],
  ['18379443853700530656', '<<1>> is slightly amused.'],
  ['18386449193944520357', '<<1>> is amused.'],
  ['18135672826307600602', '<<1>> is greatly amused.'],
  ['4712536038622606709', "<<1>>'s curiosity has been piqued."],
  ['9162491183318824094', '<<1>> seems interested.'],
  ['14265667490659118239', '<<1>> seems unusually interested.'],
  [
    '14222379092349104707',
    '<<1>> is greatly impressed with your contributions to the war effort.',
  ],
  ['10555009052943508826', '<<1>> seems intrigued.'],
  ['1375975098520036588', '<<1>> will remember your cruelty.'],
  ['15753697458920712239', '<<1>> will remember your kindness.'],
  ['13073504586969816362', '<<1>> will remember your indifference.'],
  ['7123366858456175786', '<<1>> is not amused.'],
  ['14038846228872588336', '<<1>> will remember that you lied.'],
  ['15019702191772196139', '<<1>> is concerned.'],
  ['12515792969208002617', 'Your actions will be remembered.'],
  ['7536170676252376900', '<<1>> missed you.'],
  ['10733807968160703675', '<<1>> is grateful for your assistance.'],
  [
    '731132172051691124',
    "<<1>> will be impressed that you remembered his crew member's name.",
  ],
  [
    '8872094627826740207',
    '<<1>> is delighted that you remembered the little umbrella.',
  ],
  [
    '12370401895341451158',
    '<<1>> is disappointed that you forgot the little umbrella.',
  ],
  ['5688701387429825765', '<<1>> is impressed with your work.'],
  ['9441688060394386548', '<<1>> seems slightly nervous.'],
  ['7623025373871052085', '<<1>> is beside himself with joy'],
  ['1902560031372186073', "<<1>>'s dreams have been utterly crushed."],
  ['12778378224227247110', '<<1>> is filled with hope for a better future.'],
  [
    '9882447423740450154',
    "Your actions have strengthened Doctor Oggurobb's research efforts.",
  ],
  [
    '2048663252315855743',
    "Your actions have strengthened <<1>>'s underworld logistics operations.",
  ],
  [
    '7906311544398507385',
    "Your actions have strengthened <<1>>'s military operations.",
  ],
  [
    '1597428597807848311',
    "Your actions have strengthened <<1>>'s Force Enclave",
  ],
  [
    '6375289833410097548',
    'Making others more comfortable fills <<1>> with joy.',
  ],
  ['6466639328314987443', '<<1>> is impressed.'],
  ['1209330072373622019', '<<1>> appreciates your honesty.'],
  ['13570849312037490411', '<<1>> still suspects something.'],
  ['912395257889344204', '<<1>> will remember your decision.'],
  ['4818387085978752667', '<<1>> will remember that.'],
  ['13813900891945635348', '<<1>> appreciates that.'],
  ['6651887195147244257', '<<1>> will remember your heroism.'],
  [
    '15961334736246934324',
    "Your actions have greatly strengthened <<1>>'s Force Enclave",
  ],
  [
    '17153011325266128922',
    "Your actions have greatly strengthened <<1>>'s military operations.",
  ],
  [
    '8137563469903940684',
    "Your actions have greatly strengthened <<1>>'s underworld logistics operations.",
  ],
  [
    '15350902149788601737',
    "Your actions have greatly strengthened Doctor Oggurobb's research efforts.",
  ],
  [
    '5430790823310126796',
    "<<1>> is grateful for your aid to the planet's Resistance.",
  ],
  ['8837945222426390879', '<<1>> celebrates your combined victory.'],
  ['6358824285678689448', "<<1>> is extremely grateful for all you've done."],
  [
    '10024217739917204554',
    'Valkorion dismisses your choice. You have surrendered too much power to him.',
  ],
  ['16917167500524174583', '<<1>> is slightly disappointed.'],
  ['4404097217504307474', '<<1>> is disappointed.'],
  ['10863378276840609699', '<<1>> is greatly disappointed.'],
  [
    '6474274770997812768',
    'As a droid, HK-55 has no connection to the Force and feels no pull to either the light or dark side.',
  ],
  ['1025933574861755595', '<<1>> appears confused.'],
  ['9358589348251436234', '<<1>> seems to be getting worked up.'],
  ['18251273556395588854', '<<1>> is eager to help.'],
  [
    '3135183122377415159',
    'You have subtly undermined Jedi confidence in the Republic. <<1>> will be pleased.',
  ],
  [
    '17530150515421016027',
    'You have encouraged support of the Republic among the Jedi. <<1>> will be pleased.',
  ],
  [
    '15164519942144621173',
    'You have subtly acquired the Jedi farm data for the Empire. <<1>> will be pleased.',
  ],
  [
    '13383969765412786625',
    'You have preserved the Jedi farm data for the Republic. <<1>> will be pleased.',
  ],
  [
    '6044069001178078844',
    "Dismissing suggestions from the Empire's troops will lower morale. <<1>> will be pleased.",
  ],
  [
    '5354612718435523652',
    "Your support of the Empire's troops has boosted morale. <<1>> will be pleased.",
  ],
  [
    '6044072299712963477',
    "You've hidden your preservation of the Jedi farm data well. <<1>> will be pleased.",
  ],
  [
    '17050473681179373578',
    "Sabotaging the Empire's starfighters increased their losses in the Republic attack. <<1>> will be pleased.",
  ],
  [
    '16004148145617059954',
    "Augmenting the Empire's starfighters reduced their losses in the Republic attack. <<1>> will be pleased.",
  ],
  [
    '3135184221889043370',
    'The loss of the shuttles will lower Republic morale and aid the Empire. <<1>> will be pleased.',
  ],
  [
    '17530151614932644238',
    'The rescue of the shuttles will boost Republic morale. <<1>> will be pleased.',
  ],
]);
