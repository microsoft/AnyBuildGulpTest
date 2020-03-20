// Unit test suite for SQRLStrategy code.

import { assert } from "chai";

describe('TestSuite1_2', () => {
  describe('cpuUsingTests', () => {
    it('should take a bit of time asserting a lot of truisms', () => {
      for (let i = 0; i < 10000; i++) {
        assert.equal(i, i);
      }
    });
  });
});
