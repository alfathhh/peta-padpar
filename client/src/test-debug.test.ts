// No explicit imports - using globals: true

console.log('describe type:', typeof describe);
console.log('it type:', typeof it);
console.log('expect type:', typeof expect);
console.log('vi type:', typeof vi);

describe('debug test', () => {
  console.log('inside describe');
  it('should work', () => {
    console.log('inside it');
    expect(1).toBe(1);
  });
});
