import getSHA256Hash from "./crypto-hash";

let object1 = {
  key1: "value2",
  key2: 34,
  key3: false,
  key4: -2.32
}
let arr1 = ["testVal1", "testVal2", 12, false]
let num1 = 9484
let boolean1 = false
let inputToHash = "hello world"   

it('Returns the SHA256 hash of the stringified inputs, sorted and joined ', () => {
  expect(getSHA256Hash(inputToHash)).toBe("9ddefe4435b21d901439e546d54a14a175a3493b9fd8fbf38d9ea6d3cbf70826")
});

it('Returns a 64 character string', () => {
  expect(typeof getSHA256Hash(inputToHash)).toBe('string')
  expect(getSHA256Hash(inputToHash)).toHaveLength(64)
});

it('Returns the same value for the same inputs', () => {
  const firstVal = getSHA256Hash(object1, arr1, num1, boolean1)
  const secondVal = getSHA256Hash(object1, arr1, num1, boolean1)
  expect(firstVal).toBe(secondVal)
});

it('Returns the same value for the same inputs regardless of order', () => {
  const firstVal = getSHA256Hash(object1, arr1, num1, boolean1)
  const secondVal = getSHA256Hash(num1, boolean1, arr1, object1)
  expect(firstVal).toBe(secondVal)
});

it('Returns a different value if any part of input changes', () => {
  const firstVal = getSHA256Hash(1, 2)
  const secondVal = getSHA256Hash(1, 3)
  expect(firstVal).not.toBe(secondVal)
});