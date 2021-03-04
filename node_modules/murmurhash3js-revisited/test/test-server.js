/* global describe,it,require */

describe('murmurHash3js', function() {
	'use strict';

	const murmurHash3 = require('../');

	const utf8Bytes = (str) => new Uint8Array(Buffer.from(str));

	const hash_x86_32 = (str, seed = 0) => murmurHash3.x86.hash32(utf8Bytes(str), seed);
	const hash_x86_128 = (str, seed = 0) => murmurHash3.x86.hash128(utf8Bytes(str), seed);
	const hash_x64_128 = (str, seed = 0) => murmurHash3.x64.hash128(utf8Bytes(str), seed);

	const check = (fn, str, expected, seed = 0) => {
		const result = fn(str, seed);
		const message = `Expected ${fn.name}('${str}', ${seed}) to be ${expected} but was ${result}.`;
		result.should.equal(expected, message);
	}

	it('x86', () => {
		check(hash_x86_32, "I will not buy this record, it is scratched.", 2832214938);
		check(hash_x86_32, "My hovercraft is full of eels.", 2953494853, 0);
		check(hash_x86_32, "My hovercraft is full of eels.", 2520298415, 25);
		check(hash_x86_32, "My hovercraft is full of eels.", 2204470254, 128);

		check(hash_x86_32, "", 0);
		check(hash_x86_32, "0", 3530670207);
		check(hash_x86_32, "01", 1642882560);
		check(hash_x86_32, "012", 3966566284);
		check(hash_x86_32, "0123", 3558446240);
		check(hash_x86_32, "01234", 433070448);
		check(hash_x86_32, "", 1364076727, 1);

		check(hash_x86_128, "I will not buy this tobacconist's, it is scratched.", "9b5b7ba2ef3f7866889adeaf00f3f98e");
		check(hash_x86_128, "", "00000000000000000000000000000000");
		check(hash_x86_128, "0", "0ab2409ea5eb34f8a5eb34f8a5eb34f8");
		check(hash_x86_128, "01", "0f87acb4674f3b21674f3b21674f3b21");
		check(hash_x86_128, "012", "cd94fea54c13d78e4c13d78e4c13d78e");
		check(hash_x86_128, "0123", "dc378fea485d3536485d3536485d3536");
		check(hash_x86_128, "01234", "35c5b3ee7b3b211600ae108800ae1088");
		check(hash_x86_128, "012345", "db26dc756ce1944bf825536af825536a");
		check(hash_x86_128, "0123456", "b708d0a186d15c02495d053b495d053b");
		check(hash_x86_128, "01234567", "aa22bf849216040263b83c5e63b83c5e");
		check(hash_x86_128, "012345678", "571b5f6775d48126d0205c304ca675dc");
		check(hash_x86_128, "0123456789", "0017a61e2e528b33a5443f2057a11235");
		check(hash_x86_128, "0123456789a", "38a2ed0f921f15e42caa7f97a971884f");
		check(hash_x86_128, "0123456789ab", "cfaa93f9b6982a7e53412b5d04d3d08f");
		check(hash_x86_128, "0123456789abc", "c970af1dcc6d9d01dd00c683fc11eee3");
		check(hash_x86_128, "0123456789abcd", "6f34d20ac0a5114dae0d83c563f51794");
		check(hash_x86_128, "0123456789abcde", "3c76c46d4d0818c0add433daa78673fa");
		check(hash_x86_128, "0123456789abcdef", "fb7d440936aed30a48ad1d9b572b3bfd");
		check(hash_x86_128, "", "88c4adec54d201b954d201b954d201b9", 1);
	});

	it('x64', function() {
		check(hash_x64_128, "I will not buy this record, it is scratched.", "c382657f9a06c49d4a71fdc6d9b0d48f");
		check(hash_x64_128, "I will not buy this tobacconist's, it is scratched.", "d30654abbd8227e367d73523f0079673");
		check(hash_x64_128, "My hovercraft is full of eels.", "03e5e14d358c16d1e5ae86df7ed5cfcb", 0);
		check(hash_x64_128, "My hovercraft is full of eels.", "e85cec5bbbe05ddefccbf1b933fff845", 25);
		check(hash_x64_128, "My hovercraft is full of eels.", "898223700c20009cf8b163b4519c7a35", 128);

		check(hash_x64_128, "", "00000000000000000000000000000000");
		check(hash_x64_128, "0", "2ac9debed546a3803a8de9e53c875e09");
		check(hash_x64_128, "01", "649e4eaa7fc1708ee6945110230f2ad6");
		check(hash_x64_128, "012", "ce68f60d7c353bdb00364cd5936bf18a");
		check(hash_x64_128, "0123", "0f95757ce7f38254b4c67c9e6f12ab4b");
		check(hash_x64_128, "01234", "0f04e459497f3fc1eccc6223a28dd613");
		check(hash_x64_128, "012345", "88c0a92586be0a2781062d6137728244");
		check(hash_x64_128, "0123456", "13eb9fb82606f7a6b4ebef492fdef34e");
		check(hash_x64_128, "01234567", "8236039b7387354dc3369387d8964920");
		check(hash_x64_128, "012345678", "4c1e87519fe738ba72a17af899d597f1");
		check(hash_x64_128, "0123456789", "3f9652ac3effeb248027a17cf2990b07");
		check(hash_x64_128, "0123456789a", "4bc3eacd29d386297cb2d9e797da9c92");
		check(hash_x64_128, "0123456789ab", "66352b8cee9e3ca7a9edf0b381a8fc58");
		check(hash_x64_128, "0123456789abc", "5eb2f8db4265931e801ce853e61d0ab7");
		check(hash_x64_128, "0123456789abcd", "07a4a014dd59f71aaaf437854cd22231");
		check(hash_x64_128, "0123456789abcde", "a62dd5f6c0bf23514fccf50c7c544cf0");
		check(hash_x64_128, "0123456789abcdef", "4be06d94cf4ad1a787c35b5c63a708da");
		check(hash_x64_128, "", "4610abe56eff5cb551622daa78f83583", 1);
	});

	it('x86_32 for strings with characters with multibyte code points', () => {
		// the values below were obtained by hashing the utf-8 bytes with the reference C++ implementation
		check(hash_x86_32, "utf-8 supported 🌈", 2018897981);
		check(hash_x86_32, "這個有效", 3018595841);
	});

	it('x86_128 for strings with characters with multibyte code points', () => {
		// the values below were obtained by hashing the utf-8 bytes with the reference C++ implementation
		check(hash_x86_128, "utf-8 supported 🌈", "796479ed1bbff85b29e39731d1967a07");
		check(hash_x86_128, "這個有效", "5ee7e60516f613aa76048cdc7a1493e3");
	});

	it('x64_128 for strings with characters with multibyte code points', () => {
		// the values below were obtained by hashing the utf-8 bytes with the reference C++ implementation
		check(hash_x64_128, "utf-8 supported 🌈", "61dacbe7a7080feea406afcde9477eed");
		check(hash_x64_128, "這個有效", "a5df1c1a469c566b03c818b95419ed65");
	});

	it('x86_32 does not have collisions when characters share first char code byte', () => {
		// the first byte returned by charCodeAt is identical for P and ⭐
		const asciiHash = murmurHash3.x86.hash32(utf8Bytes("P"));
		const emojiHash = murmurHash3.x86.hash32(utf8Bytes("⭐"));
		asciiHash.should.not.equal(emojiHash, "Collision detected hashing '⭐' and 'P'!");
	});

	it('should take the inputValidation flag into consideration', () => {
		murmurHash3.inputValidation = false;
		murmurHash3.x86.hash32("invalid input").should.not.equal(undefined);
		murmurHash3.x86.hash128(["another", "one"]).should.not.equal(undefined);
		murmurHash3.x64.hash128([1234, 5678, 9999]).should.not.equal(undefined);
		murmurHash3.x86.hash32(10010).should.not.equal(undefined);
		try {
			murmurHash3.x86.hash32(undefined);
		} catch (e) {
			// error expected
		}
		murmurHash3.inputValidation = true;
		(murmurHash3.x86.hash32("invalid input") === undefined).should.equal(true);
		(murmurHash3.x86.hash128(["another", "one"]) === undefined).should.equal(true);
		(murmurHash3.x64.hash128([1234, 5678, 9999]) === undefined).should.equal(true);
		(murmurHash3.x86.hash32(10010) === undefined).should.equal(true);
		(murmurHash3.x86.hash32(undefined) === undefined).should.equal(true);
	});
});
