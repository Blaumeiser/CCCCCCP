import * as jsonpatch from "fast-json-patch/index.mjs";

export default function test() {
  var document = {
    firstName: "Joachim",
    lastName: "Wester",
    contactDetails: { phoneNumbers: [{ number: "555-123" }] },
  };
  var observer = jsonpatch.observe(document);
  document.firstName = "Albert";
  document.contactDetails.phoneNumbers[0].number = "123";
  document.contactDetails.phoneNumbers.push({ number: "456" });
  var patch = jsonpatch.generate(observer);
}
