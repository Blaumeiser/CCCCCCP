import rfc6902 from "rfc6902";

export default function test() {
  let data = {
    a: {name:'a'}
  };

  const json = JSON.stringify(data);
  const data2 = JSON.parse(json);

  data2.b = {name:'b'};
  data2.a.sub=22;
  data2.a.name = 'aa';
  const patch = rfc6902.createPatch(data, data2);
  //console.log(patch);
}
