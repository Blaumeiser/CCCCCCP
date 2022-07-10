import rfc6902 from "rfc6902";

export default function test() {
  let data = {
    arr: [
      [Math.random(), Math.random() * 0.5],
      [Math.random(), Math.random() * 0.5],
      [Math.random(), Math.random() * 0.5],
    ],
  };

  let data2 = JSON.parse(JSON.stringify(data));
  data2.arr.splice(1, 1);
  data2.arr.push([Math.random(), Math.random() * 0.5]);

  const patch = rfc6902.createPatch(data, data2);
  console.log(patch);
}
