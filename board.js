import crypto from 'node:crypto';

function create() {

const coder1 =  {
    id: crypto.randomUUID(),
    name: 'jb',
    webhook: "https://9000-blaumeiser-ccccccp-g8by99q83g4.ws-eu63.gitpod.io",
    avatar: "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
  };
  
  const squad1 = {
    id: crypto.randomUUID(),
    name: 'Special-projects-Squad',
    coders: {},
  };
  
  squad1.coders[coder1.id] = initializeNewCoder(coder1);
  
  const pineapple1 = {
    id: crypto.randomUUID(),
    loc: [0.2, 0.2]
  };
  
  const root = {
    freq: 1000,
    segfault: 1000 * 10 * 6,
    squads: { },
    pineapples: {}
  };
  
  root.squads[squad1.id] = squad1;
  root.pineapples[pineapple1.id] = pineapple1;
  
  const root1 = {
    freq: 1000,
    segfault: 1000 * 10 * 6,
    squads: {
      "Special-Projects-Squad": {
        name: "Special-Projects-Squad",
        coders: {
          '0': {
            name: '0',
            avatar:
              "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
          },
          '1':{
            name: '1',
            avatar:
              "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
          },
          '2':{
            name:'2',
            avatar:
              "https://www.pngkit.com/png/full/365-3654764_cristiano-ronaldo-icon-soccer-player-icon.png",
          },
        },
      },
      "VX":{
        name: "VX",
        coders: {
          '3':{
            name:'3',
            avatar:
              "https://www.pngkit.com/png/full/435-4356701_minus-frog-crafts-pond-life-gifs-kermit-the.png",
          },
          '4':{
            name:'4',
            avatar:
              "https://www.pngkit.com/png/full/435-4356701_minus-frog-crafts-pond-life-gifs-kermit-the.png",
          },
        },
      },
      "Aporia":{
        name: "Aporia",
        coders: {
          '5':{
            name:'5',
            avatar:
              "https://static.vecteezy.com/system/resources/thumbnails/000/242/794/small_2x/girl-with-wavy-hair-and-glasses.jpg",
            avatarSize: 0.02,
          },
        },
      },
    },
    pineapples: [
      {id:'1', loc:[Math.random(), Math.random() * 0.5]},
      {id:'2', loc:[Math.random(), Math.random() * 0.5]},
      {id:'3', loc:[Math.random(), Math.random() * 0.5]},
    ],
  };
 
  //Object.values(data.squads).forEach((squad) => (squad.coders = objMap(squad.coders, initializeNewCoder)));
  //data.pineapples = objMap(data.pineapples,p => ({id:p.id,loc:[Math.random(), Math.random()]}));

  return root;
}

function initializeNewCoder(coder) {
  return {
    avatarSize: 0.01,
    //points: [ {loc:[Math.random(), Math.random() * 0.25]}],
    points: [{loc: [0.1, 0.1]}],
    dir: Math.random() * Math.PI * 2,
    color:
      "#" +
      ("00000" + ((Math.random() * (1 << 24)) | 0).toString(16)).slice(-6),
    ...coder,
  };
}

export default {create};
